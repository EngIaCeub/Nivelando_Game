# O4 — Production Release Report

Status em 2026-10-06: correções integradas, 175/175 testes aprovados; revisão independente
Sol 6.1/high em andamento. Publicação e smoke remoto pendentes. Histórico abaixo preservado.

Após renovação do limite, Laplace concluiu a revisão: FAIL. Reproduziu leitura
pausada com atividade nula aceita no restore, duração `actualMinutes` inválida,
intenção sem timestamp e recibos/identidades inconsistentes. Hume corrige a
validação e suas regressões. O Orchestrator mantém controles de recuperação
acessíveis antes de renderizar os dados de estudo e adiciona prova no navegador.
Os resultados 103/103 e 20/20 precedem esta nova rodada e não aprovam o gate.
O primeiro candidato `e6fe78b765f0df11815e79b9311edfc23638ce24` foi reprovado em 2026-10-03.
As correções foram feitas em working tree derivado desse commit; ainda não há novo commit de release.

## Entregas

- versão formal `1.0.0`, canal `production` e metadata genérico de build;
- Exam Pack TCE-GO versionado como `1.0.0`;
- backup/restore JSON com validação, resumo, backup automático e reload controlado;
- reset protegido por `RESETAR`;
- registro genérico de migrations determinísticas N→N+1;
- cache PWA versionado, atualização discreta e separação do staging;
- ajuda, onboarding contextual e diagnóstico técnico;
- workflow Pages convertido em release gate, com testes, preview e scan de secrets;
- Suíte completa mais recente: 96/96 aprovada, incluindo testes O4 de backup/restore,
  schemas JSON Schema 2020-12, PWA, atualização nativa O3→V1 e staging.
- Browser smoke isolado: 20/20 checks aprovados; `docs/O4_BROWSER_EVIDENCE.json` registra
  UI/teclado em 375/390/430/1280 px, score/retentativa, mastery/XP, pausa/reload,
  diagnóstico, flashcards, simulado, backup round-trip, restore inválido sem mutação,
  offline real, IndexedDB legado v1/v2 e integridade diagnóstica somente leitura.
- Schema/factory: TCE-GO (289 questões), TJTO (3) e template validados.
- Security scan: 277 arquivos examinados, nenhum segredo encontrado.
- Regressões adicionais: 32 respostas simultâneas no mesmo run/questão produzem uma primeira
  tentativa imutável e 31 retentativas distintas; preferências inválidas no envelope e no
  storage embutido são rejeitadas antes do restore.
- Service worker nativo: bridge de upgrade O3 explícita, cancelamento preserva outra aba,
  dados legados permanecem byte-a-byte; V1 funciona offline e não apaga caches de outro escopo.
- Workflow ajustado para buscar a tag `o3-content-stable` ao executar a prova de upgrade.
- Preparação remota: autenticação GitHub válida; API Pages retorna
  `https://engiaceub.github.io/Nivelando_Game/` e `build_type: workflow`. As cinco versões
  fixadas de Actions foram conferidas pela API. Branch remota permanece no baseline O3.
- Links: 17/20 URLs acessíveis na verificação registrada em `O4_LINK_CHECKS.json`.
  Constituição, LGPD e Marco Civil no Planalto seguem sem revalidação nesta rede;
  nova tentativa HEAD com redirects encerrou por timeout (15 s por URL). A proveniência
  anterior não foi alterada; esta limitação de disponibilidade permanece explícita.

## Preservação

Não houve alteração específica no algoritmo de score. A primeira tentativa permanece
imutável, retentativas não alteram o histórico, mastery continua separado e XP segue idempotente.
O Core recebeu apenas utilitários genéricos de produção; nenhum dado do TCE-GO foi adicionado a ele.

## Gate independente Astra — candidato reprovado

- Backup não incluía mastery global e preferências.
- Export truncava IDs compostos de score, permitindo nova primeira tentativa após restore.
- Restore era merge sem atomicidade/rollback; validação de schema incompleta.
- Precache omitia imports obrigatórios e cleanup removia caches de outras aplicações.
- Atualização ativava worker sem esperar ação explícita do estudante.
- Diagnóstico separado do banco principal e health check escrevia score/XP nos dados reais.
- Flashcards/simulações/revisões/analytics sem fluxo completo na UI de produção.
- Conclusão repetida gerava XP duplicado e mudança de meta podia regenerar plano e
  perder a contabilização diária.

