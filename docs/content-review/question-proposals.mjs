import { readFile, writeFile } from 'node:fs/promises';
try { await readFile(new URL('FACTUAL_REVIEW.json',import.meta.url)); throw new Error('Proposta assinada: crie uma nova versão para nova curadoria.'); }
catch (e) { if (e.code !== 'ENOENT') throw e; }
const questions = JSON.parse(await readFile(new URL('../../exam-packs/tce-go-ti-2026/questions.json', import.meta.url))).slice(0, 10);
const sources = [
 ['Microsoft — Event-driven architecture', 'https://learn.microsoft.com/en-us/azure/architecture/guide/architecture-styles/event-driven', 'Architecture; Benefits; Event schema evolution'],
 ['PostgreSQL 18 — Transactions', 'https://www.postgresql.org/docs/18/tutorial-transactions.html', '§3.4, permanently recorded; COMMIT'],
 ['AWS — Shared Responsibility Model', 'https://aws.amazon.com/compliance/shared-responsibility-model/', 'Customer responsibility; Applying the model in practice'],
 ['LGPD', 'https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm', 'Art.6º III, necessidade; dispositivo vigente no corte 25/08/2026'],
 ['NIST — Integrity', 'https://csrc.nist.gov/glossary/term/integrity', 'Data integrity, definição vinculada a NIST SP 800-152'],
 ['GitHub — Understanding GitHub Actions', 'https://docs.github.com/en/actions/get-started/understand-github-actions', 'Overview; Jobs'],
 ['Anthropic — Building effective agents', 'https://www.anthropic.com/engineering/building-effective-agents', 'Workflow: Evaluator-optimizer; Agents'],
 ['RFC 1034', 'https://www.rfc-editor.org/rfc/rfc1034.html#section-2.4', '§2.4 Elements of the DNS'],
 ['RFC 6749', 'https://www.rfc-editor.org/rfc/rfc6749.html#section-1.1', '§1.1 Roles; §1.2 Protocol Flow'],
 ['Coverage.py 7.10.7 — Branch coverage', 'https://coverage.readthedocs.io/en/7.10.7/branch.html', 'How to measure branch coverage; How it works']
];
const explanations = [
 ['Conhecer a implementação interna do consumidor não é requisito.', 'O contrato de eventos permite publicação e reação sem conhecer a implementação interna; o esquema ainda cria dependência.', 'Consumidores não precisam compartilhar uma transação local.', 'Eventos não exigem comunicação exclusivamente síncrona.', 'Processar um evento não exige modificar o produtor.'],
 ['Atomicidade é tudo-ou-nada.', 'Consistência trata a preservação das restrições.', 'Isolamento trata a interação entre transações concorrentes.', 'Durabilidade preserva alterações após confirmação; depende de configuração de persistência adequada.', 'Idempotência é obter o mesmo efeito ao repetir uma operação.'],
 ['Número de usuários não define a divisão de controles.', 'O serviço e o modelo documentado indicam a divisão; uso, configuração e obrigações legais também devem ser considerados.', 'Idioma não define responsabilidades de segurança.', 'A quantidade de regiões, isoladamente, não define os controles.', 'O sistema do computador local não basta para determinar a divisão.'],
 ['Minimização é prática coerente com a necessidade: limitar dados ao pertinente, proporcional e não excessivo para a finalidade; não é base legal autônoma.', 'Replicar dados sem restrição amplia cópias, sem limitar a coleta ao necessário.', 'Desnormalização reorganiza estruturas de banco, sem determinar quais dados pessoais são necessários.', 'Port scanning identifica portas de rede; não limita dados pessoais coletados.', 'Balanceamento distribui carga entre servidores; não limita a coleta de dados pessoais.'],
 ['Disponibilidade trata acesso oportuno.', 'Integridade protege contra modificação não autorizada; não significa garantia absoluta de um mecanismo.', 'Elasticidade trata adaptação de capacidade.', 'Observabilidade usa sinais para compreender o estado do sistema.', 'Portabilidade trata transferência entre ambientes.'],
 ['Evitar testes automáticos contraria a verificação automatizada.', 'Build e testes automatizados fornecem feedback; os gatilhos e verificações são configuráveis.', 'Eliminar controle de versão prejudica rastreabilidade.', 'Excluir revisão não é exigência de integração contínua.', 'Limitar-se a tarefas manuais não fornece a automação do pipeline.'],
 ['Comparar evidências aos critérios e iterar corresponde ao padrão avaliador/otimizador; autoavaliação não garante correção factual.', 'Excluir contexto não avalia critérios de aceite.', 'Desativar memória não é verificação do resultado.', 'Remover o contrato elimina critérios, em vez de verificá-los.', 'Duplicar um prompt não demonstra atendimento aos critérios.'],
 ['DNS consulta registros associados a nomes, incluindo registros de endereços.', 'SMTP transfere correio eletrônico.', 'FTP transfere arquivos.', 'SSH fornece comunicação e acesso remoto seguros.', 'DHCP fornece configuração de rede e pode informar servidor DNS, mas não realiza a resolução de nomes.'],
 ['Autorização aplica a política para decidir recursos e operações permitidos ao sujeito ou cliente no contexto; pode haver acesso público conforme a política.', 'Latência não é uma permissão de acesso.', 'A linguagem do cliente não define a política de autorização.', 'Capacidade de disco não é permissão de acesso.', 'A aparência da interface não define a política de autorização.'],
 ['A métrica relaciona linhas ou decisões exercitadas ao universo escolhido; 100% de linhas não garante todas as decisões, bons asserts ou ausência de bugs.', 'Usuários e orçamento não medem cobertura de código.', 'Incidentes e memória não medem código exercitado.', 'Branches de execução são relevantes, mas salário não compõe a métrica.', 'APIs e prazo do concurso não medem código exercitado.']
];
questions[2].stem = 'Na análise técnica da responsabilidade compartilhada, qual informação é essencial para identificar a divisão de controles entre provedor e cliente?';
questions[2].options[1].text = 'O serviço utilizado, seu modelo e a divisão de responsabilidades documentada pelo provedor, observadas as obrigações aplicáveis.';
questions[6].stem = 'Em um fluxo agentivo com critérios de aceite explícitos, qual atividade avalia o resultado usando evidências antes de concluir a tarefa?';
questions[6].options[0].text = 'Verificar o resultado em relação aos critérios e, se necessário, corrigir e repetir a avaliação.';
questions[9].stem = 'Uma métrica de cobertura de código representa, de forma mais direta, qual relação?';
const now = new Date().toISOString();
for (const [i, q] of questions.entries()) {
 q.supersedes = q.id; q.id += '-r2'; q.contentVersion = 2;
 delete q.board; delete q.year;
 q.fingerprint += '-r2'; q.status = 'draft'; q.reviewStatus = 'pending_review'; q.validAsOf = now.slice(0,10);
 q.provenance = { status: 'derived', source: sources[i][0], url: sources[i][1], locator: sources[i][2], license: 'Formulação original StudyOS; consulta por link, sem reprodução de questão de banca.' };
 q.sourceRefs = [{ title: sources[i][0], url: sources[i][1], locator: sources[i][2], checkedAt: now }];
 q.explanationByOption = Object.fromEntries(q.options.map((o,j) => [o.id, explanations[i][j]]));
 q.explanation = q.explanationByOption[q.correctOptionId];
 q.editorialReview = {status:'pending', reviewer:null, reviewedAt:null, evidence:''};
}
questions[8].sourceRefs.push({title:'OWASP Authorization Cheat Sheet',url:'https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html',locator:'Introduction, distinção autenticação/autorização e acesso público de usuário não autenticado',checkedAt:now});
await writeFile(new URL('QUESTIONS_DRAFT.json', import.meta.url), JSON.stringify(questions,null,2)+'\n');
