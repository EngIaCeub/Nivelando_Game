# ADR 003 — Recovery de produção e aprovação independente

Data: 2026-10-03. Status: proposto para revisão independente `gpt-6.1-sol/high` antes da release
(modelo de aprovação atualizado por autorização do usuário em 2026-10-06).

## Contexto

A V1 deve preservar dados O3, exportar mastery global e preferências, restaurar um
snapshot completo e atualizar o cache sem misturar versões. O usuário autorizou
avaliação autônoma por Astra e conclusão do roadmap operacional.

## Decisão

Adicionar APIs genéricas de snapshot/restore atômico, sem mudar o schema físico
IndexedDB quando não necessário. Restore gera backup lógico anterior e substitui
somente os namespaces explicitamente selecionados após validação. Migrations
futuras são N→N+1 testáveis, sem migração artificial para V1.

Service worker usa cache por build/escopo. Um novo worker aguarda atualização
explícita; a UI protege atividades em andamento. Excluir somente caches StudyOS
do escopo, nunca IndexedDB ou caches de outras aplicações.

QA/Architect usando `gpt-6.1-sol/high` avalia os gates independentemente; o Orchestrator só encerra
após provas locais e remotas. O5 será validação automatizada em uso simulado,
sem alegar participação humana ou acompanhamento longitudinal.

## Consequências

### Complementos de concorrência — aguardando QA independente do candidato integrado

Revisão arquitetural Laplace (`gpt-6-astra/high`, 2026-10-03) exige uma operação
genérica `update(examId, collection, id, synchronousUpdater)` atômica por registro.
O callback recebe uma cópia do estado atual; `undefined` não grava. Promises,
exceções e falhas de clonagem rejeitam sem alteração. A resposta só confirma a
gravação após commit e preserva uma cópia independente de `previous`.

O plano diário é autoritativo para transições e totais. Projeções de atividade,
eventos e XP devem ser reparáveis por replay idempotente; atomicidade por registro
não equivale a uma transação envolvendo todos esses efeitos.

Cada intenção de resposta precisa de identidade durável, persistida antes dos
efeitos. O recibo de scoring e a tentativa, inclusive a primeira, devem ser
gravados atomicamente. Replay da mesma operação não cria tentativa; reutilização
incompatível da identidade deve falhar. Backups novos preservam recibos e pending;
backups antigos continuam legíveis sem inventar recibos retrospectivos.

Implementação integrada após revisões: export exam/global usa snapshot readonly
consistente; mastery/revisões mesclam atomicamente com estado vigente e recibos de
operação; respostas diagnósticas derivam amostragem/adaptive queue do run vigente.
Operações compostas usam Web Locks entre abas e fencing por geração transacional;
restore/reset exigem suporte de lock e instâncias anteriores ao restore ficam
obsoletas. Regressões de browser usam IndexedDB/Web Locks nativos.

O candidato corrigido ainda exige nova aprovação independente com `gpt-6.1-sol/high` e, depois,
validação remota. Estes testes locais não autorizam publicação nem iniciam O5.

Contratos de score, eventos, mastery e isolamento permanecem válidos. Snapshots
incluem dados globais de forma explícita. Nenhuma regra de edital entra no Core.
Os testes precisam cobrir rollback, import inválido intacto e upgrade O3→V1.

### Complemento após FAIL Harvey — em implementação

Proteger somente algumas operações StudySession foi insuficiente: start/save,
planner, diagnóstico direto e leitura também escrevem. O parecer independente
`gpt-6-astra/high` exige uma fronteira de coordenação por comando público de
mutação. Chamadas internas compartilham um contexto explícito, restrito ao store
e ao tempo de vida do comando; não se usa flag global de reentrância.

Além do lock externo, cada transação de escrita deve conferir a geração esperada
antes de aplicar seus efeitos. Falhas de leitura/capacidade e geração malformada
rejeitam; somente ausência legítima de registro corresponde à geração zero.
Comandos de UI devem atualizar o registro vigente, evitando salvar snapshots
capturados antes de outras operações. Comparações de backup projetam o mesmo
conjunto de dados em ambos os lados e verificam a geração separadamente.

Este desenho responde aos repros do QA; aprovação da implementação permanece
pendente de novas regressões executadas e revisão independente.
