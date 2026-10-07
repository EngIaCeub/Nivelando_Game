# Biblioteca didática — execução

Escopo desta entrega: arquitetura e ferramentas de auditoria. Curadoria factual,
interface da biblioteca e publicação dos materiais terão entregas próprias.

Atualização em 2026-10-06: a consulta genérica e a interface de B5 foram integradas ao
standalone durante o plano Pixel plataforma. Busca, filtros, unidades, proveniência,
lacunas e links contextuais estão disponíveis na prévia local. Isso não aprova B5
integralmente nem conclui B2–B4/B6: os packs seguem `planned` e sem recursos v2 revisados.
Consulte `docs/design/PLATFORM_IMPLEMENTATION_REPORT.md` para evidências e gates pendentes.

## Sequência e critérios
| Etapa | Entrega | Aceite |
| --- | --- | --- |
| B1 arquitetura | contrato, schemas aditivos, ADR, skill, papéis, auditor | legado válido, lacunas reais identificadas, instruções executáveis |
| B2 escopo | decompor itens do edital em unidades, objetivos e prerequisitos | fontes/páginas registradas e revisão de todos os itens; IDs curriculares mantidos |
| B3 piloto | duas disciplinas configuradas no library.json | unidades com recurso primário gratuito revisado; lacunas explícitas; usar desenvolvimento e português no primeiro pack |
| B4 curadoria | expansão às demais disciplinas por peso e lacuna | referência específica, acesso/licença e checagem; nenhuma aprovação por HTTP somente |
| B5 interface | biblioteca por tópico, busca e filtros; integração com Hoje | formato, idioma, acesso, capítulo/aula, estado e necessidade de internet visíveis; teclado/mobile/Pixel UI |
| B6 aceite | cobertura integral e segundo pack | auditoria completa, QA editorial independente, genericidade, offline do catálogo e persistência |
| B7 manutenção | revisão por prazo e histórico de alterações | links e versões rechecados; pendências, substituições e responsáveis registrados |

## Implementação runtime prevista
Adicionar serviço genérico de consulta de recursos, sem conteúdo do concurso no Core.
Expor busca por título/tópico, filtros por formato/idioma/acesso e ordenação por role.
Trilha do tópico: objetivo, pré-requisito, material principal, referência, vídeo,
complemento e prática. Mostrar chapter/timecode diretamente junto ao link.
Links abrem a fonte com proteção de navegação; não baixar livros/vídeos automaticamente.
O build atual já copia library.json e guarda esses metadados inertes no cache;
o app ainda não os carrega nem apresenta biblioteca. B5 integra loader e UI.
Jamais empacotar library-candidates.json. Não misturar completude do catálogo e progresso.
Antes de adicionar favoritos/notas/conclusão de leitura, definir eventos/storage,
migração e backup; validar round-trip e não premiar clique ou tempo ocioso.

## Curadoria
Priorizar português, gratuidade e aderência ao edital. Preferir instituições públicas,
universidades, documentação oficial e autores com distribuição autorizada. Registrar
idioma estrangeiro quando for a melhor opção e procurar alternativa acessível.
Livros comerciais podem ser referência complementar com página oficial de aquisição;
jamais considerar recurso pago como única cobertura quando freePrimaryRequired=true.
Não há meta de número de links: cobertura é por unidade e conteúdo lido/revisado.
Fontes para legislação devem respeitar a data de corte do pack.
Não alegar que um livro inteiro foi lido quando só o capítulo usado foi conferido.

## Comandos
`node scripts/library-audit.mjs <exam-id>` produz diagnóstico JSON no stdout, sem rede.
`node scripts/library-audit.mjs <exam-id> --require-complete` bloqueia cobertura incompleta.
`node scripts/library-audit.mjs <exam-id> --output <arquivo.json>` salva evidência.
`node scripts/validate-content.mjs` valida schemas e referências onde disponível.
Consultar docs/runbooks/DIDACTIC_LIBRARY_ACCEPTANCE.md antes de declarar B6.
Estes milestones complementam a V1; não criam gates Fxx nem reabrem gates aprovados.
