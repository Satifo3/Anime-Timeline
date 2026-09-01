
let pool = [], line = [], current = null, score = 0, round = 1, maxRound = 10, locked = false;

const $ = id => document.getElementById(id);
const RECORD_KEY = 'animeTimelineRecordsV02';

function shuffle(a){
  const x = [...a];
  for(let i = x.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [x[i], x[j]] = [x[j], x[i]];
  }
  return x;
}

function getRecords(){
  try{
    return JSON.parse(localStorage.getItem(RECORD_KEY) || '[]');
  }catch(e){
    return [];
  }
}

function saveRecord(points, questions){
  const records = getRecords();
  const now = new Date();
  records.push({
    points,
    questions,
    accuracy: Math.round(points / (questions * 100) * 100),
    date: now.toLocaleDateString('ja-JP'),
    time: now.toLocaleTimeString('ja-JP', {hour:'2-digit', minute:'2-digit'})
  });
  records.sort((a, b) => b.points - a.points || b.accuracy - a.accuracy);
  const top = records.slice(0, 10);
  localStorage.setItem(RECORD_KEY, JSON.stringify(top));
  return top.findIndex(r =>
    r.points === points &&
    r.questions === questions &&
    r.date === now.toLocaleDateString('ja-JP')
  ) + 1;
}

function updateBest(){
  const r = getRecords();
  const best = r.length ? r[0].points + ' pts' : '---';
  if($('bestScore')) $('bestScore').textContent = best;
  if($('previewBest')) $('previewBest').textContent = best;
  if($('gameBest')) $('gameBest').textContent = best;
}

function renderRecords(){
  const records = getRecords();
  const box = $('recordList');
  if(!box) return;
  if(!records.length){
    box.innerHTML = '<div class="empty">まだ記録がありません。</div>';
    return;
  }
  box.innerHTML = records.map((x, i) => `
    <div class="recordRow">
      <div class="place">#${i + 1}</div>
      <div><b>${x.questions}問モード</b><br><small>${x.date} ${x.time} ・ 正解率 ${x.accuracy}%</small></div>
      <div class="pts">${x.points}<small> pts</small></div>
    </div>
  `).join('');
}

function hideAllScreens(){
  $('start').classList.add('hidden');
  $('records').classList.add('hidden');
  $('game').classList.add('hidden');
  $('finish').classList.add('hidden');
}

function goHome(){
  hideAllScreens();
  $('start').classList.remove('hidden');
  updateBest();
}

function showRecords(){
  hideAllScreens();
  $('records').classList.remove('hidden');
  renderRecords();
}

function hideRecords(){
  goHome();
}

function showRecordsFromFinish(){
  hideAllScreens();
  $('records').classList.remove('hidden');
  renderRecords();
}

function showRecordsFromGame(){
  hideAllScreens();
  $('records').classList.remove('hidden');
  renderRecords();
}

function clearRecords(){
  if(confirm('保存されているレコードをすべて削除しますか？')){
    localStorage.removeItem(RECORD_KEY);
    renderRecords();
    updateBest();
  }
}

function updateAccuracy(){
  const played = Math.max(0, round - 1);
  const correct = Math.round(score / 100);
  const acc = played ? Math.round((correct / played) * 100) : 0;
  if($('accuracy')) $('accuracy').textContent = acc + '%';
}

function startGame(n){
  maxRound = n;
  score = 0;
  round = 1;
  locked = false;

  pool = shuffle(window.ANIME_DATA);
  line = [pool.pop(), pool.pop(), pool.pop()].sort((a, b) => a.date.localeCompare(b.date));

  hideAllScreens();
  $('game').classList.remove('hidden');

  $('maxRound').textContent = n;
  $('score').textContent = 0;
  updateBest();
  updateAccuracy();
  nextQuestion();
  window.scrollTo({top:0, behavior:'smooth'});
}

function nextQuestion(){
  if(round > maxRound || !pool.length){
    finish();
    return;
  }
  locked = false;
  current = pool.pop();
  $('round').textContent = round;
  $('qtitle').textContent = current.title;
  $('qtype').textContent = current.type;
  $('result').className = 'result hidden';
  render();
}

function render(){
  let h = '';
  for(let i = 0; i <= line.length; i++){
    h += `<div class="slot"><button ${locked ? 'disabled' : ''} onclick="place(${i})">＋</button></div>`;
    if(i < line.length){
      const a = line[i];
      h += `<div class="card"><div class="year">${a.year}</div><div class="name">${a.title}</div></div>`;
    }
  }
  $('timeline').innerHTML = h;
}

function place(i){
  if(locked) return;
  locked = true;

  let correct = 0;
  while(correct < line.length && line[correct].date.localeCompare(current.date) <= 0){
    correct++;
  }

  const ok = i === correct;
  if(ok) score += 100;

  line.splice(correct, 0, current);
  $('score').textContent = score;
  updateAccuracy();
  render();

  const nice = current.date.split('-').join(' / ');
  const r = $('result');
  r.className = 'result ' + (ok ? 'good' : 'bad');
  r.innerHTML = `<strong>${ok ? '✓ 正解！' : '✕ 惜しい！'}</strong><br>${current.title}<br><b>${nice}</b><button onclick="advance()">NEXT</button>`;
  r.scrollIntoView({behavior:'smooth', block:'nearest'});
}

function advance(){
  round++;
  updateAccuracy();
  nextQuestion();
}

function finish(){
  hideAllScreens();
  $('finish').classList.remove('hidden');
  $('finalScore').textContent = score + ' pts';

  const rate = score / (maxRound * 100);
  $('rank').textContent =
    rate >= 0.9 ? 'ANIME ARCHIVIST' :
    rate >= 0.7 ? 'TIMELINE MASTER' :
    rate >= 0.5 ? 'ANIME FAN' :
    'ROOKIE';

  const rank = saveRecord(score, maxRound);
  $('recordMessage').textContent =
    rank && rank <= 10
      ? `ローカルレコード #${rank} に保存しました。`
      : '今回のスコアを保存しました。';

  updateBest();
  window.scrollTo({top:0, behavior:'smooth'});
}

$('count').textContent = window.ANIME_DATA.length;
updateBest();
goHome();
