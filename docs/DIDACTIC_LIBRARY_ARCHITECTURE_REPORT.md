# B1 — Arquitetura da biblioteca didática
Data: 2026-10-06
Status: arquitetura aprovada por QA/Architect independente (GPT-6.1 Sol/high).

## Entrega
- AGENTS, Product Spec, workflow e roadmap encaminham para o contrato/ADR/plano B1–B7.
- Ownership atualizado em Orchestrator, Architect, Curriculum, Resource Curator,
  Exam Pack Generator, Frontend, Release e QA.
- Skill resource-curation descreve recorte, autoria, acesso, licença e avaliação real.
- Schemas de resource v2, library e candidates são aditivos ao legado.
- library.json dos dois packs reais e template inicia planned, scopeReview pending.
  Uma unidade provisória por tópico preserva IDs; B2 deve decompor e conferir o edital.
- Auditor determinístico mede oferta didática, separada de progresso/mastery/score.
- validate-content confere schemas/referências de biblioteca e candidatos.
- Builder do checkout publicado exclui candidatos e remove arquivo remanescente do
  output reutilizado. Metadados library são empacotados, mas ainda inertes no runtime.

## Evidência e baseline
Checkout publicado Nivelando_Game: TCE-GO tem 45 unidades provisórias, 20 recursos
legados e zero unidades aprovadas como cobertura didática v2. Não significa ausência
de referências; significa que o novo processo editorial ainda não foi executado.
Segundo pack TJTO tem 13 unidades provisórias; ambos recusam --require-complete
com código 1. Relatórios DIDACTIC_LIBRARY_BASELINE_TCE_GO/SECOND_PACK são derivados.
Suíte final publicada: 186/186, zero falhas/skips; log DIDACTIC_LIBRARY_TEST_RUN.txt.
Schema/factory aprovados em 3 packs de cada diretório. Security scan: 347 arquivos,
sem achados. git diff --check aprovado.
Cópia anterior studyos-agentic-factory: suíte 47/47; schema final conferido pelo
validador do checkout publicado usando root opcional. Dados próprios preservados.
A ferramenta Python quick_validate não estava disponível por falta de PyYAML;
frontmatter/name/description/referências da skill foram conferidos diretamente.

## Revisão independente
Agente library_architecture_review, GPT-6.1 Sol/high, aprovou B1 sem blockers e sem
pendências documentais. Executou auditor 6/6, packaging 1/1, schemas nos dois
diretórios e depois schema 2/2; conferiu log completo sem afirmar que o executou.
Achados corrigidos: gratuidade obrigatória; disciplina piloto válida; delivery link
na B1; embed/bundle reservado a B5; referências de candidatos; documentação do build.
Licença desconhecida pode ser referenciada; incorporar exige contrato B5 e revisão.
Testes de auditor abrangem pago, parcial, fonte vencida/futura/bloqueada, órfãos,
ciclos, duplicatas, URL insegura, escopo não revisado e imutabilidade dos inputs.

## Limites
B2–B7 permanecem pendentes: curadoria factual, escopo revisado, interface, percurso
offline da biblioteca, avaliação editorial integral e publicação desses conteúdos.
B1 não revisa nem aprova materiais existentes e não declara biblioteca completa.
Não houve alteração do Core, de tópicos existentes ou do progresso de estudantes.
