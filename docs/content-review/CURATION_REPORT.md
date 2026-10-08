# Revisão factual e curadoria — TCE-GO TI

Data: 2026-10-07. Integração local; publicação deste lote pendente.

## Resultado

| Coleção | Antes | Seleção nova | Decisão |
| --- | ---: | ---: | --- |
| Questões | 289 | 10 | 279 templates rejeitados; dez questões substantivas corrigidas com IDs r2 |
| Flashcards | 102 | 64 | Retiradas instruções genéricas; perguntas/respostas atômicas com fontes |
| Recursos | 20 legados | 34 v2 | Recortes didáticos externos com revisão, acesso e direitos distintos |
| Pools de treino | 16 | 1 | Dez questões originais; simulado completo indisponível |

As questões são originais StudyOS. Contexto do edital FCC não demonstra procedência
de uma prova da banca. Nenhum banco comercial ou texto integral protegido foi copiado.

## Evidências editoriais

- `QUESTIONS_INDEPENDENT_REVIEW.md`: leitura integral das 289 questões, rejeição por
  ID e revisão dos dez r2 e 64 cartões; agente factual independente.
- `FACTUAL_REVIEW.json`: IDs aprovados, evidências por item e SHA-256 dos drafts.
- `LIBRARY_INDEPENDENT_REVIEW.md`: revisão dos 20 recursos, dos 34 novos recortes e
  matriz dos 45 tópicos contra Anexo II pp.19–22; agente de biblioteca independente.
- `SOURCES_REVIEW.json`: 34 IDs aprovados, hash e restrições de recorte/direitos.
- `LEGACY_REVIEW.json`: decisão por ID dos 289 itens, 102 cartões e 20 recursos.
- `CONTENT_AUDIT.json`: zero alertas TCE-GO ativo; heurística não aprova conteúdo.
- `LIBRARY_AUDIT.json`: 34 recursos elegíveis, zero erros; biblioteca partial,
  zero unidades integralmente cobertas e scopeReview pending.

Integração confronta os hashes antes de promover. Scripts de geração não podem
reescrever uma proposta com parecer assinado; nova curadoria exige nova versão.

## Limites e fila de complemento

12 tópicos estão sem item ativo; 35 sem questões, 14 sem materiais e 14 sem cartões.
O relatório `CURATION_RESULT.json` lista lacunas por tópico. Fontes parciais ensinam
recortes úteis, mas não completam unidades amplas. Refinar unidades/objetivos mantendo
topicIds e obter novo parecer de escopo antes de qualquer claim complete.

Prioridades: legislação estadual/institucional e PDTI; edições específicas dos
frameworks de governança; português e lógica com exercícios; SO/redes, bases e IA
nos subitens faltantes; interpretação técnica de inglês; ampliar questões por
objetivo antes de compor simulado na distribuição oficial. Vídeos permanecem sem
aprovação: localizar aula acessível, assistir ao recorte e registrar timecodes.

Legislação foi conferida somente nos dispositivos citados, considerando o corte de
25/08/2026 reportado pela notícia oficial do TCE-GO. O diário integral, jurisprudência
e normas estaduais não foram auditados neste lote. RAG é referência restrita ao
resumo; versões móveis de documentação requerem rechecagem periódica. Entrega link;
license unknown não concede reprodução. A compilação FUNAG credita Cunha/Cintra.

## Continuidade do aluno

Arquivo `exam-packs/tce-go-ti-2026/content-history.json` preserva objetos antigos.
Histórico resolve sessões existentes; banco ativo seleciona atividades novas. Mudança
de texto cria novo ID, relacionando supersedes. Score/primeiras tentativas não foram
recalculados. Agendas antigas com IDs retirados pedem replanejamento explícito;
sessão já iniciada continua resolvendo o texto histórico. Tópicos vazios são informados.

## Validação executada

- 43 testes direcionados passaram, incluindo schema/factory do pack, contagens
  reais, separação ativo/histórico, retomada, score imutável e backup round-trip.
- Schemas/factory dos três packs passaram. TJTO não recebeu revisão factual.
- Empacotamento temporário verificou histórico e bancos no cache, exclusão de
  candidatos e ausência dos drafts editoriais no payload.
- Scanner de segredos e git diff-check passaram.
- QA independente da integração aceito após conferir autoria FUNAG, URLs finais das
  RFCs e rótulos de cobertura integral. Foram confrontados 34 recursos/42 associações
  parciais, 45 unidades e histórico idêntico aos objetos anteriores; hashes dos
  artefatos finais registrados no apêndice do parecer da biblioteca.

Não equivale a teste offline ou inspeção visual real em navegador, nem a validação
de auth/sync em Supabase. Nenhum commit, push ou deploy foi feito neste lote.
