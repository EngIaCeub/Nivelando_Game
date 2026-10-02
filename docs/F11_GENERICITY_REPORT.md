# F11 — Relatório de genericidade da Factory

## Conclusão

F11 aprovado. O segundo edital foi carregado simultaneamente ao TCE-GO usando os mesmos módulos do Core, sem alteração em `core/`, sem ADR estrutural e sem contratos novos.

## Segundo edital

- Edital nº 01/2022 do Tribunal de Justiça do Estado do Tocantins, retificado em 21/11/2022.
- Cargo: Técnico Judiciário — Apoio Judiciário e Administrativo.
- Banca: Fundação Getulio Vargas (FGV).
- Fonte primária: `exam-packs/tjto-tecnico-administrativo-2022/edital-01-2022-retificado.pdf`.
- Concurso encerrado; o pack é um artefato de validação arquitetural.
- Fatos críticos têm classificação e source-map: 50 vagas + cadastro de reserva, ensino médio ou curso técnico equivalente, remuneração total de R$ 7.312,99, 80 questões, redação de 15–20 linhas, mínimos de 30 específicas, 40 totais e 15/30 na redação.

## Diferenças estruturais

| Dimensão | TCE-GO TI 2026 | TJTO Apoio 2022 |
|---|---:|---:|
| Banca | FCC | FGV |
| Disciplinas | 14 | 5 |
| Tópicos | 45 | 13 |
| Questões de teste | 10 | 3 |
| Objetiva | 70, gerais/específicos, pesos 1/2 | 80, distribuição 10/5/65 |
| Discursiva | estudo de caso | redação dissertativo-argumentativa |
| Cargo | Técnico de Controle Externo — TI | Técnico Judiciário — apoio |
| Data | 2027-01-17 | 2022-06-26 |

O TJTO exercita Direito, Administração e redação; o TCE-GO exercita TI, dados, nuvem, IA, segurança e governança de tecnologia. Também foram exercitados pesos ausentes e prova encerrada.

## CanonicalConceptIds e overlap

- TCE-GO: 82 conceitos; TJTO: 20; união: 97.
- Compartilhados: `language.reading.comprehension`, `language.portuguese.morphosyntax`, `language.portuguese.syntax`, `language.portuguese.writing` e `public-law.public-service`.
- Compartilhados: 5; overlap Jaccard: 5/97 = 5,15%; reaproveitamento potencial no TJTO: 5/20 = 25%.
- Exclusivos do TCE-GO: banco de dados/SQL, IA, DevOps, redes, nuvem, segurança, governança de TI, analytics e engenharia de software.
- Exclusivos do TJTO: Administração/PDCA/materiais, Poder Judiciário, Direito Civil, Processo Civil, Direito Penal, Processo Penal e `writing.argumentative`.
- A equivalência `Banco de Dados > SQL` / `Banco de Dados > Linguagem SQL` foi testada com `database.sql`. O TJTO Apoio não possui SQL no edital; portanto o alias não foi inventado no pack.

## Isolamento e testes adversariais

Foram validados dois packs simultâneos com progresso, export/import, reload simulado, score, primeira tentativa, XP/eventos, planos, analytics, recursos, questões e troca de pack separados por `examId`. Também foram testados currículo sem disciplina, tópicos em quantidades diferentes, disciplina sem peso, datas diferentes, recurso não verificado, fingerprint duplicado e conceitos compartilhados/exclusivos.

## Acceptance

- Suíte completa: 32 testes, 32 aprovados, 0 falhas.
- Core: 11 testes; TCE-GO/F9: acceptance e testes do pack; F10: 6 testes; F11: 7 testes.
- `SECOND_EXAM_DRY_RUN`: aprovado.
- `NEW_EXAM_ACCEPTANCE`: aprovado.
- Schema/contrato, provenance, IDs, import/export e leakage: aprovados.
- Standalone do TCE-GO, standalone TJTO e hub com os dois packs: gerados e verificados.

## Arquivos, Core e limitações

Criados: `exam-packs/tjto-tecnico-administrativo-2022/` com manifest, facts, source-map, curriculum, resources, questions, study-plan, README, PDF oficial e testes; `sites/tjto-tecnico-administrativo-2022/` com site e dist; `sites/hub/dist/` com catálogo; este relatório.

Alterações no Core: zero. ADRs abertos: nenhum. Limitações: pack mínimo de validação, não uma release imediata; SQL não pertence ao cargo escolhido; builds foram verificados localmente, não publicados externamente. Nenhum gate posterior foi iniciado.
