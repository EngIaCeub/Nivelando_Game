# Model Routing

Política de seleção de modelos dos agentes StudyOS. O Orchestrator aplica estas
atribuições ao delegar; o nome do agente, por si só, não força a plataforma a trocar
o modelo da sessão.

## Atribuição padrão

| Agente | Modelo padrão | Esforço | Uso |
|---|---|---:|---|
| Orchestrator | `gpt-6-astra` | high | Decisões de escopo/arquitetura e veredito integrado dos gates. |
| Architect | `gpt-6-astra` | high | Fronteiras do Core, contratos, schemas persistidos, ADRs e riscos sistêmicos. |
| QA | `gpt-6-luna` | low/medium | Implementar e executar testes, fixtures, lint e verificações repetíveis. |
| QA independente de gate/release | `gpt-6.1-sol` | high | Revisão adversarial independente; reproduzir invariantes e emitir aprovado/reprovado. |
| Exam Intake | `gpt-6-luna` | medium | Extração mecânica com citações e source-map; fatos críticos exigem checagem independente. |
| Exam Pack Generator | `gpt-6-luna` | medium | Gerar/editar arquivos de pack e rodar validadores. |
| Curriculum | `gpt-6-luna` | medium | Transformações de currículo, IDs e arquivos JSON segundo contratos existentes. |
| Resource Curator | `gpt-6-luna` | low/medium | Metadados e verificações repetíveis de recursos. |
| Question Ingestor | `gpt-6-luna` | medium | Normalização, fingerprints, proveniência e edição do banco autorizado. |
| Study Planner | `gpt-6-luna` | medium | Aplicar/implementar algoritmo especificado e gerar planos. Sol pode revisar novo desenho do algoritmo. |
| Learning Engine | `gpt-6-luna` | medium | Implementação e testes; decisões novas sobre invariantes de score sobem ao Architect. |
| Revision Engine | `gpt-6-luna` | medium | Implementação, fixtures e testes do contrato de revisão existente. |
| Gamification | `gpt-6-luna` | low/medium | Implementação e testes de eventos/XP segundo contrato. |
| Analytics | `gpt-6-luna` | low/medium | Métricas determinísticas, relatórios e transformações locais. |
| Frontend | `gpt-6-luna` | low/medium | UI, CSS, acessibilidade e integrações com interfaces já definidas. |
| Release | `gpt-6-luna` | low/medium | Scripts, configuração, builds e automação repetível. Sol 6.1 valida gates de release. |

`gpt-6.1-sol` é escalonamento intermediário para desenho técnico complexo e revisão
de implementação que cruze domínios, antes de envolver Astra. Não é o modelo padrão
para editar arquivos. Astra fica reservado para decisões arquiteturais de alto impacto.
Por autorização do usuário em 2026-10-06, toda aprovação independente de gate/release
usa `gpt-6.1-sol/high`, inclusive quando desempenhada pelo papel QA/Architect.
O Orchestrator integra esse parecer; os modelos de arquitetura e implementação
permanecem inalterados. Esta política não reatribui pareceres históricos nem aprova
automaticamente candidatos reprovados.

## Escalonamento

Começar com Luna no menor esforço que resolva o trabalho. Subir para medium quando a
tarefa exigir análise de múltiplos arquivos. Chamar Sol quando houver interação entre
domínios ou duas tentativas econômicas falharem. Chamar Astra se houver impacto em
contrato público, score, persistência/migração, segurança/privacidade, licença, fronteira
do Core. Para aprovação de gate/release, invocar revisor independente `gpt-6.1-sol/high`.

Uma reprovação não pode ser convertida em aprovação apenas por aumentar o modelo:
corrigir a causa, executar evidência repetível e solicitar nova revisão independente.

## Limite de execução

Estas são atribuições de roteamento para delegações futuras, não prova de qual modelo
executou uma tarefa passada. Ao delegar, o Orchestrator deve passar `model` e `thinking`
explicitamente quando a plataforma oferecer esses parâmetros. Se o modelo não estiver
disponível, usar a alternativa econômica disponível para implementação; não alegar que
um modelo revisou sem sua invocação efetiva.
