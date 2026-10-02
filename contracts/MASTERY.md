# Mastery Contract

`masteryEstimate` é global por `canonicalConceptId`, independente de `examId`. Progresso
curricular, score simulado, conclusão e revisões continuam namespaced por `examId`.

Cada registro contém `canonicalConceptId`, `masteryEstimate`, `confidence`, `source`,
`assessedAt`, `questionCount`, `firstTryCorrect`, `firstTryWrong`, `selfAssessment` opcional,
`reviewStatus` e `schemaVersion`.

Questões diagnósticas têm peso superior à autoavaliação; autoavaliação isolada não comprova
domínio. Export/import de mastery é versionado e não apaga registros existentes.
