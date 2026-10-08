# Conteúdo validado, tema escuro, telas e contas

Data: 2026-10-07. Status: **implementação faseada em andamento; alterações locais ainda não publicadas**.
Checkout canônico: `C:/CodexProjects/Nivelando_Game`.
Complementa os milestones B2–B7 da Biblioteca e o plano Pixel plataforma V0–V6.
Classificação: COMPLEX, por envolver navegação, identidade, persistência e migração.
O workflow lê as Actions Variables `STUDYOS_SUPABASE_URL` e
`STUDYOS_SUPABASE_PUBLISHABLE_KEY`; ambas podem permanecer vazias para builds locais.

## Resultado esperado

- Conteúdos e flashcards com respostas úteis, fontes verificáveis e revisão factual.
- Tema escuro único, desde o primeiro render, em todas as telas.
- Home Hoje compacta; uma tela de conteúdo por vez, com URLs compartilháveis.
- Cadastro/login por pessoa e progresso pertencente à conta, incluindo domínio global.
- Preservação de sessões, primeira tentativa, revisões, XP, export/import e dados antigos.

Premissas: e-mail como usuário de login, senha e nome de exibição. Login por apelido
exigiria resolução de identidade no servidor e proteção contra enumeração de e-mail.
Fluxo de auth e owner local em implementação; nenhum serviço foi provisionado.

## Diagnóstico reproduzível

Inspeção do código e dos JSONs locais em 2026-10-07; não equivale a revisão factual integral.

| Item TCE-GO | Achado | Consequência |
| --- | --- | --- |
| Flashcards | 102 cartões; todos `validated`, fonte `StudyOS original generator` | Esse rótulo não prova validação editorial |
| Respostas dos cartões | 102 correspondem a `Explique ...` ou `... deve ser estudado por meio de ...` | São instruções genéricas; precisam de pergunta e resposta verificáveis |
| Fonte dos cartões inspecionados | Edital usado como proveniência de explicação | Edital comprova escopo; a resposta exige fonte didática/técnica própria |
| Questões | 289: 279 com fonte do gerador e 10 com referência do edital | Conferir tipo, finalidade e gabarito; não presumir que sejam provas anteriores da FCC |
| Biblioteca | 45 unidades, 20 recursos legados, 0 recursos v2, escopo pending | Nenhuma completude revisada pode ser declarada |
| Validação atual | `validate-content.mjs` valida manifest/curriculum/resources/questions/library | Não carrega flashcards nem possui schema específico deles |
| Segundo pack | TJTO sem `flashcards.json` | Ausência opcional deve ser tratada; dry run precisa de cartões reais de teste |
| Tema | `color-scheme: light`, tokens claros e cores literais espalhadas | Trocar apenas o fundo deixaria estados e controles incompatíveis |
| Navegação | Âncoras rolam uma página contendo todas as seções | Agrupamento no menu não constitui separação em telas |
| Progresso | Banco `studyos-tce-go-ti-2026-v2`; namespace global de mastery | `examId` separa concursos, mas não pessoas |

A auditoria executável agora também percorre questões e recursos. O relatório sinaliza
289/289 questões TCE-GO por revisão editorial pendente e metadados banca/ano sem prova
identificada, e 20/20 recursos sem recorte/revisão editorial registrada. Isso não prova
que todo gabarito esteja errado nem invalida link verificado; indica que ainda não há
base documental para anunciar o banco como questões passadas FCC aprovadas.

## A — Validar conhecimento, materiais e cartões

Atualização de 2026-10-07: lote TCE-GO integrado com 10 questões r2, 64 cartões
atômicos e 34 recortes v2 aprovados por revisores independentes. Pareceres/hashes,
retirada dos templates, continuidade histórica e evidências estão em
`docs/content-review/CURATION_REPORT.md`. Biblioteca partial; A não implica cobertura
integral do edital nem aprovação de auth, migração de contas ou publicação.

### A1 — Inventário e contrato editorial

Inventariar todos os packs, incluindo recursos, unidades, cartões, questões, pools de
simulados e fontes. Gerar relatório por ID com origem, revisão, lacuna e decisão.
Ausência de arquivo opcional é distinta de arquivo vazio, inválido ou falha de leitura.
Revisar 100% dos 102 cartões antes de declarar o catálogo de flashcards aprovado.
Piloto: Português e Desenvolvimento de Sistemas, reaproveitando B3.

