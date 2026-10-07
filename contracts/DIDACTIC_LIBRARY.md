# Contrato — Biblioteca didática

## Fronteira e artefatos
A biblioteca pertence ao Exam Pack. Core interpreta dados genéricos; nomes de matérias,
fontes, recortes normativos e recomendações ficam em exam-packs/<exam-id>/.
resources.json continua sendo o catálogo consumido pelo app. library.json declara
unidades didáticas, política de acesso e revisão de escopo. library-candidates.json
contém candidatos e rejeições; não é payload de estudo nem deve ser incluído no build.
Relatórios são derivados, nunca fonte de verdade. Não alterar IDs de tópicos para
refinar conteúdo: cada unidade tem id estável e topicId de um tópico existente.
canonicalConceptIds continuam permitindo reutilização entre concursos.

## Recurso didático v2
libraryVersion:2 ativa o contrato ampliado em resource.schema.json. Registros legados
continuam válidos, mas não contam como cobertura didática revisada. Antes de promover
um recurso, verificar identidade/autoria, conteúdo relevante e acesso; registrar:
- provider, authors, language, difficulty, estimatedMinutes (null se desconhecido);
- provenance com fonte, título, URL, retrievedAt e localização;
- access: free/registration/paid/mixed, requiresRegistration e notes;
- rights: license, evidenceUrl, delivery:link nesta versão;
- verification: reachable/blocked/broken/unknown, checkedAt, finalUrl e método;
- editorialReview: pending/approved/rejected, reviewer, reviewedAt e evidence;
- coverage: unitId, role primary/reference/video/complementary, extent full/partial
  e locator (capítulo/páginas, seção ou aula/timecode).
Acesso gratuito não demonstra licença de reprodução. Licença desconhecida admite
delivery:link. B1 suporta apenas referências externas com URL HTTP(S).
Embed/bundle fica reservado a B5: exige extensão do schema, caminho relativo,
integridade/checagem local e registro editorial de autorização específica para a
operação. Até essa implementação, schema e auditor rejeitam embed/bundle.
Não copiar nem servir apostilas, livros, vídeos ou questões protegidos sem autorização.
Verificação HTTP comprova disponibilidade, não qualidade nem cobertura.
Não marcar approved com base apenas em título, snippet de busca ou resposta HTTP.

## Cobertura
library.scopeReview registra auditoria do edital e decomposição das unidades.
Cada unidade registra syllabusRefs, objetivos de aprendizagem e prerequisitos.
Sem revisão do escopo, o relatório é um diagnóstico provisório.
Uma unidade é coberta quando possui pelo menos um recurso primary/full:
ativo, aprovado editorialmente, acessível na verificação recente e gratuito
(access.mode:free ou registration quando a política permitir cadastro).
A versão atual exige freePrimaryRequired:true; material pago é complementar.
Material complementar, portal da banca e edital não substituem explicação didática.
Vídeo e texto são formatos alternativos; não exigir vídeo para assuntos sem boa aula.
Recursos parciais devem indicar exatamente o recorte e deixam a lacuna explícita.
Um recurso genérico não cobre todos os conteúdos só por apontar para vários topicIds.
Conteúdo normativo deve indicar versão/data de corte e a fonte oficial correspondente.

## Completa, parcial e pendências
Status planned/partial permite liberar conteúdo útil com lacunas visíveis.
Status complete exige escopo revisado, referências válidas, unidades para todos os
tópicos, cobertura primária gratuita atual de todas as unidades e QA independente.
library-audit verifica as condições mensuráveis; aprovação editorial e aderência ao
edital exigem leitura real com evidência. A saída do script não substitui esse parecer.
A cobertura da biblioteca mede oferta de materiais; não é mastery, cobertura estudada
ou percentual de aprovação do estudante. Abrir um link não concede XP ou conclusão.

## Offline, progresso e publicação
Catálogo e metadados podem funcionar offline; links externos indicam necessidade de
internet. Só incluir conteúdo local autorizado, com caminho relativo e licença.
Entrega runtime posterior deve preservar IndexedDB/export/import/score e tratar
leitura concluída como declaração do estudante, sem inferir aprendizado pelo clique.
Recurso removido mantém ID e status archived/broken para preservar referências.
Atualizar metadados não pode redefinir progresso histórico.

## Manutenção
Rever links e adequação conforme reviewIntervalDays; vencimento não muda o histórico.
403/captcha/login/timeout gera pendência, não certificado de link quebrado.
Registrar mudanças de edição, normas, acesso e URL; substituir com rastreabilidade.
Checagem é operação de curadoria explícita, sem agendamento ou compra implícitos.
