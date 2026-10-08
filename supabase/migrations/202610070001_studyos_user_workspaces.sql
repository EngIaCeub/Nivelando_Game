-- Private account workspaces. The browser can read its own snapshot, but all writes
-- must pass through commit_studyos_workspace so revision, receipts, and first attempts
-- are checked in one transaction.

create table if not exists public.user_workspaces (
  user_id uuid primary key references auth.users(id) on delete cascade,
  revision bigint not null default 0 check (revision >= 0),
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  updated_at timestamptz not null default now()
);

create table if not exists public.studyos_sync_receipts (
  user_id uuid not null references auth.users(id) on delete cascade,
  operation_id uuid not null,
  payload_hash text not null,
  revision bigint not null,
  created_at timestamptz not null default now(),
  primary key (user_id, operation_id)
);

create table if not exists public.studyos_first_attempts (
  user_id uuid not null references auth.users(id) on delete cascade,
  exam_id text not null,
  attempt_id text not null,
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  created_at timestamptz not null default now(),
  primary key (user_id, exam_id, attempt_id)
);

alter table public.user_workspaces enable row level security;
alter table public.studyos_sync_receipts enable row level security;
alter table public.studyos_first_attempts enable row level security;

drop policy if exists studyos_workspace_select_own on public.user_workspaces;
create policy studyos_workspace_select_own on public.user_workspaces
  for select to authenticated using (user_id = (select auth.uid()));

revoke all on public.user_workspaces, public.studyos_sync_receipts, public.studyos_first_attempts from public, anon, authenticated;
grant select on public.user_workspaces to authenticated;

create or replace function public.commit_studyos_workspace(
  expected_revision bigint,
  operation_id uuid,
  workspace_payload jsonb
) returns jsonb
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  v_user uuid := auth.uid();
  v_hash text;
  v_revision bigint;
  v_receipt public.studyos_sync_receipts%rowtype;
  v_exam record;
  v_score jsonb;
  v_attempt_id text;
  v_existing jsonb;
begin
  if v_user is null then raise exception 'authentication required' using errcode = '42501'; end if;
  if expected_revision is null or expected_revision < 0 or operation_id is null then
    raise exception 'invalid sync operation' using errcode = '22023';
  end if;
  if workspace_payload is null or octet_length(workspace_payload::text) > 5000000
     or jsonb_typeof(workspace_payload) <> 'object'
     or workspace_payload->>'schemaVersion' <> '1'
     or jsonb_typeof(workspace_payload->'exams') <> 'object'
     or jsonb_typeof(workspace_payload->'globalData') <> 'object' then
    raise exception 'invalid workspace snapshot' using errcode = '22023';
  end if;

  v_hash := md5(workspace_payload::text);
  insert into public.user_workspaces(user_id, revision, payload)
    values (v_user, 0, jsonb_build_object('schemaVersion', 1, 'exams', '{}'::jsonb,
      'globalData', jsonb_build_object('version', 1, 'records', '[]'::jsonb)))
    on conflict (user_id) do nothing;
  select revision into v_revision from public.user_workspaces where user_id = v_user for update;

  select * into v_receipt from public.studyos_sync_receipts
    where user_id = v_user and operation_id = $2;
  if found then
    if v_receipt.payload_hash <> v_hash then raise exception 'operation id reused with another payload' using errcode = '22023'; end if;
    return jsonb_build_object('revision', v_receipt.revision, 'replayed', true);
  end if;
  if v_revision <> expected_revision then
    raise exception 'workspace revision conflict: expected %, found %', expected_revision, v_revision using errcode = '40001';
  end if;

  -- Every exam snapshot includes its score projection. Refuse to delete or rewrite
  -- a first attempt already accepted by this server.
  for v_exam in select key, value from jsonb_each(workspace_payload->'exams') loop
    if v_exam.value->>'examId' <> v_exam.key
       or jsonb_typeof(v_exam.value->'data'->'collections'->'scores') <> 'array' then
      raise exception 'invalid exam snapshot' using errcode = '22023';
    end if;
    for v_score in select value from jsonb_array_elements(v_exam.value->'data'->'collections'->'scores') loop
      v_attempt_id := v_score->>'id';
      if v_attempt_id is null or jsonb_typeof(v_score->'value') <> 'object'
         or jsonb_typeof(v_score->'value'->'correct') <> 'boolean'
         or v_score->'value'->>'simulationRunId' is null
         or v_score->'value'->>'questionId' is null
         or v_score->'value'->>'answeredAt' is null then
        raise exception 'invalid first attempt record' using errcode = '22023';
      end if;
      select payload into v_existing from public.studyos_first_attempts
        where user_id = v_user and exam_id = v_exam.key and attempt_id = v_attempt_id;
      if found and v_existing <> v_score then
        raise exception 'first attempt is immutable' using errcode = '23514';
      end if;
      if not found then
        insert into public.studyos_first_attempts(user_id, exam_id, attempt_id, payload)
          values (v_user, v_exam.key, v_attempt_id, v_score);
      end if;
    end loop;
  end loop;
  if exists (
    select 1 from public.studyos_first_attempts saved
    where saved.user_id = v_user
      and not exists (
        select 1 from jsonb_each(workspace_payload->'exams') exam
        where exam.key = saved.exam_id
          and exists (select 1 from jsonb_array_elements(exam.value->'data'->'collections'->'scores') score where score.value->>'id' = saved.attempt_id)
      )
  ) then raise exception 'workspace snapshot cannot remove first attempts' using errcode = '23514'; end if;

  v_revision := v_revision + 1;
  update public.user_workspaces set revision = v_revision, payload = workspace_payload, updated_at = now()
    where user_id = v_user;
  insert into public.studyos_sync_receipts(user_id, operation_id, payload_hash, revision)
    values (v_user, operation_id, v_hash, v_revision);
  return jsonb_build_object('revision', v_revision, 'replayed', false);
end;
$$;

revoke all on function public.commit_studyos_workspace(bigint, uuid, jsonb) from public, anon;
grant execute on function public.commit_studyos_workspace(bigint, uuid, jsonb) to authenticated;