Adicionar `contracts/CONTENT_VALIDATION.md` e schemas para flashcard/conjunto e relatório.
Metadados propostos: `contentVersion`, `reviewStatus`, `sourceRefs` com locator,
`editorialReview` com responsável/data/evidência, `validAsOf` quando normativo e
`supersedes` quando necessário. Manter `derived` para autoria original; revisão
aprovada é dimensão independente da origem. Migrar `validated` legado para
`pending_review` editorial, sem atribuir aprovação nova nem modificar histórico.

### A2 — Validação automática

- Schema: IDs, tipos de cartão, frente/verso não vazios, versão e proveniência.
- Integridade: IDs únicos; examId correto; topicIds, conceitos, unidades e fontes
  existentes; pools sem IDs ausentes; alternativa correta única e pertencente às opções.
- Sinais editoriais: respostas instrucionais/genéricas, IDs técnicos no texto ao aluno,
  repetição de template, perguntas ambíguas, duplicatas normalizadas e respostas circulares.
- Normas/tecnologia: versão e data de corte registradas; fontes recentes conforme política.
- Direitos: distinguir original/adaptado/prova oficial; fonte pública não concede licença
  de reprodução. Candidatos sem autorização ficam fora do pacote publicado.
- Link: checar destino, acesso e locator; HTTP 200 não certifica resposta ou cobertura.

`scripts/content-audit.mjs` e o carregamento opcional no `scripts/validate-content.mjs`
foram iniciados. Relatórios não atribuem aprovação factual automaticamente. Alertas
heurísticos exigem decisão documentada; erros de schema,
referência ou gabarito ambíguo bloqueiam promoção.

### A3 — Revisão factual e reescrita

Para cada cartão: um objetivo, pergunta específica, resposta direta, explicação curta
quando necessária e fonte que sustente a resposta no capítulo/seção/timecode usado.
Não substituir a resposta por convite à reflexão. Dividir assuntos amplos em conceitos
atômicos; diferenciar definição, comparação, procedimento, caso e erro comum.

Formato de trabalho: objetivo do edital -> pergunta atômica -> resposta sustentada pelo
recorte da fonte -> explicação e limites -> revisão independente. Cartões sobre banco de
dados devem indicar SGBD/versão e nível de isolamento quando isso mudar a resposta.

Revisão em duas funções: autor/curador e revisor factual independente. Evidência inclui
fonte consultada, recorte, justificativa, data e decisão `approved/rejected/pending`.
Para questões: conferir enunciado, gabarito, distratores, justificativa e finalidade.
Identificar provas FCC autênticas somente quando banca/prova/ano/caderno/número e
gabarito definitivo forem demonstrados. Questões originais são rotuladas como originais.

### A4 — Promoção, histórico e aceite

Novas sessões usam somente itens editorialmente aprovados. Pendências ficam no catálogo
editorial/candidatos, fora do payload ativo; não apagar registros referenciados por sessões
antigas. Preservar ID em ajuste de redação e versionar conteúdo. Alteração de objetivo,
gabarito ou divisão gera nova revisão/ID conforme contrato, com relação de substituição.
Sessões guardam revisão do item e evidência de resposta correspondente; correção posterior
não recalcula score histórico nem concede XP/revisão retroativamente. Definir aviso de
errata e eventual reaprendizado sem destruir o histórico.

Não anunciar cobertura integral só por ter cartões para cada tópico: medir objetivos
cobertos, fontes primárias revisadas e lacunas. Metas de quantidade decorrem dos objetivos.
Aceite: todos os itens promovidos com fonte/recorte e parecer factual; zero template
genérico no payload novo; schemas verdes; segundo pack; sessões antigas preservadas.

## D — Tema escuro único

Atualizar os tokens existentes em `core/styles.css` e as referências do sistema visual.
Proposta inicial de paleta, a medir durante o piloto:

| Papel | Cor proposta |
| --- | --- |
| Fundo | `#101827` |
| Painel | `#182536` |
| Painel selecionado | `#22384A` |
| Texto principal / secundário | `#E6EDF3` / `#ACBDCF` |
| Ação | `#6EE7B7` com texto `#10251D` |
| Foco | `#FBBF24` |
| Borda essencial | `#71869D` |

