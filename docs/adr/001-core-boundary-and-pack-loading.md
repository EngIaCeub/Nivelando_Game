# ADR 001 — Fronteira do Core e carregamento de Exam Packs

## Contexto

O produto precisa gerar experiências para múltiplos concursos sem tornar o motor dependente
de um edital. O Core existente ainda não implementa carregamento, mas já define a fronteira.

## Restrições

- O Core conhece somente interfaces genéricas: `ExamManifest`, `Curriculum`, `Resource`,
  `Question`, `StudyPlan`, `Event` e `Progress`.
- IDs, títulos, banca, datas, pesos, matérias e URLs específicas não podem entrar em `core/`.
- Conteúdo específico deve permanecer em `exam-packs/<exam-id>/`.

## Opções

1. Codificar o primeiro edital no Core.
2. Carregar packs por dados/configuração e validar seus contratos.
3. Manter um Core diferente por edital.

## Decisão

Adotar a opção 2. O Core será genérico e os Exam Packs serão entradas validadas. Um teste
arquitetural procura identificadores conhecidos dos packs dentro de `core/`.

## Consequências

Novos editais exigem dados e validação, não alterações específicas no motor. O teste de
leakage precisa ser atualizado quando novos packs forem adicionados, sem copiar seus dados
para o Core.

## Migração / reversão

Como o Core ainda não possui lógica específica, não há migração. Uma futura necessidade de
alterar a fronteira deve gerar novo ADR e preservar o teste arquitetural.
