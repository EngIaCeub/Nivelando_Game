# Diretrizes dos planos de ação de UX

Origem: teste exploratório do site publicado em 2026-10-08, registrado em `UX_PUBLISHED_REVIEW_2026-10-08.md`.

Cada prioridade deve concluir implementação, validação e registro de evidências antes do avanço para a seguinte.

## 1. P0 — Qualidade dos flashcards

- Auditar todo o deck, identificando respostas genéricas, erros conceituais e identificadores internos expostos.
- Cada cartão deve abordar um conceito específico, com pergunta compreensível e resposta que permita avaliar a lembrança.
- Manter conteúdo, explicações e proveniência no Exam Pack. O Core deve apenas apresentar e processar os cartões.
- Retirar temporariamente da prática cartões sem qualidade suficiente, preservando os registros históricos do aluno.
- Validar schemas e realizar revisão editorial antes da publicação.

**Aceite:** nenhum cartão publicado expõe identificadores internos ou depende de uma resposta genérica para ensinar o conceito.

## 2. P1 — Continuidade e retomada de sessão

- Reproduzir o problema em perfil descartável, incluindo sessões com respostas registradas.
- Distinguir falha de apresentação do botão de eventual falha de persistência; não presumir perda de dados.
- Apresentar uma ação clara de retomada em Hoje e Questões enquanto houver sessão pendente.
- Restaurar posição, respostas e estado da sessão após pausa, reload e reabertura.
- Garantir que retomadas não dupliquem eventos, XP ou respostas, nem alterem a primeira tentativa.

**Aceite:** o aluno consegue continuar do ponto salvo, com histórico preservado e testes automatizados dos cenários de interrupção.

## 3. P1 — Cobertura didática da biblioteca

- Seguir `contracts/DIDACTIC_LIBRARY.md`, `docs/DIDACTIC_LIBRARY_PLAN.md`, ADR 004 e o workflow de curadoria em `skills/resource-curation/SKILL.md`.
- Priorizar unidades recomendadas pela agenda, sem excluir a revisão dos demais itens do edital.
- Para cada unidade, definir objetivos, recorte do material, sequência de estudo e recurso primário revisado.
- Preservar `topicIds` e registrar proveniência, acesso, licença e situação editorial separadamente.
- Manter lacunas visíveis. Um link acessível não comprova cobertura pedagógica.
- Liberar unidades revisadas progressivamente; declarar cobertura integral somente após auditoria completa e parecer independente.

**Aceite:** cada unidade publicada como coberta possui evidência editorial verificável, sem confundir cobertura do catálogo com aprendizagem do aluno.

## 4. P2 — Orientação na tela Plano

- Apresentar agenda, tempo disponível, atividades e respectivos estados.
- Permitir iniciar ou retomar atividades diretamente pelo Plano.
- Explicar de forma acessível os motivos das recomendações.
- Usar os mesmos dados e regras da agenda Hoje, evitando informações divergentes.
- Prever estados de agenda vazia, sessão pendente, atividade concluída e ausência de material.
- Validar leitura e operação em celular e por teclado.

**Aceite:** o aluno identifica o que estudar, quanto tempo reservar e qual ação executar sem precisar procurar em outra tela.

## 5. P2 — Clareza dos títulos e justificativas

- Criar títulos de apresentação curtos e específicos no Exam Pack.
- Preservar a descrição curricular completa e os identificadores estáveis.
- Separar título, duração, estado e justificativa visualmente.
- Colocar métricas e motivos detalhados em uma expansão acessível, como “Por que estudar agora?”.
- Evitar truncamentos que impeçam distinguir atividades.
- Verificar títulos longos em Hoje, Plano, Questões e Biblioteca.

**Aceite:** as atividades são identificáveis em tela pequena, e seus detalhes continuam disponíveis por teclado.

## Diretrizes comuns de entrega

- Trabalhar no checkout canônico da interface, confirmado antes de editar.
- Preservar histórico, score, mastery e compatibilidade de dados.
- Executar testes proporcionais à mudança e as validações exigidas pelos contratos.
- Registrar cenário, resultado esperado, resultado observado e evidência de cada aceite.
- Atualizar documentação e STATUS, distinguindo concluído, parcial e pendente.
- Interromper o avanço se houver violação de invariantes.
- Tratar offline, export/import e simulado completo como verificações pendentes da release.
- Identificar testes automatizados e exploratórios como evidência sintética; validação com usuários exige execução própria.
