# Aceite da biblioteca
1. Validar schemas resource/library e referências unitId/topicId/resourceId; IDs únicos.
2. Conferir escopo com o edital real, item a item, e registrar source/locator/evidence.
3. Ler os recortes utilizados; verificar autor, formato, idioma, edição, acesso e licença.
4. Executar library-audit; planned/partial mostram lacunas, complete deve passar
   --require-complete. Revisar cobertura também por disciplina e recursos vencidos.
   Quando houver percurso, validar duas ou mais fontes distintas, locators, cobertura
   de cada objetivo, elegibilidade gratuita de todas as etapas e parecer editorial.
5. Exercitar casos: sem material, pago apenas, login exigido, parcial, HTTP bloqueado,
   licença desconhecida para bundle, URL insegura, resource/unit duplicado e órfão.
6. Para B5/B6, inspecionar renderização, teclado, leitor de tela, mobile, filtros,
   base path relativo e conteúdo offline; links externos continuam dependentes de internet.
7. Para mudança em estado de estudo, conferir score imutável, XP idempotente, reload,
   export/import e migração sem perda.
8. Repetir auditoria e percurso de consulta em segundo pack sem regra específica no Core.
9. Registrar parecer QA/Architect independente, comandos, resultado, data e limitações.
10. Atualizar STATUS e relatório; publicar somente a etapa efetivamente implementada.

Rechecagem de links: consultar URL exata, registrar status/finalUrl/data/método; conferir
HTML quando HTTP 200 for login/erro disfarçado. Revisão editorial permanece separada.
Não sobrescrever verificação histórica com sucesso presumido após falha de rede.
