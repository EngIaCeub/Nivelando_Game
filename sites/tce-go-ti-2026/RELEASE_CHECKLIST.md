# Release checklist — StudyOS TCE-GO TI 2026

Gate F10: release standalone para GitHub Pages. F11 não iniciado.

## Validações

- [x] Build final em `sites/tce-go-ti-2026/dist/`.
- [x] Base path relativo: assets usam `./`; rotas são fragments (`#today`, `#plan`, `#subjects`, `#questions`, `#reviews`, `#progress`).
- [x] Manifest PWA: `start_url`, `scope` e `id` relativos, `display: standalone`, ícone local.
- [x] Service worker: shell, Exam Pack e diagnósticos incluídos no cache versionado.
- [x] Refresh direto: navegação por hash não depende de rewrite do servidor.
- [x] Mobile: viewport meta, media query até `42rem`, menu responsivo e alvos de toque.
- [x] Teclado: skip link, landmarks, foco visível e controles nativos.
- [x] Export/import, IndexedDB após reload, simulatedScore, retakes, XP idempotente e isolamento por `examId`: cobertos por `release-diagnostics.html` e testes F10.
- [x] Recursos externos: 11 URLs com `verified: true`, URL HTTPS, fonte e data de verificação.
- [x] Integridade do Exam Pack: payload publicado igual ao pacote-fonte e hash do edital conferido.
- [x] Leakage test: Core sem identificadores do TCE-GO.
- [x] Suíte automatizada: 25/25 testes aprovados.

## Publicação no GitHub Pages

1. Execute, na raiz, `node --test` usando o Node do projeto.
2. Publique o conteúdo de `sites/tce-go-ti-2026/dist/` como artefato do GitHub Pages. Em Pages, use uma Action ou a pasta `dist` como diretório de publicação; não publique a raiz do repositório.
3. Se usar uma Action, faça upload de `sites/tce-go-ti-2026/dist` e configure `actions/deploy-pages`.
4. Abra a URL publicada e valide `/`, cada fragmento de navegação e `/release-diagnostics.html`.
5. Em uma primeira visita online, abra os diagnósticos, execute-os, recarregue a página e execute novamente para confirmar o marcador persistido no IndexedDB.
6. Para o smoke offline, carregue a aplicação uma vez online, aguarde o service worker e recarregue sem servidor/rede; o shell e os dados do Exam Pack devem permanecer acessíveis.

## Evidências

- Teste automatizado: `node --test` — 25 pass, 0 fail.
- Diagnóstico de navegador: `dist/release-diagnostics.html`.
- Build: `dist/` contém shell, PWA, service worker, cópia de runtime do Core e payload completo do Exam Pack.
- Core alterado nesta release: não.
