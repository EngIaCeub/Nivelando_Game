# Product Spec — StudyOS

## Problema

Transformar um edital em uma trilha operacional de estudo: o que estudar, em qual ordem,
quando revisar, quais questões resolver e como medir evolução.

## Entidade principal: Exam Pack

Um Exam Pack contém:
- identidade do concurso/cargo/banca;
- disciplinas e tópicos;
- pesos/prioridades;
- calendário;
- plano semanal inicial;
- recursos;
- questões;
- simulados;
- regras de prova relevantes;
- tags de sobreposição com outros concursos.

## Fluxo do estudante

1. abre "Hoje";
2. recebe fila priorizada;
3. consome conteúdo;
4. responde questões;
5. recebe feedback;
6. agenda revisão;
7. completa revisões vencidas;
8. acompanha cobertura, acurácia de primeira tentativa, mastery e retenção.

## Requisitos funcionais

RF01 carregar qualquer Exam Pack válido.
RF02 gerar navegação por disciplinas/módulos/tópicos.
RF03 plano semanal e fila diária.
RF04 recursos por tópico.
RF05 quiz/flashcard.
RF06 primeira tentativa imutável.
RF07 retentativa pedagógica.
RF08 score simulado de primeira tentativa.
RF09 mastery separado.
RF10 revisão espaçada.
RF11 caderno de erros.
RF12 XP, streak, níveis e conquistas.
RF13 analytics por tópico/disciplina.
RF14 export/import.
RF15 offline/PWA.
RF16 gerar standalone por Exam Pack.
RF17 suportar hub multi-exam.
RF18 detectar sobreposição de tópicos entre Exam Packs.
RF19 criar novo Exam Pack a partir de edital.
RF20 validar proveniência/links antes de release.

## Não objetivos iniciais

Login, pagamentos, scraping comercial, IA obrigatória em runtime, comunidade/social,
sincronização multi-dispositivo.

## Stack preferida

HTML5, CSS moderno, JavaScript/TypeScript modular se justificado, IndexedDB, Service Worker,
JSON Schema e testes automatizados. Framework só entra via ADR se reduzir complexidade.
