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
