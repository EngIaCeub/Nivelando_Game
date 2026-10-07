# Factory Workflow

## Novo edital

```text
PDF/URL do edital
   ↓
Exam Intake Agent
   ↓
facts.json + source map
   ↓
Curriculum Agent
   ↓
curriculum.json
   ↓
Resource + Question Agents
   ↓
resources.json / questions.json
   ↓
Planner
   ↓
study-plan.json
   ↓
Schema + provenance validation
   ↓
Exam Pack
   ↓
Standalone site ou Multi-exam hub
```

## Regra anti-alucinação

O agente separa:
- `verified_fact`: explicitamente confirmado na fonte;
- `derived`: cálculo/transformação reproduzível;
- `assumption`: hipótese temporária, nunca publicada como fato.

Dados de edital sem fonte devem bloquear o release do pack.

## Biblioteca didática

Curriculum audita edital e decompõe unidades em library.json → Resource Curator registra
candidatos → revisão de recorte/licença/acesso → resources.json v2 → schemas + auditoria
por unidade → QA independente → biblioteca partial ou complete → build da etapa runtime.
Manutenção revalida links e versões, registrando pendências e substituições.
Milestones B1–B7 e ownership: `docs/DIDACTIC_LIBRARY_PLAN.md`.
Legado é inventariado sem atribuir cobertura v2. Candidatos ficam fora do build.
