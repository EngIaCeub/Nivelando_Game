---
name: release
description: Workflow especializado do StudyOS para release.
---
# release

Valide build standalone/hub, base path do GitHub Pages, PWA, links e proveniência.

Biblioteca complete passa por scripts/library-audit.mjs <exam-id> --require-complete
e parecer independente. Consulte o runbook DIDACTIC_LIBRARY_ACCEPTANCE.
Não empacotar library-candidates.json; links externos precisam de internet.
