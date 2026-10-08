# Manutenção da biblioteca didática

## Escopo e responsabilidade

Este runbook mantém fontes, recortes, disponibilidade, direitos e cobertura de cada
Exam Pack. A manutenção não altera score, mastery, XP, tentativas ou histórico de
atividade do estudante.

- Responsável operacional: mantenedor editorial do Exam Pack, indicado pelos
  mantenedores do repositório.
- Revisor de alterações de cobertura `complete`: pessoa diferente do autor, com
  decisão registrada para o SHA exato do candidato.
- Situação em 08/10/2026: o papel está definido; não há indivíduo nominal registrado.
  Essa nomeação continua pendente de governança do projeto.

## Frequência mínima

- Recursos sujeitos a lei, edital, política pública ou versão de produto: revisar a
  cada 30 dias e imediatamente após publicação de retificação/revogação conhecida.
- Outros recursos primários e percursos: revalidar no máximo a cada 90 dias, conforme
  `library.policy.reviewIntervalDays`.
- Escopo, IDs, links, direitos, questões e flashcards: auditoria integral antes de cada
  release e revisão extraordinária quando uma fonte mudar ou houver contestação.
- Avisos pontuais entre revisões são tratados como evento editorial; não esperar o
  próximo ciclo se uma norma for revogada ou um link passar a apontar para material
  incompatível.

## Procedimento por recurso/unidade

1. Abrir a URL exata e registrar data, URL final, método e resultado. HTTP 200, página
   de login/captcha, bloqueio ou erro não demonstra leitura nem elegibilidade.
2. Conferir edição, autoria, idioma, acesso e licença de reprodução em campos separados.
   Licença desconhecida mantém o recurso em link externo; não baixar, copiar ou embutir.
3. Ler novamente os recortes registrados em `locator`; avaliar se ainda ensinam o
   objetivo e se conflitos ou limites de edição mudaram.
4. Atualizar evidência editorial e decisão. Ao trocar edição ou URL, criar novo recurso
   com proveniência própria, arquivar o anterior e preservar seus IDs/histórico.
5. Se fonte ou recorte perder elegibilidade, marcar `broken`/`archived` quando cabível,
   remover sua contribuição de cobertura e regenerar auditoria. Regressar `complete` a
   `partial` quando houver unidade sem fonte primária atual ou percurso elegível.
6. Regenerar candidato, hash, ledger, baseline e parecer independente; nenhuma aprovação
   anterior vale para novo SHA.
7. Executar `node scripts/library-audit.mjs <exam-id> --require-complete`,
   `node scripts/validate-content.mjs`, `node scripts/content-audit.mjs` e testes
   pertinentes. Registrar falhas ambientais separadamente de resultados aprovados.
8. Arquivar snapshot antes de promoção. Conferir questões, cartões, conteúdo histórico e
   estado do estudante; publicar somente depois do gate de release correspondente.

## Evidência e fila

Manter a fila de rechecagem por fonte em `source-map.json` e nos pareceres do Exam Pack;
não criar verificação automática de rede presumida. Registrar proprietário, data,
resultado, URL final, edição/corte e decisão em `docs/content-review/` e refletir o status
em `docs/STATUS.md`. A fila deve permitir localizar as fontes com revisão vencida pelo
campo `reviewedAt`/`checkedAt` e pela política do pack.

## Estado da rodada de 2026-10-08

A biblioteca TCE-GO está `complete` após QA independente e promoção local: 209/209
unidades, 309 recursos elegíveis, 43 percursos, zero lacunas. A próxima rechecagem
ordinária vence em até 90 dias; fontes normativas e de produto têm ciclo de 30 dias.
Esta rodada não concluiu o aceite visual B5, o dry run editorial TJTO B6, a nomeação de
um indivíduo responsável B7 nem o gate P1 de publicação.
