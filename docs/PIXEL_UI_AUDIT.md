# Pixel UI — auditoria pré-implementação

Data: 2026-10-06
Checkout: `C:\CodexProjects\Nivelando_Game`
Branch/commit da auditoria: `main` / `b9351ce2d0ad5f32fd6aef220c50987ebba0ff10`

## Arquitetura de UI observada

Aplicação estática de página única, implementada com HTML, CSS e ES modules vanilla. Não há framework, router nem primitives visuais compartilhadas. A composição publicada é gerada por `scripts/build-standalone.mjs`; editar fontes, nunca `dist/` ou `staging/` diretamente.

- Shell, landmarks, navegação por âncoras, onboarding/resume e seções: `core/index.html`.
- Estilos globais, menu responsivo e foco: `core/styles.css`.
- Toggle do menu, status e ciclo de atualização do service worker: `core/app.js` (PWA protegido).
- Dashboard/Hoje: `core/src/today-ui.js`, chamado de `sites/tce-go-ti-2026/site-app.js`.
- Sessões de estudo, quiz, flashcards e simulado: `core/src/study-ui.js`.
- Diagnóstico: `core/src/diagnostic-ui.js` e `core/src/diagnostics.js`.
- Composição do site, currículo, revisões, analytics, XP, settings e backup: `sites/tce-go-ti-2026/site-app.js`.
- Dados de domínio: `core/src/{today-planner,analytics,mastery,gamification,revision,scoring,production,storage}.js`.
- Saídas compiladas em `sites/tce-go-ti-2026/dist/` e `staging/` são geradas; não são fontes.

Existe um único documento learner-facing com 10 seções por âncora: Hoje (hero/onboarding/sessões pendentes), Plano/Dashboard, Matérias, Questões, Revisões, Diagnóstico, Flashcards, Simulados, Progresso/analytics e Configurações/Sobre. Ferramentas de diagnóstico de release e staging não fazem parte do piloto learner-facing.

## Mapa das telas e contratos

| Área | Código e estado real | Dependências funcionais / risco | Classe visual |
|---|---|---|---|
| Shell e navegação | `core/index.html`, `core/app.js`, `core/styles.css`; links `#...`, toggle `aria-expanded`, skip link/status/update banner | Foco, anchors, viewport e comportamento update/PWA; não mudar lógica do service worker | INTERMEDIATE |
| Dashboard | `core/src/today-ui.js`; `site-app.js:149-165` envia plano, resumo diário/semanal, métricas, streak, XP e orçamento | Leitura de estado já derivado por engines; callbacks iniciam atividades/replanejam. Manter API/callbacks inalterados | INTERMEDIATE (piloto recomendado) |
| Currículo | `site-app.js:204-229`; dados de Exam Pack e estados de estudo/recurso | Nomes acadêmicos, início de sessão e elegibilidade de conteúdo; densidade responsiva | INTERMEDIATE / ADVANCED_INTERMEDIATE |
| XP/progresso/mastery | `site-app.js:128-139,285-294`, `core/src/{gamification,analytics,mastery}.js` | Eventos, score de primeira tentativa, mastery e level derivado. Só apresentação read-only | ADVANCED_INTERMEDIATE; engines COMPLEX |
| Revisões | `site-app.js:250-265`; `dueAt`, tentativas erradas e sessões persistidas | Spaced repetition e retomada; não tocar scheduling | INTERMEDIATE |
| Flashcards | `core/src/study-ui.js`, `site-app.js:225-230`; run/cursor/revelação/respostas | Efeitos da resposta atualizam revisão/mastery; preservar semântica de revelar/avaliar | INTERMEDIATE visual |
| Quiz | `core/src/study-ui.js:354-405`; opções/feedback/respostas persistidas | Primeira tentativa imutável, retakes, score e XP idempotente | COMPLEX |
| Diagnóstico | `core/src/{diagnostic-ui,diagnostics}.js`, composição em `site-app.js` | Run/answers e mastery/confiança; onboarding/calibração não deve parecer dispensável | ADVANCED_INTERMEDIATE; engine COMPLEX |
| Simulados | `site-app.js:267-283`, `StudyUI` e conteúdo do pack | Score histórico, retomada e retakes | ADVANCED_INTERMEDIATE / COMPLEX na fronteira de estado |
| Analytics | `site-app.js:285-294`, `core/src/analytics.js` | Métricas derivadas de eventos, tentativas, revisões e currículo | ADVANCED_INTERMEDIATE (UI somente); cálculo COMPLEX |
| Configurações e backup/restore | `site-app.js:300+`, `core/src/production.js`, `storage.js` | Backup integral, preferências, confirmação, mastery global, reset e fencing entre gerações | COMPLEX; fora deste redesign |
| PWA/offline/cache | `core/app.js`, `core/sw.js`, manifest e build scripts | Atualização durante sessão, escopo/base path e cache versionado | COMPLEX; fora deste redesign |

### Primitives e tokens existentes

Há `.card`, botões nativos, `progress`, `.question-options`, `.study-feedback`, `.flashcard-answer`, `.topic-card`, `.danger-zone`, `.settings-actions` e classes de onboarding/feedback. Não há design tokens semânticos nem primitives Pixel UI. A folha atual usa cores hex diretamente, sistema tipográfico do sistema, raios convencionais, um breakpoint em `42rem`, `:focus-visible` e `prefers-reduced-motion`. Base acessível já presente: skip link, landmarks, headings, live/status regions, foco visível e menu responsivo.

## Classificação e sequência segura

1. Foundation: tokens semânticos + primitives DOM/CSS compatíveis com vanilla JS; INTERMEDIATE, sem mudança de engine.
2. Shell/nav: INTERMEDIATE; preservar âncoras, skip/foco, menu e URLs relativas.
3. Dashboard: INTERMEDIATE, tela piloto; apenas mapear dados já fornecidos para XP, mastery, quest rows, streak e progresso.
4. Currículo/revisões: INTERMEDIATE; manter rótulos acadêmicos e estado de revisão.
5. Flashcards: INTERMEDIATE somente apresentação; qualquer mudança de scheduling/mastery é COMPLEX.
6. Quiz, diagnóstico com alteração de fluxo, simulatedScore: COMPLEX; GPT-6.1 Sol.
7. Analytics: ADVANCED_INTERMEDIATE na composição visual; usar métricas existentes sem recriar cálculos.
8. Settings/restore, storage, IndexedDB, XP engine, mastery engine, schemas, PWA/offline/cache: COMPLEX e fora do escopo atual.

O Dashboard é o piloto de menor risco que ainda exercita dados reais e primitives de progresso. Usar GPT-6 Luna em tokens/componentes e tela claramente delimitados; escalar a GPT-6.1 Sol se houver alteração arquitetural, regressão ampla ou fronteira com lógica protegida. GPT-6 Terra não está disponível no runtime configurado.

## Baseline

Pendente no momento desta auditoria; será anexado a `docs/STATUS.md` após retorno da execução da suíte e validadores. Nenhuma tela ou arquivo de produção foi modificado durante auditoria.
