# Scripts planejados
validate-pack, create-pack, build-standalone, build-hub, check-links,
detect-core-leakage e export-progress.

Biblioteca: node scripts/library-audit.mjs <exam-id> [--require-complete]
[--output <arquivo.json>]. Diagnóstico local sem rede; schema validation é etapa separada.
Não registra checagens de URL nem aprova editorialmente fontes automaticamente.

Prévia standalone: `node scripts/preview-standalone.mjs <site-id> [porta]`, após o build.
Servidor restrito a loopback e à pasta `sites/<site-id>/dist`; base `/Nivelando_Game/`.