Definir `color-scheme: dark` e meta theme-color coerente; não criar seletor de tema nem
seguir modo claro do sistema. Acrescentar tokens de texto sobre ação e superfícies de
sucesso/erro/aviso/informação. Migrar todas as cores literais: quiz, flashcards, disclosures,
inputs, select/option, arquivo, feedback, estado vazio, atualização PWA e páginas técnicas.
Remover overrides claros; evitar aplicar filtros CSS de inversão.

Preservar arte original e geometria pixel. Adaptar céu/biomas ao cenário noturno sem
escurecer texto nem usar brilho intenso; superfícies de leitura continuam uniformes.
Piloto Hoje + uma sessão de flashcards; depois migrar as demais telas e login.
Aceite: texto normal >=4,5:1; texto grande e controles essenciais >=3:1; foco em todos
os fundos; desktop/celular/zoom 200%; loading/erro/vazio/disabled/correto/incorreto;
sem clarão claro ao iniciar e reduced-motion respeitado. Não há inspeção visual nova neste plano.

## N — Uma tela ativa por vez

Manter frontend modular em JavaScript e URLs por hash, compatíveis com GitHub Pages.
`core/src/view-router.js` controla registro, rota, foco, título e visibilidade; módulos
de tela recebem serviços por injeção. Site adapter continua dono da configuração do pack.
Preservar hashes atuais e suportar parâmetro de tópico: `#library?topic=<id>`.
Não adotar rotas de caminho que dependam de rewrites do servidor estático.

| Rota | Conteúdo da tela |
| --- | --- |
| `#today` | Retomada, próxima atividade, resumo pequeno de revisões e meta |
| `#plan` | Agenda e orçamento diário/semanal |
| `#subjects` | Matérias e exploração de módulos/tópicos |
| `#library` | Pesquisa, filtros, unidade e fontes |
| `#questions`, `#flashcards` | Uma sessão e seus controles de estudo |
| `#reviews`, `#diagnostic`, `#simulations` | Fluxos respectivos |
| `#progress` | Métricas e histórico da pessoa autenticada |
| `#settings` | Conta, sincronização, backup e configurações |
| `#login`, `#register`, `#recover` | Acesso e recuperação |

Home não monta listas integrais de recursos, matérias, simulados e configurações.
Usar mount/onEnter/onLeave/dispose e carregamento de dados sob demanda. Manter views
de sessão montadas enquanto houver formulário/resposta em andamento; atualizar painéis
por eventos ou entrada na tela, evitando rerender global que perca foco/entrada.
Views inativas recebem `hidden` e ficam fora do teclado e árvore acessível; usar `inert`
quando houver transição que as mantenha visualmente presentes. Shell, status de gravação
e aviso PWA permanecem globais. Bundle local precacheado mantém navegação offline.

Guard de sessão cobre link, voltar/avançar, logout e troca de conta. Apresentar
“Pausar e sair”/“Continuar estudando”; só navegar depois da pausa gravada. Falha de gravação
mantém a tela e o estado; reverter URL sem criar ciclo no histórico. Restaurar deep link
após autenticação, exceto parâmetros de token de auth. Rota inválida tem fallback explícito.
Foco vai ao título/destino; skip link aponta para a view ativa; `aria-current=page`.

Aceite: apenas uma view acessível; home compacta; reload/deep link/back/forward; mesmo
hash com tópico diferente; teclado/móvel; biblioteca->prática->retomada; pausa falha;
offline/atualização PWA e segundo pack. Não reescrever engines de aprendizagem na migração.

## U — Login e progresso por pessoa

Proposta: GitHub Pages mantém HTML/CSS/JS públicos; Supabase Auth autentica e Postgres
persiste progresso privado. Core recebe IdentityProvider e OwnerStorage genéricos;
integração Supabase fica fora do Core, em adapters/serviços compartilhados de sites.
Comparar provider antes da implementação se houver infraestrutura já contratada.

