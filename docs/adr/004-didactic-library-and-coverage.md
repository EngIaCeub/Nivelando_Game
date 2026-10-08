# ADR 004 — Biblioteca didática curada por unidade
Data: 2026-10-06
Status: aceita para arquitetura; entrega runtime e curadoria permanecem pendentes.

## Contexto
O catálogo de recursos e os tópicos agrupados não demonstram cobertura pedagógica
de cada item do edital. O projeto tem dois diretórios: Nivelando_Game é o checkout
publicado; studyos-agentic-factory é uma cópia anterior. A arquitetura é registrada
em ambos; os dados e estados de release permanecem próprios de cada diretório.

## Decisão
Manter resources.json e IDs curriculares existentes. Introduzir library.json com
unidades subordinadas a topicId e revisão do escopo. Campos didáticos são aditivos,
ativados por libraryVersion:2. Candidatos ficam em arquivo excluído da publicação.
Política e análise são genéricas. Este trabalho entrega contrato, schemas, skill,
papéis, comandos de auditoria e baseline de lacunas; o runtime será uma etapa própria.
Links públicos são referências; cópia e embed dependem de licença e autorização.
O schema B1 permite apenas delivery:link e exige primário gratuito. Entrega local e
embed serão extensões B5 com localização/integridade e autorização específica;
o auditor rejeita essas operações antes dessa implementação.
Fontes primárias gratuitas e avaliação editorial sustentam a afirmação de cobertura.
Uma unidade pode ser ensinada por um único recurso primary/full ou por um percurso
didático explícito: no mínimo duas fontes gratuitas distintas, cada URL/proveniência
mantida em seu registro próprio, locators e objetivos vinculados por etapa, todos os
objetivos cobertos e parecer editorial aprovado. Os recursos individuais conservam
seu extent real; um percurso não transforma partes em uma fonte fictícia nem aprova
um link apenas por estar acessível.

## Alternativas
Fragmentar IDs de currículo agora exigiria migração de progresso. Hospedar todos os
materiais implicaria autorização, atualização e custo; optamos por referências externas
e conteúdo local autorizado quando houver justificativa.

## Consequências
Packs legados continuam válidos, porém não recebem cobertura didática v2 automaticamente.
Completude tem gate separado da validade técnica do pack. A análise não faz requisições
de rede e não inventa checagens. Dry run obrigatório em um segundo pack.
