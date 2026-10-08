# Pixel art de plataforma — direção e plano V2

Data: 2026-10-06. Atualização: 2026-10-07. Camada publicada; evidências e limites do release estão em `PLATFORM_IMPLEMENTATION_REPORT.md`.
Checkout canônico do site publicado: `C:/CodexProjects/Nivelando_Game`.
Esta direção complementa PIXEL_UI_SYSTEM, UX_RULES, COMPONENTS e MIGRATION_PLAN.
Não substitui contratos de produto, score, persistência ou a arquitetura da biblioteca.

Evolução solicitada em 2026-10-07: tema escuro único, uma tela ativa por rota,
validação factual de conteúdo e contas por pessoa. Plano de implementação em
`../CONTENT_DARK_VIEWS_ACCOUNTS_PLAN.md`; preserva a arte original e os tokens/primitives.
A nova evolução é planejamento e não representa mudança já publicada.

## Implementação atual

V1–V5 receberam integração no runtime standalone: tokens compartilhados, três cenários
originais, Hoje com ação prioritária, navegação nativa agrupada, regiões das matérias,
catálogo da Biblioteca e superfícies de estudo. V6 foi publicada após os gates
automatizados e a revisão independente descritos em `PLATFORM_IMPLEMENTATION_REPORT.md`.
O relatório distingue esses resultados do smoke interativo em perfil remoto limpo,
que permanece pendente. A nova evolução de 2026-10-07 possui gates próprios.

A parte runtime de B5 foi implementada com os dados disponíveis, exibindo lacunas reais.
B2–B4 (escopo e curadoria factual), B6 (cobertura integral) e B7 (manutenção editorial)
continuam separados. Relatório e evidências: `PLATFORM_IMPLEMENTATION_REPORT.md`.

## 1. Diagnóstico do planejamento e da interface atual

A primeira migração Pixel UI já está publicada. Tokens, bordas, sombras e primitives
em `core/src/pixel-ui.js` existem; o audit inicial PIXEL_UI_AUDIT é histórico.
O problema atual é de composição: essas superfícies ainda não criam um universo visual.

Inspeção em 2026-10-06 da página pública, DOM e código:

| Evidência | Efeito provável na UX | Proposta |
| --- | --- | --- |
| Dez destinos no cabeçalho | A escolha inicial disputa atenção com estudar | Agrupar navegação em Hoje, Conteúdos, Prática, Progresso; Configurações secundária |
| Hero grande e onboarding antes da recomendação | A atividade recomendada fica longe do início | Retomar sessão ou próximo passo em posição dominante; onboarding contextual |
| Textos longos de prioridade e assuntos amplos | A decisão de começar exige muita leitura | Mostrar ação, unidade, duração e matéria; motivo em disclosure |
| Bordas pixeladas, fundo uniforme, ausência de cenários | Mudança percebida principalmente como CSS de cards | Cenas originais, silhuetas, tiles, mascote e paleta por região |
| Muitos indicadores juntos | XP pode competir com utilidade | HUD compacto; próxima ação e revisões antes das métricas secundárias |

Efeitos são hipóteses de design, não resultados de pesquisa com alunos.
A composição atual é uma página com seções e hashes; agrupamento futuro precisa preservar
deep links, voltar/avançar, foco, sessão em andamento e acesso a todos os destinos.

## 2. Direção recomendada: Expedição do conhecimento

Uma identidade original com linguagem de plataforma de 16 bits:
paisagens em camadas, terreno modular, cores vivas controladas, ícones de silhueta clara,
mascote de livro explorador e trilhas que representam a organização do currículo.

A nostalgia aparece nas cenas e na geometria. Perguntas, explicações, fontes e apostilas
usam superfícies uniformes, tipografia de leitura e hierarquia acadêmica explícita.
A evolução de 2026-10-07 substitui a paleta clara por tema escuro único.

### Referências pesquisadas