Owners das correções: Ptolemy (storage/backup), Dalton (build/PWA), Halley (UX/Today),
Socrates (navegador isolado). Avaliador: Leibniz, modelo `gpt-6-astra`. Orchestrator
bloqueou publicação e avanço para O5 até testes, smoke e nova revisão comprovados.

## Pendências do gate

### Retomada técnica em 2026-10-03

- Hume entregou validação profunda de atividades, sessões, respostas diagnósticas,
  efeitos pendentes e recibos; backups legados válidos e estudo extra com recurso
  nulo continuam aceitos. Testes de backup/schema/IndexedDB: 16/16.
- Fermat entregou atualização atômica de planos em duas conexões IndexedDB e recibos
  de resposta duráveis. Regressões cobrem primeira tentativa, retentativa após crash,
  export/restore, concorrência e reparo idempotente de projeções.
- Integração: Core/Exam Packs 81/81; suíte completa 103/103, zero falhas e zero skips,
  executada com Edge nativo via `STUDYOS_CHROMIUM_EXECUTABLE`. Schemas/factory dos três
  packs aprovados; standalone/staging regenerados para `/Nivelando_Game/`.
- Scan atualizado: 278 arquivos, nenhum achado; `git diff --check` aprovado.
- O primeiro smoke desta rodada marcou 19/20 porque seu validador simplificado não
  suportava `if/then`. O teste agora usa Ajv JSON Schema 2020-12 já fixado nas
  dependências, sem remover verificações. Repetição aprovada: 20/20; offline real,
  PWA, round-trip, upgrade O3→V1, layouts móveis e teclado registrados em
  `O4_BROWSER_EVIDENCE.json` (build local, não é prova de publicação).
- Laplace (`gpt-6-astra/high`) teve a revisão do candidato integrado interrompida por
  limite de uso. A tentativa de retomada solicitada pelo usuário retornou o mesmo
  erro. Nenhuma aprovação local de gate, publicação, validação remota ou tag foi
  emitida nesta retomada; é necessário recuperar disponibilidade para a revisão.
- Limites a avaliar: leituras separadas de exame/global no export e atualizações de
  mastery entre sessões concorrentes não são resolvidas pelo recibo de scoring.

### Histórico da reprovação anterior

Revisão Meitner (`gpt-6-astra/high`, roteamento confirmado no registro da sessão) em
2026-10-03: **FAIL local**. Casos reproduzidos após a suíte 96/96 e smoke 20/20:

- P1: backup com `today-plans.activities: [null]` aceito e bootstrap quebrado após reload.
- P1: conclusões concorrentes de duas atividades em conexões IndexedDB distintas perdem
  uma conclusão/minutos no plano diário.
- P2: falha após persistir retentativa seguida de retomada cria outra retentativa sem resposta nova.

Owners anteriores Dirac/Raman foram interrompidos pelo limite de uso. Retomada em
2026-10-03: Hume (`gpt-6-luna/high`) para validação semântica do backup e regressões;
Fermat (`gpt-6-luna/high`) para atomicidade de plano e recuperação idempotente.
Os resultados anteriores cobrem o candidato anterior e não encerram estes novos blockers.

- Nova reavaliação independente Astra aguarda as correções. A revisão concluída de Meitner
  (`01a10071-276a-7090-aadf-971ec2c8d2fb`). O registro `turn_context` da sessão confirma
  `model: gpt-6-astra`, `effort: high`. A conclusão anterior de que a ferramenta recusara o
  override era incorreta: autodescrição genérica GPT-6 não comprova falha de roteamento.
  Os pareceres interrompidos continuam sem veredito; a revisão efetiva acima reprovou o candidato.
- Confirmar working tree revisada, scan de segredos e suíte em estado limpo.
- Commitar e publicar somente após QA local aprovado; acompanhar GitHub Actions e Pages.
- Executar browser smoke remoto contra o SHA efetivamente publicado e conferir metadata/
  diagnóstico, PWA, IndexedDB, persistência e simulatedScore.
- Criar tag `v1.0.0` somente depois do smoke remoto aprovado. Preservar a tag O3.
- Não iniciar O5 até a aprovação formal O4.

