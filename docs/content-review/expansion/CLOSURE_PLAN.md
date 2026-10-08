# Plano de fechamento da curadoria e avanço de milestone

**Plano atual das pendências:** [REMAINING_GAPS_PLAN.md](REMAINING_GAPS_PLAN.md).
As baselines numéricas abaixo registram o histórico da execução; use o plano atual
para a sequência de aceite a partir do candidato de 209/209 unidades.

**Baseline inspecionada:** 2026-10-08
**Pack:** `tce-go-ti-2026`
**Objetivo:** fechar a curadoria da biblioteca sem declarar cobertura sem evidência e, depois, avançar para o aceite B6.

## Baseline que governa este plano

| Artefato | Estado observado | Implicação |
| --- | --- | --- |
| Pack ativo | `partial`; 209 unidades; 119 cobertas; 90 lacunas; 167 recursos v2 | É o que o site consome hoje. |
| Candidato atual | SHA-256 `d4262062617c4df45cc531126e39f1750b1c5328ce812dd1676d382b87dd5210`; `partial`; 168/209 unidades cobertas; 41 lacunas; 256 recursos; 26/45 tópicos completos | Ainda não promovido. |
| QA independente | Aprova o SHA `f8d866867421decf550fad8575af1a74845845e1a554555b97cc09a7fdc69bfc` | Não aprova o candidato atual nem uma declaração `complete`. |
| Questões TCE-GO | 45 ativas; pareceres registram as 35 novas como aprovadas | Preservar os itens e os pareceres vinculados aos hashes. Não reabrir os 279 templates rejeitados. |
| Flashcards TCE-GO | 64 ativos e aprovados no lote editorial; os 102 genéricos foram retirados do catálogo ativo | Conferir IDs/hashes na reconciliação, sem reintroduzir o legado. |
| Segundo pack | O `STATUS.md` registra pendências factuais de conteúdo TJTO | Resolver ou limitar formalmente o dry run B6 ao que for validado; não tratar o pack como aprovado por ser estruturalmente válido. |

O inventário das 41 lacunas, com objetivos, justificativas e fontes candidatas, é `STAGED_PACK.json` → `gaps`. Os números 102 flashcards e 289 questões encontrados em documentos antigos descrevem o legado pré-curadoria, não o catálogo ativo atual. Reconciliar referências históricas sem sobrescrevê-las.

## Fase 0 — congelar baseline e reconciliar status

1. Guardar cópia/hash do candidato, do pack ativo, dos três pareceres de domínio, dos pareceres de questões e da QA existente.
2. Gerar um ledger único de 41 linhas a partir de `STAGED_PACK.json.gaps`: `unitId`, `topicId`, objetivo, evidências já lidas, lacuna residual, próxima fonte a investigar, curador, revisor independente e decisão.
3. Preservar os três estados separados: catálogo ativo, candidato atual e estado editorial por unidade. Não misturar “resource aprovado” com cobertura `primary/full`.
4. Corrigir/append-only as notas de status que ainda reportam a baseline anterior; não editar relatórios históricos como se seus hashes ou contagens fossem atuais.

**Saída:** baseline assinada por hash, 41 IDs sem duplicata e uma fila que reconcilia exatamente com o relatório de auditoria.

## Fase 1 — validar B2/B3 antes de avançar

1. Conferir os 45 tópicos do currículo contra o edital oficial e verificar as 209 unidades, `syllabusRefs`, objetivos, pré-requisitos e ausência de IDs órfãos.
2. Fazer revisão independente do `scopeReview`; a marcação gerada pelos pareceres de domínio, por si só, não prova a auditoria item a item do edital.
3. Confirmar o piloto configurado em Português e Desenvolvimento de Sistemas: materiais primários gratuitos, recortes legíveis, lacunas explícitas e interface mostrando idioma, acesso, locator e dependência de internet.
4. Atualizar `docs/STATUS.md` apenas com evidência observada e marcar B2/B3 como aprovados somente após seus critérios de saída.

**Saída:** parecer independente de escopo; IDs curriculares estáveis; B2/B3 com decisão explícita. Se falhar, corrigir escopo primeiro e não iniciar promoção.

## Fase 2 — fechar as 41 lacunas em lotes de domínio

### Backlog por área

| Área/agrupamento | Unidades abertas |
| --- | ---: |
| Legislação Institucional | 2 |
| Governança de TI (COBIT, ITIL, PMBOK, ágil) | 4 |
| Legislação Aplicada à TI / certificação | 1 |
| Engenharia de Software (princípios, UML, atributos de qualidade) | 3 |
| Banco de Dados / segurança e governança | 1 |
| IA, dados e LGPD | 1 |
| Língua Portuguesa | 9 |
| Matemática e raciocínio lógico | 1 |
| Segurança da Informação | 8 |
| Sistemas, diretórios, redes e nuvem | 10 |
| Inglês técnico | 1 |
| **Total** | **41** |

