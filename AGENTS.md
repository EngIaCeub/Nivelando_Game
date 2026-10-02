# AGENTS.md — StudyOS Agentic Factory

## Missão

Construir e manter um motor genérico de estudo gamificado que gere experiências de estudo
para concursos diferentes por meio de `Exam Packs`.

O primeiro alvo é TCE-GO TI 2026, mas nenhuma decisão estrutural pode tornar o Core
dependente desse concurso.

## Fontes de verdade

1. `docs/PRODUCT_SPEC.md`
2. `contracts/*.md`
3. `schemas/*.json`
4. ADRs em `docs/adr/`
5. testes automatizados
6. `exam-packs/<exam-id>/manifest.json` para dados específicos de cada concurso

## Invariantes

- Core não contém nomes, pesos, banca ou matérias específicas de um edital.
- Todo dado específico fica em `exam-packs/`.
- Primeira tentativa é imutável para score simulado.
- Retentativas alteram aprendizagem/mastery, nunca score histórico.
- Questões e recursos exigem proveniência.
- Não copiar bancos comerciais ou material protegido sem permissão.
- Conteúdo novo deve passar por validação de schema.
- Progresso deve sobreviver a reload, versão nova e export/import.
- Gamificação não premia tempo ocioso, refresh ou repetição artificial.
- Site deve funcionar bem em celular e teclado.
- GitHub Pages deve funcionar com base path relativo.
- IA em runtime é opcional; a V1 não depende dela.

## Organização por camadas

- `core/`: motor reutilizável.
- `exam-packs/`: editais.
- `sites/`: configurações de publicação.
- `agents/`: papéis.
- `skills/`: workflows especializados.
- `contracts/`: invariantes.
- `schemas/`: contratos de dados.
- `prompts/`: operações de alto nível.

## Delegação

O Orchestrator é o único agente que pode alterar o escopo global.
Subagentes recebem ownership explícito e devem evitar editar arquivos fora do seu domínio.

## Gates

F0 arquitetura e schemas
F1 shell/PWA
F2 storage/event log
F3 currículo
F4 quiz/score
F5 revisão/mastery
F6 gamificação
F7 analytics
F8 exam factory
F9 TCE-GO pack
F10 release standalone
F11 suporte a segundo edital sem alterar contratos do Core

O gate F11 é obrigatório: o projeto só é considerado realmente genérico depois de um
"dry run" com um segundo edital de teste.

## Definition of Done

- testes verdes;
- invariantes de score/persistência cobertos;
- schema validation;
- acessibilidade básica;
- offline testado;
- export/import round-trip;
- nenhuma dependência específica de edital no Core;
- proveniência presente;
- documentação e STATUS atualizados.