| Referência oficial | O que observar | Aplicação proposta |
| --- | --- | --- |
| [Super Mario Maker — booklet Nintendo](https://www.nintendo.co.jp/wiiu/amaj/booklet/SuperMarioMakerBooklet.pdf) | Linguagens SMB, SMB3 e World; desenho modular de fases | Tiles, plataformas e trilhas legíveis para navegar pelo currículo |
| [Sonic Mania — SEGA](https://sonic.sega.jp/SonicMania/) | Releitura da série clássica 2D e cenários variados | Silhuetas fortes, cores por região e sensação de avanço nas telas de exploração |
| [Donkey Kong Country — Nintendo](https://www.nintendo.com/en-gb/Games/Super-Nintendo/Donkey-Kong-Country-276896.html) | Profundidade, ambientes e materiais; gráficos pré-renderizados descritos pela Nintendo | Camadas de vegetação, pedra e madeira com textura restrita às ilustrações |

Sonic Mania é uma releitura de 2017 dos clássicos; DKC de 1994 usava gráficos
pré-renderizados, portanto não é referência de pixel desenhado à mão equivalente a Mario.
A seleção de cores, mascote e componentes abaixo é uma interpretação para StudyOS.

Produzir arte original. Não usar personagens, sprites, logotipos, fases, sons ou fontes
extraídos dessas franquias. Registrar autor, licença e origem de cada asset.

## 3. Regras de arte

- Grade base de 8 px; tiles de 16×16 ou 32×32; ícones de 16/24 px; mascote de 32×48 px.
- Silhueta primeiro: formas claras em miniatura, contorno de 1 px no arquivo fonte,
  grupos de pixels consistentes; evitar mistura aleatória de resoluções.
- Três planos estáticos: céu/fundo, relevo intermediário, terreno/mascote em primeiro plano.
- Paleta semântica estável; o bioma altera decoração, não significado de sucesso/erro/alerta.
- Ilhas: céu azul suave + turquesa + areia. Bosque: verdes + terra.
  Observatório: lavanda + azul profundo + dourado. Seleção cosmética não depende de score.
- Papéis claros: fundo creme, texto tinta escura, ação principal verde/azul,
  coral/dourado como detalhes. Dithering apenas no cenário, nunca sob texto.
- Corpo 16–18 px, entrelinha 1,5–1,7, texto de leitura até aproximadamente 65–75 caracteres.
  Fonte pixel apenas em rótulos curtos; não exigir fonte remota para o app funcionar.
- Raster exportado em PNG/WebP lossless e escala inteira quando possível;
  `image-rendering: pixelated`. SVG com coordenadas inteiras para geometria simples.
  Layout HTML permanece fluido. Zoom e DPR fracionários podem desalinhar pixels:
  [MDN — crisp pixel art](https://developer.mozilla.org/en-US/docs/Games/Techniques/Crisp_pixel_art_look).
- Sem CRT, scanlines, tremor, brilho pulsante ou parallax ao rolar conteúdo de estudo.
- Microanimações opcionais de 120–200 ms somente para ação/estado real;
  nenhuma celebração bloqueia a próxima questão.
  [MDN — reduced motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion);
  adotar desativação de movimento não essencial como padrão do produto
  ([WCAG 2.3.3, nível AAA](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html)).

## 4. UX por contexto

| Tela/contexto | Composição | Intensidade visual |
| --- | --- | --- |
| Hoje | Retomar/próxima ação, revisões, agenda curta, HUD, regiões | Cena compacta e mascote |
| Conteúdos/Matérias | Lista acadêmica acessível + mapa opcional; assunto e unidade identificáveis | Miniaturas de regiões |
| Biblioteca por unidade | Objetivo, pré-requisitos, sequência, formatos, recorte e proveniência | Capas originais e estante discreta |
| Leitura/vídeo | Título, objetivo, origem, recorte, controles e próxima prática | Superfície neutra |
| Questões/Diagnóstico | Enunciado, seleção, confirmar, resultado textual, explicação e fonte | Borda e ícones; sem paisagem atrás das respostas |
| Flashcards/Revisões | Conteúdo legível, revelar e avaliação próximos, estado real | Moldura colecionável, flip opcional |
| Simulados | Instruções, cronômetro existente, questões e score histórico | Emblema de desafio; sem vidas ou penalidades novas |
| Progresso | Métricas existentes, histórico e lacunas | Trilhas somente com mapeamento explícito |
| Configurações | Backup, restore e ações destrutivas claramente identificadas | Decoração mínima |

### Navegação proposta

Hoje / Conteúdos / Prática / Progresso são grupos de apresentação.
Todos os destinos atuais continuam acessíveis: Plano em Hoje; Matérias e Biblioteca
em Conteúdos; Questões, Revisões, Flashcards, Diagnóstico e Simulados em Prática.
Configurações fica acessível em posição secundária. Rótulos convencionais permanecem.

Primeiro piloto preserva a navegação atual e valida o Dashboard. Reorganizar a navegação
é um item separado, classificado COMPLEX: não ocultar/recriar seções nem introduzir router
sem analisar mounts, handlers, formulário ativo, sessão, hashes e foco.
Usar navegação HTML/DOM; mapa é visão adicional com alternativa de lista, não canvas obrigatório.

### Hoje e celular

- Sessão ativa ganha ação “Continuar”; caso contrário, próximo passo vem da recomendação real.
- Uma ação principal e poucas alternativas. Duração estimada identificada como estimativa.
- Razão da recomendação em “Por que estudar agora?”; nome completo acessível mesmo quando
  a apresentação compacta resume uma unidade.
- Onboarding aparece conforme estado real e não exige blocos repetidos de introdução.
- Cenário compacto no celular; alvos preferidos de 44×44 px; sem scroll horizontal.
- Em 390×844 a ação primária deve aparecer sem scroll com estado representativo.
  Em 375×667, inclusive nomes extensos, a ação fica antes da agenda e perto do início;
  se a cena impedir isso, reduzir/remover cenário. Não truncar enunciados para cumprir fold.
- Modo foco reduz ilustração/HUD cosmético. Voltar e contexto do estudo continuam disponíveis.

### Biblioteca e dados reais

A UI depende do milestone B5 da biblioteca didática. Exibir recursos legados com proveniência
sem presumir cobertura v2; indicar planned/partial e recortes pendentes.
Distinguir cobertura editorial da biblioteca de aprendizagem/mastery do estudante.
Indicar formato, acesso, licença, páginas/minutos, verificação e limitações offline conforme
os campos reais. Abrir materiais externos como links; não incorporar conteúdo sem licença.
O catálogo pode funcionar offline; livro/vídeo externo não recebe promessa de download.

## 5. Arquitetura de apresentação

Reutilizar os tokens de `core/styles.css` e primitives de `core/src/pixel-ui.js`.
A CSS isolada do conceito serve apenas para experimentar composição; não copiá-la integralmente
para produção como uma segunda camada concorrente.

| Área proposta | Responsabilidade | Limite |
| --- | --- | --- |
| `core/assets/pixel/` | Ícones, cenários, mascote e inventário de autoria/licença | Caminhos relativos e assets estáticos originais |
| Tokens existentes | Superfície, texto, semântica, tamanho, foco e variantes de bioma | Sem cor por banca/matéria hardcoded no Core |
| Primitives existentes | Panel/Button/Progress/Meter/Badge/Stat | Não duplicar interfaces funcionais |
| Scene, WorldTile, Trail, CompactHud | Renderização decorativa e destinos acessíveis | Consumir dados; sem calcular XP, mastery ou score |
| `today-ui.js` e `site-app.js` | Composição do piloto e labels | Handlers/IDs e engines preservados |
| `study-ui.js`, flashcards e diagnóstico | Migrar enquadramento e estados | Commit de resposta, retakes e scheduling preservados |
| Pack/configuração de site | IDs/títulos reais e associação opcional a variante visual | Variante neutra se não houver configuração |

Cenários não dependem de nomes de concursos ou disciplinas.
Metáforas não criam bloqueios, vidas, moedas, perda de score, novas recompensas ou
elegibilidade. Dados reais de XP/nível/revisões usam adapters atuais e fallback explícito.
Arte decorativa recebe `aria-hidden`; estado real usa texto, nomes e valores acessíveis.

## 6. Inventário inicial de assets

| Família | Entrega inicial | Estimativa de esforço relativo |
| --- | --- | --- |
| Tiles | solo, grama, madeira, pedra e bordas em 16/32 px | Médio |
| Cenários | Ilhas, Bosque e Observatório em 3 camadas | Alto |
| Mascote | livro explorador: idle estático, estudar, concluir | Médio |
| Ícones | livro, questões, revisão, mapa, progresso, configurações | Médio |
| Estados | vazio, erro, indisponível/offline e concluído | Médio |
| Inventário | arquivo fonte, dimensões, autor, licença e uso | Baixo |

Começar com cena Ilhas, mascote estático e seis ícones. Criar os outros biomas após aceite
do piloto. Meta inicial de orçamento: assets decorativos do piloto até 150 KB comprimidos,
sem dependências externas e sem animação contínua; medir bundle/paint antes e depois.
Só ajustar a meta com evidência de qualidade/tamanho. Dimensões reservadas evitam layout shift.

## 7. Sequência de implementação

| Etapa | Entrega | Dependência/risco | Aceite |
| --- | --- | --- | --- |
| V0 — direção | Audit, referências e conceito isolado | Esta tarefa; sem release | Evidência desktop/celular e revisão das regras |
| V1 — fundação | Consolidar CSS duplicada, tokens e assets originais; primitives adicionais | Não refazer o sistema existente | Story/states, contraste e orçamento |
| V2 — piloto Hoje | Cena compacta, próxima ação prioritária, HUD e disclosure | Dados reais; sessão ativa e onboarding | Desktop/celular/teclado, empty/error/loading, métricas sem invenção |
| V3 — navegação | Grupos e mapa/lista mantendo todos os destinos | COMPLEX, hash/foco/sessões | Deep links, voltar/avançar, retomada e 2º pack |
| V4 — Conteúdos/Biblioteca | Regiões, unidades e recursos curados | B5 biblioteca; catálogo incompleto explícito | Proveniência, lacunas e offline externo |
| V5 — estudo | Questões, Flashcards, Revisões, Diagnóstico e Simulados | Contratos comportamentais sensíveis | Imutabilidade score, retakes, XP e SRS cobertos |
| V6 — acabamento/release | Progresso/settings, assets restantes e motion opcional | QA independente, build e smoke remoto | Regressão, PWA, restore, base path, 2º pack |

Ownership futuro: Frontend possui apresentação; Curator possui metadados/fontes;
Architect revisa navegação/adapters; QA avalia evidências independentemente; Orchestrator
integra cada etapa. Delegações explícitas seguem MODEL_ROUTING e não editam o mesmo arquivo.

Não aprovar V6 com aparência apenas. Gates incluem testes pertinentes, schemas quando
houver conteúdo novo, export/import, persistência, offline, score histórico e segundo pack.
O primeiro piloto é a unidade de aprendizado do redesign; calibrar composição antes de ampliar.

## 8. Critérios de aceite e validação

- Capturas reais em 1280×900, 390×844 e 375×667; zoom 200% com reflow e textos extensos.
- Teclado: skip link, foco visível, ordem lógica, navegação, disclosures e ações;
  feedback com status acessível, nenhuma informação apenas por cor.
- Contraste WCAG AA: texto normal >=4,5:1, texto grande >=3:1;
  controles/indicadores essenciais >=3:1. Paleta decorativa não substitui teste.
- loading/empty/error/disabled/locked/completed/overdue verificados onde aplicável.
- reduced-motion, foco, respostas, estados incorretos/corretos e alto volume de conteúdo.
- Ação principal reconhecível, títulos reais, sem falso progresso.
- Nenhuma mudança invisível nos contratos do Core; assets carregam com base path relativo.
- Provar score/retakes, backup/restore, offline e segundo pack antes de publicar.
- Revisão executável independente; registrar evidências e limitações em STATUS.
- Avaliação posterior com pessoas: encontrar próximo estudo, identificar fonte e praticar.
  Registrar tempo/erros observados com consentimento; não chamar teste automatizado de estudo de usuários.

## 9. Conceito navegável

Arquivos: `docs/design/platform-concept/`. Executar na raiz do checkout:

```powershell
node docs/design/platform-concept/serve.mjs
```

Abrir http://127.0.0.1:4176. Três telas: Hoje, Biblioteca e Questões.
Três variantes de cenário e modo foco. Dados inteiramente ilustrativos, aviso permanente;
nenhum acesso ao progresso, store, engines ou fontes externas. Uma questão de demonstração
com seleção e confirmação bloqueada mostra hierarquia de feedback, sem pontuar o aluno.
Biblioteca tem recursos fictícios identificados, sem links ou licença presumida.

O conceito não implementa a arquitetura de curadoria, todo o currículo, router de produção,
SRS, offline/PWA, export/import ou todos os estados de componentes.
A validação do conceito não aprova release do site. Evidências em PLATFORM_CONCEPT_REVIEW.md.