### Retomada integrada 2026-10-04

- Recuperação de estado local corrompido foi fortalecida com envelope bruto
  `studyos-recovery`, separado do schema de backup normal; a captura ocorre na mesma
  transação IndexedDB que substitui namespaces. Importação normal não aceita esse envelope.
- Suíte total: 132/132 aprovada (zero falhas/skip); validação dos packs: TCE-GO (289
  questões), TJTO (3) e template válidos. `git diff --check` aprovado e scan de padrões
  de secrets sem correspondências.
- Browser check local: 21/21 aprovado. Evidência detalhada em
  `docs/O4_BROWSER_EVIDENCE_FINAL.json`, com offline real, IndexedDB O3 v1/v2, restore
  e recuperação, score/retake/XP, health somente leitura, mobile e teclado.
- O checker precisava carregar `app.js` para cenários de service worker e teclado; o
  servidor de teste o removia do HTML em contextos isolados. O harness agora serve o
  HTML produzido nesses cenários. Nenhuma verificação foi relaxada.
- Veredito independente Astra `gpt-6-astra/high`: FAIL. Encontrou P1 no banco diagnóstico,
  P2 no filtro do recovery e P2 no checker remoto. Outra revisão paralela reproduziu P1
  de perda de mastery/revisão após replay concorrente; seu roteamento exato não foi
  confirmado, então não é contabilizada como QA Astra.
- Correções implementadas: banco diagnóstico agora recebe validação semântica + JSON
  Schema; recuperação é filtrada por examId; replay usa `operationId` persistido e `store.update`
  transacional para mesclar mastery/revisões ao estado atual; checker remoto nunca serve
  `dist/index.html` local. Foram adicionadas regressões para cada achado.
- Pós-correções: suíte **135/135** (zero falhas/skip), schemas/factory TCE-GO (289), TJTO
  (3) e template válidos, browser smoke local **21/21**, build standalone/staging regenerados.
  Evidências anteriores reproduzem o candidato anterior; QA Astra novo ainda pendente.
- O resultado local não constitui aprovação O4: não publicar, criar tag ou iniciar O5 até
  novo PASS Astra independente. Smoke remoto e Actions continuam pendentes.

### Continuação integrada — 2026-10-04

- Revisão manual identificou que a chave de idempotência de respostas legadas sem
  `operationId` não incluía a sessão; agora inclui `run.id`. Regressão reproduz duas
  sessões com o mesmo item e timestamp, preservando contagens e revisões.
- Suíte integrada: **136/136**, zero falhas/skip. Packs TCE-GO (289 questões), TJTO (3)
  e template passaram schema/factory. Builds standalone e staging regenerados.
- Browser smoke local repetido: **21/21**. `O4_BROWSER_EVIDENCE_FINAL.json` registra
  `commitSha: local`; teste local, não evidência remota/publicada.
- `git diff --check` passou e scan de padrões de credenciais não encontrou correspondências.
- QA Astra `gpt-6-astra/high` atingiu limite antes de revisar o candidato corrigido. Não há
  novo veredito PASS; permanece vigente o FAIL anterior. O4 não pode ser publicado/tagueado;
  O5 não iniciado.

### Segunda rodada de correções — 2026-10-04

- Respostas de estudo: reserva da pendência e confirmação agora usam update atômico da
  sessão; a classificação first-attempt/retake vem do resultado transacional do score.
  Teste nativo IndexedDB com duas conexões cobre disputa simultânea e retentativa concorrente.
- Diagnóstico/mastery: aplicação deriva do estado atual dentro da transação e persiste recibo
  idempotente com namespace do exame. Testes reproduzem interleaving com quiz concorrente,
  falha ao gravar o assessment completed e reuso do mesmo assessmentRunId em dois exames.
- Regressão de crash/backup foi atualizada para injetar falha na confirmação via update (sem
  relaxar a expectativa). Builds regenerados; 140/140 testes e 21/21 browser checks passaram.
- Nova revisão independente Astra `gpt-6-astra/high` solicitada; candidato congelado durante
  QA. Sem novo veredito, O4 não aprovado; deploy, tag e O5 continuam bloqueados.

### Terceira rodada de correções — 2026-10-04

