# Pixel plataforma — integração local

Data: 2026-10-06. Checkout: `C:/CodexProjects/Nivelando_Game`.
Status: **publicado no GitHub Pages** em `5e4ab6b5b4c58f6de4467614125a49bfc024fb34`; workflow 37557567793 concluído com sucesso.

## Entrega

- Fundação: tokens existentes consolidados em creme, verde e tinta escura; bordas
  quadradas, ícones SVG e cenários originais Ilhas/Bosque/Observatório. Sem fonte externa,
  dependência de rede para arte ou animação contínua. Modo foco recolhe a decoração.
- Hoje: próxima atividade antes do HUD/meta; justificativa em disclosure; diagnóstico
  em disclosure após a agenda; retomada de sessões no início. Dados vêm dos adapters
  existentes. Trocar cenário/modo foco não concede XP nem grava progresso.
- Navegação: grupos nativos Conteúdos/Prática, destinos anteriores preservados, novo
  `#library`, fechamento do menu e foco explícito. Hash e histórico continuam nativos.
- Matérias: regiões com títulos reais e abertura da hierarquia existente; links para
  Biblioteca, prática e flashcards do tópico, sem novas regras de bloqueio/desbloqueio.
- Biblioteca: busca sem acentos e filtros por matéria, tópico, formato, idioma e acesso;
  unidades, objetivos/pré-requisitos provisórios, lacunas, papéis/recortes v2 quando
  presentes, proveniência, licença e verificação. Metadados em disclosure. Links externos
  HTTP(S) sem credenciais; URLs inseguras não abrem nem contam para elegibilidade.
- Estudo/Progresso/Configurações: compartilham os tokens; questão/flashcard em superfícies
  quietas e largura de leitura limitada. Engines de score, retentativa, XP, SRS e storage
  não foram alterados. Handlers de pausa, resposta e backup continuam os existentes.

## B5 e limites da biblioteca

Consulta em `core/src/library-catalog.js`, UI em `core/src/library-ui.js`, cobertura
editorial pura compartilhada por runtime e CLI em `core/src/library-coverage.js`.
O adapter do site carrega `library.json`/`source-map.json`. Falha de unidades mantém
referências disponíveis; retry refaz somente a consulta, sem reload global nem store.
Ordenação considera o papel do recurso no tópico/matéria selecionado.

Dados reais: TCE-GO tem 45 unidades e 20 recursos legados, **zero recursos v2 revisados**;
TJTO tem 13 unidades e dois recursos legados, também zero cobertura v2. Ambos seguem
`planned` com escopo `pending`. Objetivos iniciais não substituem decomposição editorial
do edital. Nenhum link foi promovido a principal, nenhuma licença inferida, nenhum recurso
externo incorporado. Candidatos continuam excluídos do build público.

O catálogo/metadados/assets entram no precache existente do standalone; isso não torna
apostilas, livros ou vídeos externos disponíveis offline. Não foi executado novo teste
offline nesta integração. B2–B4, B6 e B7 permanecem trabalhos editoriais próprios.

## Verificações desta integração

| Evidência | Resultado e limite |
| --- | --- |
| Build standalone | Concluído; shell inicializado, fixture genérica sem `core/assets` preservada e imports/assets do HTML copiados em caminhos relativos |
| Validação de conteúdo | JSON Schema/factory: TCE-GO 289 questões, TJTO 3, template 0; três packs válidos |
| Auditoria editorial TCE-GO/TJTO | Sem erros estruturais; lacunas e legado explicitamente excluídos; ambos incompletos |
| Sintaxe | Módulos alterados verificados com `node --check` |
| Diff | `git diff --check` sem erros; avisos locais de conversão CRLF não alteram o resultado |
| Arte | Três SVGs: 5.819 bytes originais, 2.686 bytes gzip somados; abaixo de 150 KB. Não mede paint/performance |
| Contraste por cálculo sRGB | Texto/superfície 12,01:1; secundário 6,29:1; botão branco/verde 7,67:1; foco/creme 6,75:1; borda/superfície 3,50:1 e borda/base 3,15:1 |
| Render CUA | 1280×900, 390×844, 375×667 e reflow 640×450 inspecionados. Não equivale a zoom real 200% nem auditoria WCAG integral |
| Overflow | DOM: 390 → client/scroll 375/375; reflow 640 → 625/625 (scrollbar ocupa 15 px) |
| Cenários/modo foco | Bosque e Observatório renderizados; modo foco `aria-pressed=true`, cena oculta e recurso carregado com largura natural 640; opção Ilhas restaurada |
| Biblioteca | Filtro SQL retornou dois recursos; busca sem resultado mostrou estado vazio; limpar filtros restaurou 20 |
| Navegação | Menu móvel, grupos/teclado, Escape, links e back/forward inspecionados; mesmo hash contextual focou `#library` e rolou ao destino |
| Sessão isolada | Biblioteca abriu quiz SQL de 11 questões; primeira resposta registrada/bloqueada; troca de atividade ativa impediu novo estudo; pausa/reload/retomada preservaram a resposta |

