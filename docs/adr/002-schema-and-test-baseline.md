# ADR 002 — Baseline de schemas e testes do F0

## Contexto

O factory precisa bloquear regressões arquiteturais antes da implementação dos gates de
produto. O repositório não possuía runner de testes nem dependências instaladas.

## Restrições

- A V1 deve ser verificável sem depender de um framework ou serviço externo.
- JSON Schemas são fonte de verdade para os dados dos packs.
- A validação completa de payloads será expandida junto dos gates que os produzem.

## Decisão

Usar o test runner nativo do Node (`node --test`) como infraestrutura mínima. O baseline F0
valida JSON e declarações de schema e falha quando strings específicas de Exam Packs vazam
para `core/`.

## Consequências

O projeto tem um comando reprodutível (`npm test`) sem custo de dependências. A validação
semântica completa e os testes de runtime permanecem backlog dos gates correspondentes.

## Migração / reversão

Um framework pode ser introduzido por ADR se reduzir complexidade; os testes arquiteturais
devem manter o mesmo comportamento observável.