### Ordem de execução sugerida

1. **Candidatos próximos do aceite:** verificar primeiro materiais já lidos ou com recortes completos nos pareceres de domínio. Exigir que a fonte realmente cubra todos os objetivos e que o revisor independente tenha avaliado a mesma edição/recorte.
2. **Normas e legislação:** consolidar o corte temporal do pack, ler os dispositivos oficiais completos necessários e separar norma primária de explicação didática. Inventariar atos do TCE-GO vigentes; atos parciais não fecham unidades amplas.
3. **Português e lógica:** priorizar livros/recursos de universidades e instituições públicas com exemplos e exercícios corrigidos. Excluir recortes com gabarito ou taxonomia incorretos; não promover materiais só por serem gratuitos.
4. **Governança e engenharia:** confirmar a edição exata (COBIT 2019, ITIL 4, PMBOK 8), objetivos e práticas. Catálogos/lojas não são material didático gratuito; preço/licença de reprodução desconhecidos exigem link-only e não substituem fonte primária gratuita.
5. **Segurança, SO, redes e nuvem:** validar atualidade técnica e jurisdição. Registrar exceções específicas de fabricante e evitar generalizar comandos, canais, padrões, preços ou controles de um fornecedor.
6. **IA/LGPD e inglês técnico:** ligar cada obrigação ou termo a fonte apropriada; para inglês, validar atividades reais de interpretação de documentação, parâmetros, condições e unidades, não apenas acumular links em inglês.

Para cada unidade, a saída mínima é: fonte acessível e atual; autor/instituição e edição; URL final checada; recorte lido e localizado; idioma/duração conhecidos ou explicitamente desconhecidos; acesso separado de licença; recurso `primary/full`; evidência direta; parecer editorial e revisão independente por unidade. Material pago ou licença incerta só pode ser link complementar, nunca a única cobertura gratuita.

Se a unidade combinar resultados pedagógicos que nenhuma fonte individual ensina por inteiro (ex.: agile com Scrum e Kanban, ou o corpus de vários formatos em inglês), não fingir cobertura agregando links. Primeiro buscar um curso/texto didático completo; se isso não existir, abrir decisão editorial/arquitetural para refinar a decomposição sem mudar `topicIds`, registrar compatibilidade histórica de `unitId` e revalidar o escopo antes de mudar o contrato.

**Saída:** 209/209 unidades elegíveis, zero lacunas e pareceres de domínio consistentes; se restar unidade sem material, biblioteca continua `partial` e B4 não fecha.

## Fase 3 — preservar e auditar questões/cartões

1. Conferir que `questions.json` contém 45 itens, mantém as dez questões da baseline, os 35 itens aprovados por tópico e a igualdade de conteúdo/hash com os pareceres de domínio.
2. Conferir que `flashcards.json` contém os 64 itens editoriais ativos, com fonte e decisão por ID; manter fora do catálogo os 102 cartões-template legados.
3. Revisar alertas do `content-audit` como fila de triagem, não como aprovação. Questões históricas de provas só podem ser identificadas por banca, prova, ano, caderno, número e gabarito definitivo; os itens atuais continuam rotulados como originais quando não houver essa prova.
4. Reconciliar a pendência do pack TJTO para o dry run genérico B6; sua validação estrutural não equivale à aprovação factual.

**Saída:** nenhuma divergência entre pack, histórico, draft, IDs aprovados e hashes; score/primeira tentativa/eventos do estudante não mudam.

## Fase 4 — regenerar e validar candidato

1. Regenerar `STAGED_PACK.json` a partir dos pareceres aprovados, sem editar diretamente o pack ativo.
2. Executar factory, todos os schemas, `scripts/validate-content.mjs`, `scripts/library-audit.mjs tce-go-ti-2026` e o modo `--require-complete`.
3. Conferir separadamente: `isComplete=true`; 209/209 unidades; zero `gaps`; IDs únicos; cobertura/locator/fontes válidos; questões exatamente preservadas; nenhum recurso inelegível por acesso, licença, link desatualizado ou revisão vencida.
4. Rechecar cada URL literal e registrar `checkedAt`, `finalUrl` e método; falha de rede/login/timeout vira pendência, não aprovação nem prova de link quebrado.
5. Comparar o candidato com baseline e active pack; documentar apenas os deltas intencionais.

**Saída:** candidato determinístico, schemas/factory/auditoria verdes, relatório com hash final e nenhuma alteração de progresso histórico.

## Fase 5 — QA independente e B6

