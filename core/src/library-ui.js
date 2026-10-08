import { createLibraryCatalog, externalResourceUrl, resourceAccess } from './library-catalog.js';
import { PixelBadge, PixelButton, PixelIcon, PixelPanel } from './pixel-ui.js';

const labels = { video:'Videoaula', article:'Artigo', book:'Livro', docs:'Documentação', law:'Legislação', course:'Curso', pdf:'PDF', other:'Outro' };
const accessLabels = { free:'Gratuito informado', registration:'Exige cadastro', paid:'Pago', mixed:'Acesso misto', unknown:'Acesso não informado' };
const make = (tag, text, className='') => { const node=document.createElement(tag); if(text!=null)node.textContent=String(text);node.className=className;return node; };
function linkTo(title, url) {
  const safe = externalResourceUrl(url);
  if(!safe)return make('span','Endereço indisponível');
  const link=make('a',title);link.href=safe;link.target='_blank';link.rel='noopener noreferrer';return link;
}
export class LibraryUI {
  constructor({root,pack,onPractice=()=>{},onCards=()=>{},onRetry=null}) {
    this.root=root;this.pack=pack;this.catalog=createLibraryCatalog(pack);this.onPractice=onPractice;this.onCards=onCards;
    this.onRetry=onRetry;
    this.filters={search:'',disciplineId:'',topicId:'',format:'',language:'',access:''};
  }
  render() {
    const {catalog}=this; this.root.replaceChildren();
    const intro=make('p', 'Encontre materiais por conteúdo, com o recorte e a origem de cada referência.', 'library-intro');
    const coverage=catalog.coverage;
    const count=coverage.totals;
    const note=PixelPanel({className:'library-coverage',children:[
      PixelBadge(coverage.isComplete?'Escopo e cobertura revisados':coverage.status==='partial'?'Curadoria parcial':'Curadoria em preparação',coverage.isComplete?'success':'warning'),
      make('p', count ? `${count.coveredUnits} de ${count.units} unidades com cobertura primária integral revisada. ${coverage.legacyResources} referências legadas não contam como cobertura v2.` : 'Este pacote ainda não possui unidades didáticas configuradas.'),
      make('p','Cobertura editorial dos materiais; não representa seu aprendizado ou progresso. Links externos precisam de internet.')
    ]});
    this.root.append(intro,note);
    if(this.pack.libraryError) {
      const message=make('p',this.pack.libraryError), panel=PixelPanel({children:[message]});
      if(this.onRetry) {
        const retry=PixelButton({label:'Tentar carregar novamente',variant:'secondary',onClick:async()=>{
          retry.disabled=true;retry.textContent='Carregando biblioteca…';
          try {
            await this.onRetry();this.catalog=createLibraryCatalog(this.pack);this.render();
            const intro=this.root.querySelector('.library-intro');intro.tabIndex=-1;intro.focus();
          } catch {
            message.textContent='A biblioteca continua indisponível. Confira a conexão e tente novamente.';
            message.setAttribute('role','alert');retry.disabled=false;retry.textContent='Tentar carregar novamente';
          }
        }});panel.append(retry);
      }
      this.root.append(panel);
    }
    const toolbar=make('div',null,'library-filters');
    const addSelect=(key,title,options)=>{const label=make('label',title),select=make('select');select.setAttribute('aria-label',title);
      for(const [value,text] of options)select.add(new Option(text,value,false,this.filters[key]===value));
      select.addEventListener('change',()=>{this.filters[key]=select.value;if(key==='disciplineId')this.filters.topicId='';this.updateTopicOptions();this.updateResults();});
      label.append(select);toolbar.append(label);this[key+'Control']=select;
    };
    const searchLabel=make('label','Buscar material');this.searchControl=make('input');this.searchControl.type='search';this.searchControl.placeholder='Título, conteúdo ou fonte';this.searchControl.value=this.filters.search;
    this.searchControl.addEventListener('input',()=>{this.filters.search=this.searchControl.value;this.updateResults();});searchLabel.append(this.searchControl);toolbar.append(searchLabel);
    addSelect('disciplineId','Matéria',[['','Todas as matérias'],...(this.pack.curriculum?.disciplines??[]).map(d=>[d.id,d.title])]);
    addSelect('topicId','Conteúdo',[['','Todos os conteúdos']]);
    addSelect('format','Formato',[['','Todos os formatos'],...Object.entries(labels)]);
    addSelect('language','Idioma',[['','Todos os idiomas'],...[...new Set(catalog.resources.map(r=>r.language).filter(Boolean))].sort().map(v=>[v,v])]);
    addSelect('access','Acesso',[['','Todos os acessos'],...Object.entries(accessLabels)]);
    this.root.append(toolbar);
    const clear=PixelButton({label:'Limpar filtros',variant:'secondary',onClick:()=>{this.filters={search:'',disciplineId:'',topicId:'',format:'',language:'',access:''};this.searchControl.value='';for(const key of ['disciplineId','format','language','access'])this[key+'Control'].value='';this.updateTopicOptions();this.updateResults();}});
    this.root.append(clear);
    this.unitRoot=make('div',null,'library-units');this.resultStatus=make('p',null,'library-result-status');this.resultStatus.setAttribute('role','status');
    this.results=make('div',null,'library-resources');this.root.append(this.unitRoot,this.resultStatus,this.results);
    this.updateTopicOptions();this.updateResults();
  }
  updateTopicOptions() {
    const control=this.topicIdControl;if(!control)return;control.replaceChildren(new Option('Todos os conteúdos',''));
    for(const topic of this.catalog.topics.filter(t=>!this.filters.disciplineId||t.disciplineId===this.filters.disciplineId))control.add(new Option(topic.displayTitle??topic.title,topic.id));
    control.value=this.filters.topicId;
  }
  showTopic(topicId) {
    const topic=this.catalog.topicById.get(topicId);if(!topic)return;
    this.filters={search:'',disciplineId:topic.disciplineId,topicId,format:'',language:'',access:''};
    this.render();
  }
  updateResults() {
    const resources=this.catalog.filter(this.filters);
    const paths=this.catalog.filterPaths(this.filters);
    this.results.replaceChildren();this.unitRoot.replaceChildren();
    const countLabel=(count,singular,plural)=>`${count} ${count===1?singular:plural}`;
    this.resultStatus.textContent=[countLabel(resources.length,'material','materiais'),countLabel(paths.length,'percurso','percursos')].join(' · ')+'.';
    const topic=this.catalog.topicById.get(this.filters.topicId);
    if(topic) {
      const panel=PixelPanel({className:'library-unit',children:[make('h3',topic.displayTitle??topic.title),make('p',topic.disciplineTitle+' / '+topic.moduleTitle)]});
      if(topic.displayTitle&&topic.displayTitle!==topic.title){const detail=make('details');detail.append(make('summary','Conteúdo completo'),make('p',topic.title));panel.append(detail);}
      const units=this.catalog.units.filter(u=>u.topicId===topic.id);
      for(const unit of units) {
        if(units.length>1||unit.title!==topic.title)panel.append(make('h4',unit.title));
        panel.append(make('p',this.catalog.coverage.scopeReviewed?'Objetivos de aprendizagem':'Objetivos provisórios · revisão do edital pendente'));
        const objectives=make('ul');for(const objective of unit.learningObjectives??[])objectives.append(make('li',objective));panel.append(objectives);
        const prerequisites=(unit.prerequisiteUnitIds??[]).map(id=>this.catalog.unitById.get(id)?.title??id);
        panel.append(make('p',prerequisites.length?'Pré-requisitos: '+prerequisites.join('; '):'Pré-requisitos não informados.'));
        const covered=this.catalog.coverage.units?.find(row=>row.unitId===unit.id)?.covered;
        panel.append(PixelBadge(covered?'Cobertura primária integral revisada':'Lacuna: cobertura primária integral pendente',covered?'success':'warning'));
        const syllabus=unit.syllabusRefs??[];
        for(const ref of syllabus)panel.append(make('p','Referência do edital: '+ref.source+' · '+ref.locator));
      }
      if(!units.length)panel.append(make('p','Decomposição didática ainda não configurada para este conteúdo.'));
      panel.append(PixelButton({label:'Praticar este conteúdo',onClick:()=>this.onPractice(topic.id)}),PixelButton({label:'Revisar flashcards',variant:'secondary',onClick:()=>this.onCards(topic.id)}));
      this.unitRoot.append(panel);
    }
    for(const path of paths)this.results.append(this.studyPathCard(path));
    if(!resources.length&&!paths.length) {this.results.append(PixelPanel({children:[make('h3','Nenhum material neste filtro'),make('p','Ajuste os filtros ou escolha outro conteúdo. A ausência de material é uma lacuna do catálogo, não do seu progresso.')] }));return;}
    for(const resource of resources)this.results.append(this.resourceCard(resource));
  }
  studyPathCard(path) {
    const unit=this.catalog.unitById.get(path.unitId),row=this.catalog.coverage.units?.find(item=>item.unitId===path.unitId);
    const card=PixelPanel({as:'article',className:'library-resource library-study-path'});
    const copy=make('div',null,'library-resource__copy');
    copy.append(PixelBadge(row?.primaryPathIds?.includes(path.id)?'Percurso revisado · objetivos cobertos':'Percurso em revisão',row?.primaryPathIds?.includes(path.id)?'success':'warning'),make('h3',path.title),make('p',unit?.title??'Unidade didática'));
    const objectives=make('ul');for(const objective of unit?.learningObjectives??[])objectives.append(make('li',objective));
    copy.append(make('p','Objetivos cobertos pelo percurso, conforme revisão editorial:'),objectives);
    const steps=make('ol');
    for(const [index,step] of (path.steps??[]).entries()) {
      const resource=this.catalog.resourceById.get(step.resourceId),item=make('li');
      item.append(make('strong',`Etapa ${index+1}: ${resource?.title??step.resourceId}`),make('p',step.locator));
      if(resource?.url)item.append(linkTo('Abrir esta fonte ↗',resource.url));
      steps.append(item);
    }
    copy.append(make('h4','Sequência de estudo'),steps,make('small','As fontes permanecem independentes, podem ter idiomas diferentes e exigem conexão com a internet.'));
    if(path.practice)copy.append(this.practicePanel(path));
    card.append(copy);return card;
  }
  practicePanel(path) {
    const practice=path.practice,panel=PixelPanel({as:'section',className:'library-practice'});
    panel.append(make('h4',practice.title),make('p','Atividade de leitura · sem pontuação ou registro de progresso.'));
    const reading=make('pre',practice.reading,'library-practice__reading');
    panel.append(reading);
    for(const [index,question] of practice.questions.entries()) {
      const fieldset=make('fieldset',null,'library-practice__question'),legend=make('legend',`${index+1}. ${question.stem}`);
      fieldset.append(legend);
      const name=`practice-${path.id}-${question.id}`;
      for(const [optionIndex,option] of question.options.entries()) {
        const label=make('label',null,'library-practice__option'),input=make('input');
        input.type='radio';input.name=name;input.value=String(optionIndex);
        label.append(input,document.createTextNode(option));fieldset.append(label);
      }
      const feedback=make('p','', 'library-practice__feedback');feedback.setAttribute('role','status');feedback.setAttribute('aria-live','polite');
      const check=PixelButton({label:'Conferir resposta',variant:'secondary',onClick:()=>{
        const selected=fieldset.querySelector('input:checked');
        if(!selected) { feedback.textContent='Escolha uma alternativa antes de conferir.';return; }
        const correct=Number(selected.value)===question.correctOptionIndex;
        feedback.textContent=`${correct?'Resposta correta.':'Releia o trecho e compare as condições.'} ${question.explanation}`;
      }});
      check.type='button';fieldset.append(check,feedback);
      panel.append(fieldset);
    }
    return panel;
  }
  resourceCard(resource) {
    const v2=resource.libraryVersion===2, status=resource.verification?.result;
    const card=PixelPanel({as:'article',className:'library-resource'});
    const cover=make('div',null,'library-resource__cover');cover.setAttribute('aria-hidden','true');cover.append(PixelIcon(resource.type==='video'?'practice':'book'),make('span',({docs:'Docs',law:'Lei',video:'Vídeo'}[resource.type]??labels[resource.type]??resource.type)));
    const copy=make('div',null,'library-resource__copy'),title=make('h3',resource.title);
    copy.append(PixelBadge(accessLabels[resourceAccess(resource)]),title,
      make('p',(labels[resource.type]??resource.type)+' · '+(resource.language??'Idioma não informado')+(resource.estimatedMinutes?' · estimativa '+resource.estimatedMinutes+' min':'')));
    const mapping=(resource.coverage??[]).filter(row=>!this.filters.topicId||this.catalog.unitById.get(row.unitId)?.topicId===this.filters.topicId);
    if(v2)for(const row of mapping)copy.append(make('p',({primary:'Principal',reference:'Referência',video:'Vídeo',complementary:'Complementar'}[row.role]??row.role)+' · '+row.locator+' · '+(row.extent==='full'?'Recorte declarado integral':'Recorte parcial')));
    else copy.append(make('p','Referência existente · curadoria didática v2 pendente. O link não demonstra cobertura integral.'));
    copy.append(make('p','Fonte: '+(resource.provenance?.title??resource.provider??'Não informada')));
    const metadata=make('details',null,'library-resource__metadata');metadata.append(make('summary','Origem, licença e verificação'));
    if(resource.provenance?.locator)metadata.append(make('p','Localização: '+resource.provenance.locator));
    const review=resource.editorialReview;
    metadata.append(make('p',v2?'Revisão editorial: '+({approved:'aprovada',pending:'pendente',rejected:'rejeitada'}[review?.status]??'não informada'):'Revisão editorial: não realizada no contrato v2.'));
    const checked=resource.verification?.checkedAt??resource.verifiedAt;
    metadata.append(make('p',(v2?'Disponibilidade: '+({reachable:'acessível na última checagem',blocked:'acesso bloqueado na checagem',broken:'link indisponível',unknown:'não confirmada'}[status]??'não confirmada'):'Disponibilidade: verificação legada')+(checked?' · '+checked:' · sem data')));
    metadata.append(make('p','Licença de reprodução: '+(resource.rights?.license??'não informada')+'. Abertura por link externo.'));
    if(resource.access?.notes)metadata.append(make('p',resource.access.notes));
    if(resource.authors?.length)metadata.append(make('p','Autoria: '+resource.authors.join(', ')));
    if(resource.provenance?.url&&resource.provenance.url!==resource.url)metadata.append(linkTo('Consultar proveniência ↗',resource.provenance.url));
    copy.append(metadata);
    if(resource.status==='broken'||resource.status==='archived'||status==='broken')copy.append(PixelBadge('Indisponível neste catálogo','warning'));
    else {const link=linkTo('Abrir fonte externa ↗',resource.url);link.className='pixel-button library-resource__link';copy.append(link);}
    copy.append(make('small','Conteúdo externo · exige internet.'));
    const details=make('details',null,'library-resource__topics');details.append(make('summary','Conteúdos associados'));
    const list=make('ul');for(const id of resource.topicIds??[])list.append(make('li',this.catalog.topicById.get(id)?.title??id));details.append(list);copy.append(details);
    card.append(cover,copy);return card;
  }
}
