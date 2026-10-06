# Scoring Contract

Para cada questionId dentro de simulationRunId:
- primeira resposta válida cria firstAttempt;
- firstAttempt é imutável;
- simulatedScore = firstAttempt corretas / firstAttempt respondidas * 100;
- retentativas não alteram simulatedScore;
- retentativas podem alterar mastery;
- reload não cria firstAttempt nova;
- nova simulationRun cria contexto novo.

## Recuperação de respostas (O4)

Uma resposta deliberada pode declarar `operationId`, persistido na intenção antes
de aplicar efeitos. A tentativa e seu recibo devem ser gravados atomicamente,
inclusive na primeira resposta. Repetir a mesma operação devolve seu resultado sem
criar tentativa; reutilizar a identidade com parâmetros incompatíveis deve falhar.
Uma retentativa deliberada nova usa identidade nova.

Export/import preserva recibos e IDs compostos completos. Chamadas legadas sem
`operationId` permanecem compatíveis, mas não oferecem deduplicação por operação;
não se deve inventar recibos para respostas históricas de backups antigos.
