
let stats = JSON.parse(localStorage.getItem("psiStatsV2")||'{"answered":0,"hits":0,"miss":0,"done":{}}');
const LETTERS = ["A","B","C","D","E"];

function showTab(id){
 document.querySelectorAll('.tabPage').forEach(t=>t.classList.add('hidden'));
 document.getElementById(id).classList.remove('hidden');
 document.querySelectorAll('.tabs button').forEach(b=>b.classList.toggle('active', b.dataset.tab===id));
 if(id==='questoes') renderQuestions();
 window.scrollTo({top:0,behavior:'smooth'});
}
function toggleDark(){
 document.body.classList.toggle('dark');
 localStorage.setItem('dark', document.body.classList.contains('dark')?'1':'0');
}
if(localStorage.getItem('dark')==='1') document.body.classList.add('dark');

function setupFilters(){
 const subj=[...new Set(DATA.questions.map(q=>q.assunto))].sort();
 const types=[...new Set(DATA.questions.map(q=>q.tipo))].sort();
 const sf=document.getElementById('subjectFilter'), tf=document.getElementById('typeFilter');
 if(!sf || sf.dataset.ready) return;
 subj.forEach(s=>sf.innerHTML+=`<option value="${s}">${s}</option>`);
 types.forEach(t=>tf.innerHTML+=`<option value="${t}">${t}</option>`);
 sf.dataset.ready="1";
}
function updateStats(){
 const answered=document.getElementById('answered');
 if(!answered) return;
 document.getElementById('answered').textContent=stats.answered;
 document.getElementById('hits').textContent=stats.hits;
 document.getElementById('miss').textContent=stats.miss;
 document.getElementById('percent').textContent=stats.answered?Math.round(stats.hits/stats.answered*100)+'%':'0%';
 localStorage.setItem("psiStatsV2",JSON.stringify(stats));
}
function resetStats(){
 stats={answered:0,hits:0,miss:0,done:{}};
 updateStats();
 renderQuestions();
}
function renderQuestions(){
 setupFilters();
 const sf=document.getElementById('subjectFilter')?.value||'';
 const tf=document.getElementById('typeFilter')?.value||'';
 const search=(document.getElementById('searchBox')?.value||'').toLowerCase();
 const box=document.getElementById('questionsList');
 if(!box)return;
 let qs=DATA.questions.filter(q=>(!sf||q.assunto===sf)&&(!tf||q.tipo===tf)&&(!search||(q.q+q.assunto+q.comm).toLowerCase().includes(search)));
 box.innerHTML=qs.map(q=>{
   const isDisc = !q.alts || q.alts.length===0;
   const answerLabel = isDisc ? "Resposta esperada" : `Gabarito: ${LETTERS[q.correctIndex]}`;
   return `
   <div class="qCard" id="q${q.id}">
     <div class="meta"><span>${q.assunto}</span><span>${q.tipo}</span><span>${q.dificuldade}</span><span>${q.temp}</span></div>
     <h3>Questão ${q.id}</h3>
     <p>${q.q}</p>
     ${isDisc ? `<textarea class="discursive" placeholder="Escreva sua resposta aqui..."></textarea><br><button onclick="markDiscursive(${q.id}, true)">Marcar como acertei</button><button onclick="markDiscursive(${q.id}, false)">Marcar como errei</button>` :
     `<div>${q.alts.map((a,i)=>`<label class="alt"><input type="radio" name="q${q.id}" value="${i}" onchange="answer(${q.id}, ${i})"> <b>${LETTERS[i]})</b> ${a}</label>`).join('')}</div>`}
     <button onclick="toggleAnswer(${q.id})">Mostrar/ocultar resposta</button>
     <div class="answer" id="a${q.id}"><b>${answerLabel}</b>${isDisc ? "" : " — " + q.alts[q.correctIndex]}<br><b>Comentário:</b> ${q.comm}</div>
   </div>`}).join('') || '<p>Nenhuma questão encontrada.</p>';
 updateStats();
}
function answer(id, idx){
 const q=DATA.questions.find(x=>x.id===id);
 if(!q || stats.done[id]) return;
 stats.done[id]=true; stats.answered++;
 const card=document.getElementById('q'+id);
 card.querySelectorAll('.alt').forEach((l,i)=>{
   if(i===q.correctIndex) l.classList.add('correct');
   if(i===idx && idx!==q.correctIndex) l.classList.add('wrong');
 });
 if(idx===q.correctIndex) stats.hits++; else stats.miss++;
 document.getElementById('a'+id).style.display='block';
 updateStats();
}
function markDiscursive(id, ok){
 if(stats.done[id]) return;
 stats.done[id]=true; stats.answered++;
 if(ok) stats.hits++; else stats.miss++;
 document.getElementById('a'+id).style.display='block';
 updateStats();
}
function toggleAnswer(id){
 const el=document.getElementById('a'+id);
 el.style.display=el.style.display==='block'?'none':'block';
}
function makePlan(){
 const hours=parseFloat(document.getElementById('hoursDay').value||2);
 const topics=["Borderline e antissocial","Depressão e critérios diagnósticos","Bipolaridade e virada maníaca","Suicídio e ferimentos autoinfligidos","Emergência/agitação/violência","Delirium e diagnóstico diferencial","Abstinência alcoólica e substâncias","ISRS/ADT/IMAO","Lítio, valproato e carbamazepina","Antipsicóticos e clozapina","Simulado com provas antigas","Revisão final por erros"];
 let html='<table><tr><th>Dia</th><th>Subtópico</th><th>Carga</th><th>Atividade</th><th>Revisão</th></tr>';
 topics.forEach((t,i)=>{html+=`<tr><td>D${i+1}</td><td>${t}</td><td>${hours}h</td><td>${i%3===0?'Teoria + tabela':i%3===1?'Questões + correção':'Revisão ativa + simulado'}</td><td>D+1, D+3, D+7, D+15</td></tr>`});
 html+='</table>';
 document.getElementById('planOut').innerHTML=html;
}
document.addEventListener('DOMContentLoaded',()=>{setupFilters();renderQuestions();updateStats();});
