# Model Routing — atualizado em 2026-10-02

A arquitetura usa **classes de capacidade**, não depende de um nome fixo para sempre.

## Classes

| Classe | Uso | Preferência atual |
|---|---|---|
| R4 Frontier | arquitetura crítica, ambiguidade alta, planejamento multiagente | GPT-6 Astra ou modelo frontier mais capaz disponível |
| R3 Strong | system design, segurança, scoring, ingestão complexa, revisão de arquitetura | GPT-6.1 Sol ou equivalente forte |
| R2 Balanced | integração, refactors moderados, curriculum/resource reasoning | GPT-5.6 Sol / Terra conforme custo e disponibilidade |
| R1 Fast | código localizado, testes, fixtures, CSS, schemas, transformações | GPT-5.6 Terra/Luna ou menor Codex confiável |
| R0 Mechanical | lint, formatação, renomeações, documentação mecânica | menor modelo confiável disponível |

## Política

Use R4/R3 quando a decisão puder:
- mudar contratos públicos;
- causar perda de progresso;
- alterar score;
- modificar schema persistido;
- afetar privacidade/segurança/licença;
- definir decomposição de agentes.

Use R1/R0 quando:
- o contrato já estiver estável;
- a tarefa for local e facilmente testável;
- a saída puder ser verificada automaticamente.

## Escalonamento automático

Suba uma classe se:
- duas tentativas falharem;
- houver contradição entre fontes;
- mudança cruzar 3+ módulos;
- testes de invariantes quebrarem;
- edital tiver regra ambígua com impacto no plano.

Antes de automatizar nomes específicos de modelos, confira documentação oficial da OpenAI,
porque disponibilidade e recomendações mudam.
