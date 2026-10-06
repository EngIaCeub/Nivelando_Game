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
As atribuições de modelo e esforço por agente estão em `docs/MODEL_ROUTING.md` e são
normativas: tarefas de implementação/arquivos usam primeiro o modelo econômico; Astra
fica para arquitetura crítica e `gpt-6.1-sol/high` para aprovação independente de gates.
Ao delegar, configurar `model`
e `thinking` explicitamente quando a plataforma suportar esses parâmetros. Registrar
quando o fallback por indisponibilidade for usado; registrar apenas o modelo efetivamente
invocado em cada validação.

## Aprovação autônoma (autorização do usuário em 2026-10-03)

- Gates anteriormente humanos passam por avaliação independente de QA/Architect com
  `gpt-6.1-sol/high`, conforme alteração autorizada em 2026-10-06; o Orchestrator integra
  a avaliação e registra as evidências e o veredito. Pareceres anteriores mantêm seu modelo original.
- Corrigir falhas recuperáveis e repetir testes autonomamente. Nenhum gate é aprovado
  apenas por documentação, contagem de testes ou parecer sem evidência executável.
- Publicação GitHub Pages e tags de release estão autorizadas após validação local,
  QA independente e smoke remoto. Preservar tags de baseline e histórico Git.
- Notificar conclusão de cada etapa e falhas fatais/autenticação/permissões que impeçam
  progresso. Autonomia não autoriza apagar dados reais de usuário nem reduzir invariantes.
- Concluir O4 antes de O5. O5 usa observação automatizada com estado de teste isolado;
  não alegar estudo longitudinal com pessoas quando só houver teste automatizado.

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