Cadastro: nome de exibição, e-mail, senha, confirmação de e-mail; login, sair e recuperação.
Usar SDK com versão fixada e pacote local no build. Provider armazena/verifica senha;
não criar tabela de senhas, senha em JSON, localStorage ou IndexedDB. Configuração pública
contém apenas URL e chave publicável; chave secret/service-role permanece no servidor.
Configurar redirects de confirmação/recuperação sob o base path real e callback dedicado
que não colida com o hash router. SMTP de produção e limites são pré-requisitos operacionais.

### U1 — Isolamento local e ciclo da conta

UUID do provider identifica a pessoa; nunca e-mail/slug livre como proprietário confiável.
O helper `core/src/identity.js` deriva nome de banco com `examId` e UUID validados.
Criar banco IndexedDB por ownerUUID (e ambiente), mantendo namespaces `examId` e
`__studyos_global__` dentro dele. Assim domínio global significa concursos da mesma
pessoa. Preferências, backups, planos, receipts, locks, gerações, filas e BroadcastChannel
também pertencem a esse owner; não reutilizar chaves do usuário anterior.

Login concluído abre serviços com owner fixo. Troca/logout pausa e aguarda gravação,
invalida geração de identidade, cancela requisições/listeners e fecha conexões antes de
montar outro owner. Escritas atrasadas e refresh de token nunca reassociam dados a outra
conta. Filas pendentes mantêm owner original. Offline não permite novo login com senha;
acesso local de sessão já válida e política para aparelho compartilhado exigem decisão
explícita. Isolamento de bancos ajuda a app; não protege de inspeção por quem controla
o mesmo perfil do navegador. Documentar retenção local e logout sem perder fila pendente.

### U2 — Persistência remota e conflitos

Primeira versão usa snapshots versionados do workspace (concursos, mastery global e
preferências), evitando trocar o adapter atômico local por múltiplas gravações HTTP.
Schema novo de workspace reutiliza as validações de backup. Tabelas propostas:

| Tabela | Responsabilidade |
| --- | --- |
| `profiles` | user_id, nome de exibição e preferências de conta |
| `user_workspaces` | user_id único, payload validado, revision, updated_at |
| `sync_receipts` | user_id, operationId único, revisão e resultado idempotente |
| `first_attempts` | Ledger de primeiras respostas: user_id/examId/runId/questionId/revisão |

RLS exige `auth.uid() = user_id`, grants mínimos e políticas por operação; nenhuma
operação aceita proprietário enviado pelo cliente sem confrontar a sessão. Payload
não inclui senha, tokens ou snapshots brutos de recuperação. Conteúdo dos packs é público;
dados de estudo não entram no repositório, dist ou cache do service worker.

RPC de commit valida schema e invariantes no servidor, compara expectedRevision,
grava snapshot/receipt em transação e preserva primeiras tentativas. Ledger é append-only
via RPC; revogar mutações diretas dos clientes em workspace/ledger/receipts. Reads exigem
RLS. RPC com privilégios elevados fixa search_path, valida auth.uid() e restringe execute
a authenticated; não confiar em user_id do payload. Reutilizar operationId com payload
diferente é erro, não sucesso deduplicado. Unicidade impede duplicação. Identidade e horário do servidor vêm da
sessão/backend; schema client-side sozinho não impõe imutabilidade remota.
O sistema acompanha progresso pessoal; não certifica notas antifraude ou prova oficial.

Sincronizar ao concluir/pausar e por botão, mantendo outbox local durável. Não prometer
sincronização genérica offline do provider. Repetição de requisição é idempotente.
Concorrência entre dispositivos devolve conflito; nunca sobrescrever silenciosamente por
timestamp/last-write-wins. Preservar ambas as versões e reconciliar com receipts/ledger;
se não houver reconciliação comprovada, bloquear upload e permitir export das versões.
First attempts conflitantes do mesmo run/item não são escolhidos por relógio do cliente.
Restore/reset remoto também passa pelo RPC: versão antiga não apaga ledger histórico,
operações pendentes nem fencing. Especificar sua semântica em ADR antes de liberar U2.

### U3 — Migração do progresso existente

