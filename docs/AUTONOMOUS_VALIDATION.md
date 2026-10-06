# Aprovação autônoma de gates

Autorização explícita do usuário: 2026-10-03, nesta tarefa, para implementar o roadmap
restante, corrigir falhas recuperáveis, publicar e avaliar deployments, substituindo
validação humana por avaliação Astra. Notificar etapa concluída/veredito e falhas fatais.

Atualização autorizada em 2026-10-06: o modelo de aprovação independente passa a ser
`gpt-6.1-sol/high`. Critérios, independência do avaliador e gates permanecem obrigatórios.
O histórico das revisões Astra é preservado; reprovações exigem novo parecer após correções.

1. Planejar escopo e ownership; delegar implementação em arquivos disjuntos.
2. Implementar e executar schema/content, invariantes, regressões e browser real isolado.
3. Submeter evidências a QA/Architect independente usando `gpt-6.1-sol/high`.
4. Corrigir blockers e repetir casos afetados; registrar resultados reais.
5. Publicar somente candidato local aprovado; acompanhar Actions e validar URL real.
6. Submeter smoke remoto ao avaliador e encerrar gate apenas com evidência suficiente.
7. Tag aponta exatamente para commit publicado e validado. Não mover tags anteriores.

Uma avaliação LLM não substitui execução de testes nem autoriza presumir resultado.
O agente registra o modelo realmente acionado; disponibilidade ausente é limitação
explícita, nunca um parecer fictício atribuído a outro modelo. Não coletar dados reais de estudantes para
testes. Não iniciar gate dependente enquanto houver blocker do gate atual.