As verificações de navegação/sessão ocorreram na origem de loopback, separada dos dados
do site público. Um erro esperado da guarda de sessão foi observado; apresentação agora
usa aviso de pausa, sem alegar falha de persistência para esse caso.
`pnpm test` foi tentado localmente, mas Windows sandbox/Edge falhou ao abrir perfis
temporários de IndexedDB (ENOENT). No CI Linux, o candidato final passou a suíte completa
186/186, checks de produção, browser release gate responsivo, scanner e validação do
staging; deploy do Pages concluído pelo workflow 37557567793. Build público `build-meta.json`
confirma o SHA acima. Requisições públicas com cache-bust confirmaram HTML do shell,
`platform-shell.js`, bundle da Biblioteca, layout Hoje, cenários, modo foco e estilos dos
mundos. A aba pública de inspeção continuou exibindo um service worker antigo já instalado;
nenhum dado local foi apagado nem a atualização foi forçada. Smoke remoto interativo em
perfil limpo permanece distinto do browser release gate de CI.

## Revisão independente

GPT-6.1 Sol/high, ownership somente leitura: revisão estática inicial sem P0/P1 e quatro
P2: foco no mesmo hash, retry global, rank de papel fora do filtro e URL com credenciais
aceita pelo auditor. Os quatro foram corrigidos. Na revisão de release, o revisor encontrou
inicialização ausente do shell e risco de omitir imports HTML do build genérico; ambos foram
corrigidos. Parecer final: favorável à integração local, sem bloqueios de código. Gates de
release passaram no workflow Pages para o SHA publicado. Curadoria continua planned;
B2–B4/B6/B7 não foram aprovados.

## Capturas locais

Diretório de evidências da conversa:
`C:/Users/felip/.codex/visualizations/2026/10/06/01a112e1-6b8f-77d2-b4b2-541f46c5c336/`.

- `platform-implementation-desktop.jpg`: Hoje, cenário e retomada.
- `platform-implementation-mobile.jpg` e `platform-implementation-small.jpg`: viewport estreito.
- `platform-implementation-library.jpg`: filtros, unidade e lacuna.
- `platform-implementation-resources.jpg`: recursos reais e disclosures de proveniência.
- `platform-implementation-question.jpg`: resposta registrada e alternativas bloqueadas.
- `platform-implementation-focus.jpg`: modo foco com decoração recolhida.

As primeiras capturas antecedem pequenos ajustes finais de borda/copy; capturas Hoje
renovadas ao concluir. Captura de questão usa resposta de inspeção local, sem dados reais
do usuário e sem representar banco de provas FCC completo.
Captura final 375×667 mostra a ação de retomada a 495 px e nenhum overflow (360/360 px);
viewport foi restaurado após a inspeção. A prévia permanece no loopback para revisão.

## Gates restantes

V6 foi publicada depois dos gates automatizados e browser check do workflow. Revisão
posterior deve cobrir perfil realmente limpo, zoom real/reduced-motion e segundo pack.
V1–V5 estão integradas, sem declarar cada critério manual como auditado integralmente.
Curadoria integral B6 exige fontes por recorte e revisão factual própria.