- Transições de StudySession agora fazem updates atômicos sobre a sessão persistida. Testes
  nativos de IndexedDB cobrem pause concorrente com falha depois do score, `next` diante de
  retentativa pendente, e `finish` concorrente com retentativa; nenhum estado é sobrescrito.
- Export de backup lê Exam Pack e mastery global em uma única transação readonly no IndexedDB.
  A regressão demonstra que a implementação antiga aceitava gerações incompatíveis e confirma
  isolamento de namespaces alheios. Projeção de mastery no resultado diagnóstico é validada no
  schema e semanticamente no restore.
- Retry da conclusão diagnóstica repara eventos completion/mastery faltantes, idempotente e
  preservando a projeção original para o payload histórico.
- Integração: **145/145** testes, schemas/factory dos três packs aprovados e browser smoke local
  **21/21**. Builds standalone/staging regenerados. Evidência do smoke marca `commitSha: local`.
- O próximo gate é nova revisão independente Astra `gpt-6-astra/high`. O4 ainda sem PASS; não
  publicar nem criar tag enquanto QA e smoke remoto não forem aprovados.

### Quarta rodada e revisão Harvey

- Candidato local passou 147/147 testes e schema/factory. Standalone/staging foram
  regenerados. Smoke local: 20/21; a identificação por SHA exato falhou com metadata
  `commitSha: local`. Esse resultado não constitui validação de publicação.
- Harvey, invocado com `gpt-6-astra/high`, confirmou testes e reproduziu falhas de
  gravação após restore em start/save de sessão, planner e diagnóstico direto.
  Também reproduziu fallback inseguro de geração e comparação assimétrica no checker.
- Veredito: **FAIL local**. Correções delegadas com ownership separado para storage,
  checker e coordenação entre comandos. Exigir nova evidência e revisão independente.
- Nenhum commit/deploy/tag realizado; O5 não iniciado.

### Continuação após limite de uso dos agentes

Checker corrigido para restores repetidos. Storage agora rejeita erros de geração
e verifica geração dentro das transações primitivas de escrita. Regressão nativa
cobre conexão obsoleta em seis caminhos; suíte integrada **152/152**, sem skips.

Bacon/Luna e Maxwell/Sol foram interrompidos pelo limite de uso. Coordenação por
comando entre engines/UI permanece incompleta; helper mutation-context ainda não
integrado. Builds e smoke precisam ser regenerados/repetidos após essa integração.
O FAIL independente permanece vigente; nenhuma release foi aprovada ou publicada.

### Integração concluída e reavaliação — 2026-10-06

- Comandos públicos das engines e UI agora compartilham contexto explícito de mutação,
  com lock único por comando, fencing transacional e rejeição de geração inválida.
- Suíte completa reexecutada: **175/175**, zero falhas/skip. Schemas dos três packs válidos;
  scan de secrets em 294 arquivos sem achados. `git diff --check` aprovado.
- Browser smoke local repetido: **20/21**; os 20 fluxos funcionais passaram, incluindo
  dois restores, comparação simétrica e incremento de geração +1. O único FAIL é SHA
  exato do commit, pois o build local identifica `commitSha: local`; exige build após
  commit e smoke remoto. Evidência `docs/O4_BROWSER_EVIDENCE_FINAL.json`.
- Revisor independente Gauss (`gpt-6.1-sol/high`) aprovou o candidato após os fixes.
  Controle negativo reproduziu o defeito antigo; candidato corrigido preservou a preferência
  90 no envelope, snapshot e estado restaurado. 160 exports concorrentes com 120 gravações
  atômicas não misturaram preferências, exame ou dados globais. Score, XP, replay, rollback,
  fencing e geração inválida passaram. O4 aprovado localmente; release remota ainda pendente.
- A revisão reproduziu preferência diária desatualizada no envelope do backup quando outra
  aba salvava uma meta nova. Exportação agora prioriza a preferência incluída no snapshot
  consistente do IndexedDB; a regressão real de duas abas passou. Suíte completa atualizada:
  **177/177**, sem falhas ou skips. Smoke local após o fix: **20/21**, com todos os fluxos
  funcionais passando; somente o SHA exato do commit aguarda build/deploy. Nova revisão
  independente está checando concorrência de export e sensibilidade do teste ao bug anterior.
