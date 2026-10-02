# Scoring Contract

Para cada questionId dentro de simulationRunId:
- primeira resposta válida cria firstAttempt;
- firstAttempt é imutável;
- simulatedScore = firstAttempt corretas / firstAttempt respondidas * 100;
- retentativas não alteram simulatedScore;
- retentativas podem alterar mastery;
- reload não cria firstAttempt nova;
- nova simulationRun cria contexto novo.
