---
name: question-ingestion
description: Workflow especializado do StudyOS para question-ingestion.
---
# question-ingestion

Normalize somente questões utilizáveis. Preserve proveniência, banca, ano, licença,
gabarito validado e fingerprint.

## Auditoria de flashcards e questões

- Leia `contracts/CONTENT_VALIDATION.md` e rode `node scripts/content-audit.mjs` para
  obter a fila heurística por ID. Sinais de template nunca aprovam ou rejeitam o conteúdo.
- `status: validated` legado, autoria do gerador e schema válido não provam revisão factual.
- Consulte cada fonte em contexto e anote recorte específico. Edital demonstra escopo,
  não necessariamente a resposta didática.
- Só rotule questão como prova FCC após confirmar concurso, banca, ano, caderno/número e
  gabarito final em fonte verificável. Questão criada pelo produto fica `original`.
- Mantenha candidatos e itens pendentes fora de sessões novas. Preserve IDs/revisões usados
  em sessões históricas, primeira tentativa, score e XP.
- Nunca copie questão/material protegido apenas porque estava publicamente acessível.
