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
Classifique cada tarefa e siga `docs/ai/MODEL_ROUTING.md` e
`docs/ai/TASK_CLASSIFICATION.md`: GPT-6 Luna para BASIC/INTERMEDIATE, Luna high em
ADVANCED_INTERMEDIATE bem delimitado, GPT-6.1 Sol para COMPLEX e para tarefas avançadas
com risco arquitetural, regressão relevante ou vários subsistemas. GPT-6 Terra só pode ser
usado se estiver disponível no runtime. Ao delegar, configurar `model` e `thinking`
explicitamente quando a plataforma suportar esses parâmetros; registrar fallback e modelo
efetivamente usado.

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

## Pixel UI — camada de apresentação

StudyOS/Nivelando_Game pode usar uma linguagem visual moderna de pixel art / RPG retrô, mantendo-se uma plataforma séria de estudo. Para tarefas de UI, UX, styling, componentes, dashboard, quiz, flashcards e progresso:

- Leia `skills/studyos-pixel-ui/SKILL.md` e apenas as referências relevantes.
- Siga `docs/design/PIXEL_UI_SYSTEM.md` e `docs/design/COMPONENTS.md`.
- Preserve os contratos funcionais existentes; pixel art é somente apresentação.
- Reutilize tokens e primitives compartilhados; não crie sistemas visuais paralelos.
- Nunca invente XP, nível, mastery, streak, conquistas, progresso, score, conclusão ou revisão. Valores visuais derivados devem ser determinísticos.
- Preserve legibilidade, HTML semântico, teclado, leitores de tela, contraste, responsividade e previsibilidade dos controles.
- Faça mudanças em etapas: tokens e primitives antes de migrar uma tela; valide o piloto antes de seguir para outras telas.
- Não altere IndexedDB, storage, backup/restore, proteção de conexões após restore, first quiz attempt, XP idempotency, spaced repetition, mastery engine, simulatedScore, schemas de currículo ou PWA/offline/cache para viabilizar redesign visual sem reclassificar e analisar como COMPLEX.

### Roteamento para tarefas Pixel UI

- BASIC: GPT-6 Luna.
- INTERMEDIATE: GPT-6 Luna, reasoning médio/alto conforme escopo.
- ADVANCED_INTERMEDIATE: GPT-6 Terra apenas se disponível no runtime; caso contrário Luna high se delimitado, ou GPT-6.1 Sol se envolver arquitetura, regressão relevante, múltiplos subsistemas ou fronteira UI/negócio.
- COMPLEX: GPT-6.1 Sol.

Não invente nem invoque identificadores de modelos indisponíveis. Consulte `docs/ai/MODEL_ROUTING.md` e `docs/ai/TASK_CLASSIFICATION.md` para os critérios completos. O coordenador integra e valida resultados; não permita edição concorrente dos mesmos arquivos.

### QA visual

Para alterações visuais relevantes, inspecione a renderização em desktop e viewport estreito, navegação/foco por teclado, estados loading/empty/error/disabled/locked/completed e reduced-motion quando aplicável. Não declare inspeção visual sem executá-la.
