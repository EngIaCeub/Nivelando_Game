# Factory Roadmap — F0–F11

Backlog do Orchestrator. Cada gate só pode ser iniciado depois que os critérios do gate
anterior estiverem validados e registrados em `docs/STATUS.md`.

| Gate | Escopo | Ownership principal | Classe | Critério de saída |
|---|---|---|---|---|
| F0 | arquitetura, fronteiras, schemas e testes-base | Architect + QA | R4/R1 | teste de leakage e smoke de schemas verdes; ADRs e backlog registrados |
| F1 | shell web/PWA, acessibilidade e base path | Frontend | R2/R1 | shell responsivo, teclado, offline/base path verificados |
| F2 | IndexedDB, event log, migração e export/import | Learning Engine + Architect | R3 | contrato Storage/Events testado, round-trip e reload verdes |
| F3 | currículo, fila e plano de estudo | Curriculum + Planner | R3/R2 | plano explicável e desacoplado de edital |
| F4 | quiz, simulado e score | Question Ingestor + QA | R3/R1 | primeira tentativa imutável e retentativa sem mutação do score |
| F5 | revisão espaçada, mastery e caderno de erros | Revision Engine | R3 | mastery separado e invariantes cobertos |
| F6 | XP, streak, níveis e conquistas | Gamification | R2 | eventos idempotentes; sem recompensa artificial |
| F7 | analytics por tópico/disciplina | Analytics | R2 | métricas reproduzíveis a partir dos eventos |
| F8 | factory, validação e geração standalone/hub | Exam Pack Generator + Release | R3/R2 | pack válido gera os dois modos |
| F9 | conteúdo TCE-GO TI 2026 | Exam Intake + Curriculum + Resource/Question | R3/R2 | proveniência validada; nenhum dado no Core |
| F10 | release standalone | Release + QA | R2/R1 | build publicado com offline, base path e checklist |
| F11 | dry run com segundo edital | Orchestrator + QA | R4/R3 | segundo pack funciona sem alterar contratos do Core |

## Dependências e regras

- F1–F11 dependem de F0 aprovado.
- O Orchestrator pode alterar o escopo global; agentes têm ownership restrito.
- Mudanças em contratos, schemas, score, persistência ou decomposição exigem R4/R3 e ADR.
- Conteúdo específico de edital permanece em `exam-packs/<exam-id>/`.
