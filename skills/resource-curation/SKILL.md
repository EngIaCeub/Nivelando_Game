---
name: resource-curation
description: Curar e manter livros, apostilas, documentação, cursos e videoaulas por conteúdo dos Exam Packs do StudyOS, com proveniência, acesso, licença e cobertura didática.
---
# Curadoria da biblioteca
Leia contracts/DIDACTIC_LIBRARY.md e o library.json do pack; para o aceite use
docs/runbooks/DIDACTIC_LIBRARY_ACCEPTANCE.md. Não modificar escopo global ou IDs
curriculares durante a curadoria. Se ainda não existir biblioteca, obter a decomposição
do Curriculum e manter scopeReview pending até conferir todos os itens do edital.

Para cada unidade, buscar fontes com recorte apropriado; abrir o material e conferir
capítulo/aula, autoria, acesso e edição. Priorizar português e fonte gratuita.
Snippet e HTTP 200 não aprovam conteúdo. Registrar limitações de cadastro e idioma.
Novos registros usam libraryVersion:2 conforme schemas/resource.schema.json.
Candidatos pendentes/rejeitados ficam em library-candidates.json; promover para
resources.json apenas após checagem e revisão, mantendo id estável e sem duplicatas.
Não promover fonte institucional genérica como primary/full sem conteúdo pedagógico.

Nesta versão registrar delivery:link. Embed/bundle depende da entrega B5 e do
contrato de autorização/checagem local; não promover tais candidatos agora.
Preservar histórico de troca, reviewedAt e verification.checkedAt reais; não inventar
autoria, duração, disponibilidade ou permissão. Para norma registrar corte e versão.
Rever links vencidos conforme política; bloqueio/login/timeout são pendências.

Executar node scripts/library-audit.mjs <exam-id> e validação de schemas.
A saída deve informar fontes selecionadas, lacunas, recortes e evidências de leitura.
Usar --require-complete somente para a entrega que pretende satisfazer completude.
Não alterar questões, progresso, XP ou score nesta skill. Não inferir autorização para
compras, inscrição em cursos, upload de material ou agendamento de monitoramento.