Banco legado permanece intacto. Detectar dados sem owner e oferecer, após login,
“Importar progresso deste navegador para minha conta”, com resumo e confirmação de
titularidade. Exportar backup anterior, validar estrutura, copiar para banco novo em
operação idempotente e registrar migração; upload depende de escolha explícita.
Não atribuir o banco legado ao primeiro login automaticamente nem importar para cada
pessoa. Conta com dados existentes exige conciliação; IDs conflitantes não são mesclados
cegamente. Backup novo inclui owner; importar backup de outro owner é transferência
explícita, não simples restore. Nunca trocar a sessão de autenticação por dados do arquivo.

Aceite U: usuário A e B não veem/alteram dados um do outro, inclusive por API direta;
mastery global, backup/restore, aba antiga, fila offline e troca de conta isolados;
senha incorreta/recuperação/expiração/redirect; migração repetida; conflitos e retries;
primeira resposta imutável; zero secrets nos artefatos; staging com dados sintéticos.

## Entregas e ordem de implementação

| Fase | Entrega concreta | Gate |
| --- | --- | --- |
| P0 | ADR proposta e contratos de conteúdo/identidade/sync/rotas; baseline | Decisões e migração revisadas; nenhum acesso real alterado |
| A1–A2 | Implementado parcialmente: schema de flashcards e auditoria heurística | Validação estrutural passou; revisão factual por ID ainda pendente |
| D1 | Tokens escuros e componentes principais implementados | Contraste foi medido; inspeção renderizada em navegador ainda pendente |
| N1 | Router por hash e exibição de uma view implementados | Testes unitários passaram; browser, sessão e offline do release ainda pendentes |
| A3–A4 | Não executado: correção factual e expansão curada | Manter cartões/questões sem promoção até parecer fonte a fonte |
| U1 | Auth adapter, telas de conta e owner local implementados | Projeto provider ausente; execução integrada e migração de dispositivo pendentes |
| U2–U3 | Adapter, SQL RLS/RPC, snapshots e outbox implementados | Testes mockados passaram; aplicar migration e validar autorização/transação em projeto real |
| P1 | Não liberado | QA independente, CI, smoke remoto em perfil limpo e segundo pack |

Curadoria A3 pode avançar enquanto D/N são implementados. Auth só entra em produção
quando U2/U3 comprovarem o comportamento prometido. Tema/telas podem ter release anterior
com escopo explícito. Não usar falhas ou lacunas de conteúdo para alterar histórico do aluno.

Arquivos previstos: `schemas/flashcard*.json`, `contracts/CONTENT_VALIDATION.md`,
`contracts/IDENTITY.md`, `contracts/SYNC.md`, `core/src/view-router.js`, `core/src/views/`,
`core/src/owner-storage.js`, `core/styles.css`, `core/index.html`, adapters de site,
`services/study-api/` ou `supabase/migrations/`, schemas de workspace/backup, builder/PWA,
validadores, fixtures do segundo pack, documentação e skills de QA/release/curadoria.
Os nomes finais de módulos seguem a ADR; não criar sistemas paralelos de tema ou score.

Comandos existentes reutilizáveis: `node scripts/validate-content.mjs`,
`node scripts/content-audit.mjs [--json]`, `node scripts/library-audit.mjs <exam-id>`,
suíte apropriada por fase, build standalone, browser check e scanner. Testes de sync usam
fetch mockado; eles não substituem testes RLS/RPC em projeto provisionado.

Revisão independente futura: conteúdo por curador/revisor factual; navegação e auth/storage
por QA/Architect conforme o gate do projeto. Registrar evidências e limitações em STATUS.
Planejamento não aprova conteúdo, segurança, implementação nem publicação dessas mudanças.

## Fontes da decisão de infraestrutura

- [GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages): hospedagem estática; exige serviço externo para autenticação/dados privados.
- [Supabase password auth](https://supabase.com/docs/guides/auth/passwords): identidade por e-mail/telefone, login e recuperação; SMTP de produção.
- [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security): autorização por linha vinculada ao usuário autenticado.
- [Supabase API keys](https://supabase.com/docs/guides/getting-started/api-keys): distinção entre chave publicável e secret/service-role.

Consultadas em 2026-10-07. Provider é proposta de arquitetura; não há promessa de custo,
plano gratuito suficiente ou projeto provisionado. Antes de U, definir projeto/região,
domínio de auth, SMTP, política offline e operação de backups.
