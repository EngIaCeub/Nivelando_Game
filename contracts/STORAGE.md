# Storage Contract

Adapter: get, put, delete, query, transaction, export, import, migrate.
V1: IndexedDB. localStorage apenas para preferências pequenas.
Export JSON versionado. Migrações não podem apagar progresso silenciosamente.
Chaves de progresso devem incluir examId.

## Atualização atômica por registro (O4)

`update(examId, collection, id, synchronousUpdater)` lê o estado vigente e aplica
a atualização em uma única transação de escrita. O callback recebe uma cópia;
`undefined` significa não gravar. O retorno contém `previous`, `value` e `changed`
(indica gravação), sem referências compartilhadas com o estado persistido.

Callbacks assíncronos, exceções e valores não clonáveis devem rejeitar sem gravação.
IndexedDB só confirma sucesso em `transaction.oncomplete`, não no sucesso isolado
do request. A semântica deve ser equivalente no MemoryStore.

Essa garantia é por registro: não autoriza tratar efeitos posteriores em outros
registros como parte da mesma transação. Projeções e eventos exigem recuperação
idempotente. O plano diário deve permanecer autoritativo em transições concorrentes.

## Mutação serializada e fencing de restore (O4)

Operações compostas de resposta/transição usam `withExclusiveMutation(work)` para
serializar writers entre instâncias/abas do mesmo banco quando Web Locks está
disponível. Restore/reset em produção exigem essa coordenação e falham fechados
quando o navegador não oferece Web Locks.

Substituições atômicas de namespaces incrementam um registro de geração no mesmo
commit. Uma instância que observou geração anterior deve rejeitar mutações compostas
posteriores e solicitar reload; assim uma resposta iniciada antes do restore não pode
reintroduzir efeitos no estado restaurado. A API não substitui as transações atômicas
por registro nem torna várias chamadas primitivas uma operação indivisível.

No IndexedDB, primitivas de escrita também verificam a geração da instância na
mesma transação que aplica seus efeitos. Uma conexão obsoleta não pode gravar,
mesmo fora de um comando coordenado. Falha de leitura e geração malformada rejeitam;
somente registro legitimamente ausente corresponde à geração zero. Essa proteção
por transação complementa a coordenação dos comandos compostos.
