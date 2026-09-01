
let pool=[], line=[], current=null, score=0, round=1, maxRound=10, locked=false;
const $=id=>document.getElementById(id);
function shuffle(a){return [...a].sort(()=>Math.random()-.5)}
function startGame(n){
 maxRound=n; pool=shuffle(window.ANIME_DATA); line=[pool.pop(),pool.pop(),pool.pop()].sort((a,b)=>a.date.localeCompare(b.date));
 $('start').classList.add('hidden');$('game').classList.remove('hidden');$('maxRound').textContent=n; nextQuestion();
}
function nextQuestion(){
 if(round>maxRound || !pool.length){finish();return}
 locked=false; current=pool.pop(); $('round').textContent=round;$('qtitle').textContent=current.title;$('qtype').textContent=current.type;$('result').className='result hidden';render();
}
function render(){
 let h='';
 for(let i=0;i<=line.length;i++){
   h+=`<div class="slot"><button ${locked?'disabled':''} onclick="place(${i})">＋</button></div>`;
   if(i<line.length){let a=line[i];h+=`<div class="card"><div class="year">${a.year}</div><div class="name">${a.title}</div></div>`}
 }
 $('timeline').innerHTML=h;
}
function place(i){
 if(locked)return; locked=true;
 let correct=0; while(correct<line.length && line[correct].date.localeCompare(current.date)<=0)correct++;
 const ok=i===correct; if(ok)score+=100;
 line.splice(correct,0,current); $('score').textContent=score; render();
 const r=$('result');r.className='result '+(ok?'good':'bad');
 r.innerHTML=`<strong>${ok?'✓ 正解！':'✕ 惜しい！'}</strong><br>${current.title}<br><b>${current.date.replaceAll('-',' / ')}</b><button onclick="advance()">NEXT</button>`;
 r.scrollIntoView({behavior:'smooth',block:'nearest'});
}
function advance(){round++;nextQuestion()}
function finish(){
 $('game').classList.add('hidden');$('finish').classList.remove('hidden');$('finalScore').textContent=score+' pts';
 const rate=score/(maxRound*100);$('rank').textContent=rate>=.9?'ANIME ARCHIVIST':rate>=.7?'TIMELINE MASTER':rate>=.5?'ANIME FAN':'ROOKIE';
}
