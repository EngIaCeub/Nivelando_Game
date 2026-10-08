import { readFile, writeFile } from 'node:fs/promises';
try { await readFile(new URL('FACTUAL_REVIEW.json',import.meta.url)); throw new Error('Proposta assinada: crie uma nova versão para nova curadoria.'); }
catch (e) { if (e.code !== 'ENOENT') throw e; }
const file=new URL('CURATION_DRAFT.json',import.meta.url), draft=JSON.parse(await readFile(file,'utf8'));
const source=id=>draft.sources.find(s=>s.id===id), card=id=>draft.cards.find(c=>c.id.endsWith(id));
source('curated-lgpd-principles').locator='Arts.5 I/III/V, 6 III e 12; recorte legal, corte do edital 25/08/2026';
source('curated-openapi-311').locator='Introduction; §4.8 Schema, especialmente §4.8.24 Schema Object';
source('curated-pg-foreign-keys').locator='Tutorial §3.3 Foreign Keys; complemento §5.5.5 Foreign Keys para NULL';
source('curated-pg-indexes').url='https://www.postgresql.org/docs/18/indexes-intro.html';
source('curated-pg-indexes').locator='§11.1 Introduction, busca e custo de atualização/manutenção';
source('curated-pg-indexes').evidence='Leitura da introdução e §11.1: benefício de busca e custo de manutenção. Apenas recorte introdutório; tipos detalhados não foram revisados.';
card('bd-sql-indice').back='Não. Índices podem acelerar buscas, mas acrescentam trabalho de manutenção nas atualizações. A escolha depende das consultas e da carga de escrita.';
card('bd-sql-indice').explanation=card('bd-sql-indice').back;
card('jwt-exp').back='exp indica o instante a partir do qual o JWT não deve ser aceito (naquele instante ou depois). A implementação pode admitir pequena tolerância para diferença de relógios.';
const federal=card('controle-federal'); federal.back='O Congresso Nacional exerce o controle externo com auxílio do Tribunal de Contas da União, conforme o art.71 da Constituição.';
card('jwt-exp').explanation=card('jwt-exp').back; federal.explanation=federal.back;
for(const c of draft.cards) {
 const s=source(c.provenance.source); c.provenance.url=s.url; c.provenance.locator=s.locator;
 for(const ref of c.sourceRefs) {ref.url=s.url;ref.locator=s.locator;}
 if(c.id.endsWith('chave-estrangeira')) c.sourceRefs=[c.sourceRefs[0],{sourceId:s.id,url:'https://www.postgresql.org/docs/18/ddl-constraints.html#DDL-CONSTRAINTS-FK',locator:'§5.5.5 Foreign Keys, valores NULL',checkedAt:s.checkedAt}];
}
await writeFile(file,JSON.stringify(draft,null,2)+'\n');
