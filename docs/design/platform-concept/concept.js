const screens = [...document.querySelectorAll('.screen')];
const navigation = [...document.querySelectorAll('nav button')];
function showScreen(id, moveFocus = true) {
 const screen = document.getElementById(id);
 if (!screens.includes(screen)) return;
 screens.forEach(item => item.hidden = item !== screen);
 navigation.forEach(button => {
  if (button.dataset.screen === id) button.setAttribute('aria-current','page');
  else button.removeAttribute('aria-current');
 });
 document.body.dataset.screen = id;
 history.replaceState(null,'','#'+id);
 if (moveFocus) { document.querySelector('#content').focus(); window.scrollTo(0,0); }
}
navigation.forEach(button => button.addEventListener('click',()=>showScreen(button.dataset.screen)));
document.querySelectorAll('[data-go]').forEach(button => button.addEventListener('click',()=>showScreen(button.dataset.go)));
document.querySelector('.brand').addEventListener('click',event=>{event.preventDefault();showScreen('today');});
document.querySelector('#biome').addEventListener('change',event=>document.body.dataset.biome=event.target.value);
const focus=document.querySelector('#focus');
focus.addEventListener('click',()=>{const active=focus.getAttribute('aria-pressed')!=='true';focus.setAttribute('aria-pressed',String(active));document.body.dataset.focus=String(active);});
const search=document.querySelector('#search'), format=document.querySelector('#format');
function filter(){
 let count=0;
 document.querySelectorAll('.resource').forEach(card=>{const include=(format.value==='all'||format.value===card.dataset.kind)&&card.textContent.toLocaleLowerCase('pt-BR').includes(search.value.toLocaleLowerCase('pt-BR'));card.hidden=!include;if(include)count++;});
 document.querySelector('#no-results').hidden=count>0;
}
search.addEventListener('input',filter); format.addEventListener('change',filter);
document.querySelectorAll('.sample-read').forEach(button=>button.addEventListener('click',()=>{const reader=document.querySelector('#sample-reader');reader.hidden=false;reader.focus();reader.scrollIntoView({block:'nearest'});}));
let chosen=null,committed=false;
const answers=[...document.querySelectorAll('[data-answer]')],confirm=document.querySelector('#confirm');
answers.forEach(button=>button.addEventListener('click',()=>{if(committed)return;chosen=button.dataset.answer;answers.forEach(answer=>answer.setAttribute('aria-pressed',String(answer===button)));confirm.disabled=false;}));
confirm.addEventListener('click',()=>{
 if(!chosen||committed)return;committed=true;confirm.disabled=true;confirm.textContent='Resposta registrada no exemplo';
 answers.forEach(button=>{button.disabled=true;if(button.dataset.answer==='a')button.classList.add('correct');else if(button.dataset.answer===chosen)button.classList.add('incorrect');});
 const feedback=document.querySelector('#feedback');feedback.hidden=false;
 const title=document.createElement('strong');title.textContent=chosen==='a'?'Correto no exemplo.':'Resposta incorreta no exemplo.';
 const explanation=document.createElement('p');explanation.textContent='Alternativa A. Um contrato documenta as operações e os formatos esperados. Esta demonstração não cria score, XP ou histórico no StudyOS.';
 feedback.replaceChildren(title,explanation);
});
showScreen(location.hash.slice(1)||'today',false);