1. Um revisor que não seja autor dos lotes inspeciona o SHA exato: recortes de alto risco, unidade por unidade, 41→0, licenças, atualidade, conflitos de fontes, links e integridade dos IDs.
2. Para B6, repetir auditoria e percurso da biblioteca em um segundo pack/editais, sem regra específica no Core; preferir TJTO apenas depois das pendências factuais, ou usar fixture de segundo edital com escopo e proveniência explícitos.
3. Rodar aceite de UI por teclado/leitor de tela/mobile, busca/filtros, base path relativo e estado sem material; testar catálogo offline separado dos links externos.
4. Validar persistência, export/import e que coverage da biblioteca não altera score, XP, mastery, primeiras tentativas ou sessões.
5. Atualizar contratos, parecer QA, `STATUS.md` e relatório com resultado, comandos, SHA e limitações.

**Saída B6:** revisão independente aprova o hash exato; `library-audit --require-complete` passa; segundo pack funciona no Core genérico; acessibilidade/offline/persistência passam. Só então declarar B6 aprovado e avançar para B7.

## Fase 6 — B7 manutenção e liberação posterior

- Registrar owner editorial, data de revisão e periodicidade por fonte; criar um procedimento de rechecagem de links/edições e substituição arquivada, sem job ou serviço externo presumido.
- Depois do B6, tratar a liberação P1 como gate distinto: QA de release/CI, browser smoke em perfil limpo, base path/Pages, segredos, auth/Supabase real e migração de progresso. Os testes mockados não substituem autorização RLS/RPC no projeto provisionado; não publicar autenticação sem esse aceite.

## Regra para avançar

Não avançar ao próximo milestone quando o atual falhar. A redução de 90 para 41 lacunas é progresso de um candidato não promovido; ela não fecha B4, não aprova B6 e não altera o estado publicado. O próximo marco formal após B4 é B6 (B5 UI precisa passar seu aceite), depois B7; P1 é uma liberação separada.

## Atualização do estado do plano — 2026-10-08

A baseline numérica acima é histórica (41 lacunas no início da fase 2). O candidato em execução foi atualizado para 172/209 unidades cobertas e 37 lacunas após novos recursos de Linux e nuvem serverless. Hash vigente e ledger reconciliado estão em `CURATION_BASELINE_2026-10-08.json` e `GAP_LEDGER.json`. As etapas 2, 5 e posteriores continuam abertas; a alteração ainda não está promovida.

### Fechamento técnico da cobertura candidata — 2026-10-08

O estágio atual fechou as lacunas documentadas no candidato: 209/209 unidades, 45/45
tópicos, zero gaps e 22 percursos elegíveis. O candidato foi validado por schema, factory,
auditoria da biblioteca, identidade das questões e suíte integral (`202/202`). Hash e
ledger estão em `INTEGRATION_QA.json`, `GAP_LEDGER.json` e
`CURATION_BASELINE_2026-10-08.json`. Isso fecha a cobertura editorial candidata, mas não
aprova nem promove o conteúdo: a QA independente ainda precisa examinar o hash exato
`d22ef5dd855a6f23dda7beaecbdd2dac768c63854448589dcf8fefb43bbe3de8`. O estado ativo
continua `partial`.

Após a QA independente, executar os gates restantes sem misturar seus resultados com a
curadoria: B6 (segundo pack, Core genérico, acessibilidade/browser e catálogo offline versus
links externos), B7 (proprietário editorial, revisão periódica e atualidade dos links) e,
se a atualização integral estiver no escopo de entrega, P1 (CI/release, auth/Supabase
realmente provisionado, migração e smoke remoto). Não publicar com QA, autorização remota
ou configuração de auth pendentes.

## Promoção aprovada e gates operacionais restantes — 2026-10-08

A QA independente do SHA `4597f81f942cbf205f7ec3dbfca8349f89d684a41ea44a72ba2b7ef11140f639` autorizou `complete`; a promoção local foi executada e validada pelo promotor. Biblioteca TCE-GO: 209/209 unidades e 45/45 tópicos, 309 recursos elegíveis, 43 percursos, sem gaps. A snapshot anterior foi arquivada e as 45 questões/64 flashcards foram preservados. `library-audit --require-complete` e `validate-content.mjs` passaram depois da correção do auditor de candidatos.

B4/cobertura e promoção local concluídos. B5 ainda requer inspeção real de teclado, mobile, filtros, acessibilidade e catálogo/offline; B6 mantém três questões e dois recursos TJTO com alertas; B7 exige proprietário e rotina de manutenção. P1/release não está aceito: o build local foi regenerado, mas não houve smoke remoto nem publicação. A suíte geral pós-promoção ficou em 177/190 devido a 13 inicializações de Chromium/Edge/IndexedDB que falham no ambiente.
