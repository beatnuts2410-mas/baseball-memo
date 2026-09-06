
const KEY="baseball_memo_v3";
const sampleNames=["田中大輔","佐藤翔","山田蓮","鈴木健","高橋悠","伊藤駿","渡辺直","小林海","加藤翼","中村颯","吉田陸","山口航","松本樹","井上拓","木村優","林大地","清水蓮","森川亮"];
let db=JSON.parse(localStorage.getItem(KEY)||"null")||{
team:{name:"青葉高校",players:sampleNames.map((name,i)=>({name,num:i+1}))},
games:[],
current:null,
lastLineup:[]
};
let tab="record";
let resultGameId=null;
let gameHistory = [];
function save(){localStorage.setItem(KEY,JSON.stringify(db))}
function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]))}
function toast(t){let x=document.createElement("div");x.className="toast";x.textContent=t;document.body.appendChild(x);setTimeout(()=>x.remove(),1800)}
function newGame(order='先攻',opts={}){
 const d=new Date(); const ds=d.toISOString().slice(0,10);
 const o=order==='後攻'?'後攻':'先攻';
 const inning=Math.max(1,Number(opts.inning)||1);
 // 後攻の通常開始は相手の1回表から。途中開始は指定halfを優先。
 const half=opts.half || '表';
 const outs=Math.min(2,Math.max(0,Number(opts.outs)||0));
 const scoreUs=Math.max(0,Number(opts.scoreUs)||0), scoreOpp=Math.max(0,Number(opts.scoreOpp)||0);
 db.current={id:Date.now(),date:ds,tournament:'',stadium:'',opponent:opts.opponent||'桜ヶ丘高校',innings:opts.initialInnings||[],pa:[],lineup:[],batterIndex:Math.min(8,Math.max(0,Number(opts.batterIndex)||0)),scoreUs,scoreOpp,inning,half,order:o,outs,runners:[0,0,0],runnerNames:[null,null,null],finished:false,pitcher:null,dh:null,subs:[],startedLate:!!opts.startedLate,eventSeq:0};
 gameHistory=[]; save(); render();
}
function startNewGame(order){newGame(order);toast(order==='先攻'?'先攻で試合を開始':'後攻で試合を開始')}
function ownHalf(g){return (g.order||'先攻')==='先攻'?'表':'裏'}
function opponentHalf(g){return ownHalf(g)==='表'?'裏':'表'}
function ensureGame(){if(!db.current) newGameSetup()}
function newGameSetup(){db.current=null;gameHistory=[];tab='record';save();render()}
function setupView(){
 return `<div class="card"><div class="title">新しい試合</div><p class="muted">試合開始前でも、途中からでも記録できます。</p>
 <div class="setupLabel">自チームの攻撃順</div><div class="seg"><button id="setupFirst" class="active" onclick="setSetupHalf('先攻')">先攻</button><button id="setupSecond" onclick="setSetupHalf('後攻')">後攻</button></div>
 <div class="setupLabel">開始方法</div><div class="seg"><button id="setupNormal" class="active" onclick="setSetupMode('normal')">最初から</button><button id="setupLate" onclick="setSetupMode('late')">途中から</button></div>
 <div class="setupGrid"><div><div class="setupLabel">相手チーム</div><input id="setupOpponent" class="input" value="桜ヶ丘高校"></div><div><div class="setupLabel">開始イニング</div><input id="setupInning" class="input" type="number" min="1" value="1" onchange="refreshLateSetup()"></div></div>
 <div class="setupLabel">開始する攻撃</div><div class="seg"><button id="setupTop" class="active" onclick="setSetupAttack('表')">表</button><button id="setupBottom" onclick="setSetupAttack('裏')">裏</button></div>
 <div id="lateFields" class="hidden"><div class="setupLabel">途中開始時の状況</div><div class="setupLabel" id="lateScoreTitle">これまでの得点</div><div id="lateScoreFields" class="quickScore"></div><div class="hint" style="margin-top:8px">開始イニングより前の各回の得点を入力してください。</div><div class="setupLabel">現在のアウト</div><div id="setupOutsSeg" class="seg"><button class="active" onclick="setSetupOuts(0)">0</button><button onclick="setSetupOuts(1)">1</button><button onclick="setSetupOuts(2)">2</button></div><div class="setupLabel">現在の打順</div><div id="setupBatterSeg" class="seg" style="display:grid;grid-template-columns:repeat(3,1fr)">${Array.from({length:9},(_,i)=>`<button class="${i===0?'active':''}" onclick="setSetupBatter(${i})">${i+1}番</button>`).join('')}</div></div>
 <button class="btn primary" style="width:100%;margin-top:14px" onclick="createConfiguredGame()">この条件で試合を開始</button></div>`;
}
let setupState={order:'先攻',mode:'normal',attack:'表',outs:0,batterIndex:0};
function setSetupHalf(v){setupState.order=v;document.getElementById('setupFirst')?.classList.toggle('active',v==='先攻');document.getElementById('setupSecond')?.classList.toggle('active',v==='後攻');if(setupState.mode==='normal')setSetupAttack(v==='先攻'?'表':'裏')}
function setSetupMode(v){setupState.mode=v;document.getElementById('setupNormal')?.classList.toggle('active',v==='normal');document.getElementById('setupLate')?.classList.toggle('active',v==='late');document.getElementById('lateFields')?.classList.toggle('hidden',v!=='late');refreshLateSetup()}
function refreshLateSetup(){
 const n=Math.max(1,Number(document.getElementById('setupInning')?.value)||1),box=document.getElementById('lateScoreFields'),title=document.getElementById('lateScoreTitle');
 if(title)title.textContent=n>1?`${n}回から途中開始：${n-1}回終了時の得点`:'途中開始時の得点';
 if(!box)return;if(setupState.mode!=='late'||n<=1){box.innerHTML='';return;}
 box.innerHTML=Array.from({length:n-1},(_,i)=>`<div style="grid-column:1/-1;display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:6px"><label class="inputLabel">${i+1}回表（相手）<input id="setupTop${i+1}" class="input" type="number" min="0" value="0"></label><label class="inputLabel">${i+1}回裏（自チーム）<input id="setupBottom${i+1}" class="input" type="number" min="0" value="0"></label></div>`).join('');
}

function setSetupAttack(v){setupState.attack=v;document.getElementById('setupTop')?.classList.toggle('active',v==='表');document.getElementById('setupBottom')?.classList.toggle('active',v==='裏')}
function setSetupOuts(v){setupState.outs=v;document.querySelectorAll('#setupOutsSeg button').forEach(b=>b.classList.toggle('active',Number(b.textContent)===v))}
function setSetupBatter(v){setupState.batterIndex=v;document.querySelectorAll('#setupBatterSeg button').forEach((b,i)=>b.classList.toggle('active',i===v))}
function createConfiguredGame(){
 const late=setupState.mode==='late',inning=Math.max(1,Number(document.getElementById('setupInning')?.value)||1),half=late?setupState.attack:(setupState.order==='先攻'?'表':'裏');
 let innings=[],scoreUs=0,scoreOpp=0;
 if(late&&inning>1){for(let i=1;i<inning;i++){const top=Math.max(0,Number(document.getElementById(`setupTop${i}`)?.value)||0),bottom=Math.max(0,Number(document.getElementById(`setupBottom${i}`)?.value)||0),us=setupState.order==='先攻'?top:bottom,opp=setupState.order==='先攻'?bottom:top;innings.push({us,opp});scoreUs+=us;scoreOpp+=opp;}}
 newGame(setupState.order,{opponent:document.getElementById('setupOpponent')?.value||'相手校',inning,half,outs:late?setupState.outs:0,scoreUs,scoreOpp,batterIndex:late?setupState.batterIndex:0,startedLate:late,initialInnings:innings});toast(late?`${inning}回${half}から記録を開始`:'試合を開始');
}

function gameHeader(){
 let g=db.current;if(!g)return `<div class="card"><div class="title">試合を始める</div><p class="muted">先攻・後攻を選んでから試合を開始します。</p><div class="orderGrid"><button class="orderBtn active" onclick="startNewGame('先攻')">先攻</button><button class="orderBtn" onclick="startNewGame('後攻')">後攻</button></div><p class="hint">先攻なら1回表から、後攻なら相手の1回表を経て自チームの1回裏から記録します。</p></div>`;
 if(g.startedLate) return `<div class="card"><div class="score"><div><div class="bigscore">${g.inning}回${g.half}</div></div><div><span class="badge">${esc(g.order||'先攻')}</span></div></div></div>`;
 return `<div class="card"><div class="score"><div><div class="team">${esc(db.team.name)}</div></div><div><div class="bigscore">${g.scoreUs} - ${g.scoreOpp}</div><span class="badge">${g.inning}回${g.half}</span></div><div><div class="team">${esc(g.opponent||"相手校")}</div></div></div></div>`;
}
function ensureInning(g,index){
 if(!g)return;
 const i=Math.max(0,Number(index)||0);
 while(g.innings.length<=i) g.innings.push({us:0,opp:0});
 if(!g.innings[i]) g.innings[i]={us:0,opp:0};
}
function advanceHalf(g){
 if(!g)return false;
 const inning=Math.max(1,Number(g.inning)||1);
 const own=ownHalf(g), opp=opponentHalf(g);
 ensureInning(g,inning-1);
 // 必ず「現在の回の自チーム攻撃→同じ回の相手攻撃→次の回の自チーム攻撃」
 // の順で進める。3アウト時はこの関数だけがイニング/表裏を変更する。
 if(g.half===own){
   g.inning=inning;
   g.half=opp;
 }else{
   g.inning=inning+1;
   g.half=own;
   ensureInning(g,g.inning-1);
 }
 g.outs=0;
 g.runners=[0,0,0];
 g.runnerNames=[null,null,null];
 return true;
}
function endHalfOnThreeOuts(g){
 if(!g)return false;
 g.outs=Math.max(0,Number(g.outs)||0);
 if(g.outs<3)return false;
 advanceHalf(g);
 return true;
}

function scoreTable(g){
 let max=Math.max(9,g.innings.length||0), cols="";
 for(let i=1;i<=max;i++){let x=g.innings[i-1]||{us:"",opp:""};cols+=`<tr><td>${i}</td><td>${x.us??""}</td><td>${x.opp??""}</td></tr>`}
 return `<div class="scoretable"><table><thead><tr><th>回</th><th>${esc(db.team.name)}</th><th>${esc(g.opponent||"相手")}</th></tr></thead><tbody>${cols}</tbody></table></div>`;
}
function ruleEndAlert(g){
 if(!g||g.finished)return '';
 const diff=Math.abs((Number(g.scoreUs)||0)-(Number(g.scoreOpp)||0));
 let reason='';
 if(g.inning>=5 && diff>=10) reason=`${g.inning}回・10点差以上`;
 else if(g.inning>=7 && diff>=7) reason=`${g.inning}回・7点差以上`;
 else if(g.inning>=9 && g.inning===9 && g.scoreUs!==g.scoreOpp) reason='9回終了条件・同点ではありません';
 if(!reason)return '';
 return `<div class="ruleAlert"><b>⚠️ 試合終了しますか？</b><div class="muted">${reason}のため、試合終了を選択できます。</div><button class="ruleBtn" onclick="finishGame()">試合終了として保存する</button></div>`;
}
function adjustOuts(){
 const g=db.current;if(!g)return;
 document.getElementById('outsAdjustModal').style.display='flex';
 document.getElementById('outsAdjustTarget').textContent=`現在：${g.inning}回${g.half}　アウト ${g.outs}`;
 document.getElementById('outsAdjustButtons').innerHTML=[0,1,2,3].map(n=>`<button class="btn ${g.outs===n?'primary':''}" onclick="setOutsAdjusted(${n})">${n}アウト</button>`).join('');
}
function closeOutsAdjust(){document.getElementById('outsAdjustModal').style.display='none'}
function setOutsAdjusted(n){
 const g=db.current;if(!g)return;
 pushGameHistory();
 g.outs=Math.max(0,Math.min(3,Number(n)||0));
 if(g.outs===3){advanceHalf(g);save();closeOutsAdjust();render();toast(`${g.inning}回${g.half}へ`);return;}
 save();closeOutsAdjust();render();toast(`アウトを${g.outs}に修正しました`);
}
function openDefensiveSub(){
 const g=db.current;if(!g||!g.lineup.length)return;
 const sel=document.getElementById('defSubPosition');
 if(!sel)return;
 sel.innerHTML=(g.lineup||[]).map((p,i)=>`<option value="${i}">${i+1}番・${esc(p?.name||'未登録')}（${esc(p?.pos||'守備位置未設定')}）</option>`).join('');
 refreshDefReplacement();document.getElementById('defSubModal').style.display='flex';
}
function closeDefensiveSub(){document.getElementById('defSubModal').style.display='none'}
function refreshDefReplacement(){
 const g=db.current,sel=document.getElementById('defSubReplacement');if(!g||!sel)return;
 const idx=Number(document.getElementById('defSubPosition')?.value||0);
 const current=g.lineup[idx];
 const active=new Set((g.lineup||[]).map(p=>p?.name));
 const roster=(db.team.players||[]).filter(p=>!active.has(p.name));
 sel.innerHTML=roster.length?roster.map(p=>`<option value="${esc(p.name)}">${esc(p.name)}${p.num?' #'+p.num:''}</option>`).join(''):'<option value="">交代可能な選手がいません</option>';
 document.getElementById('defSubCurrent').textContent=`現在：${current?.name||'未登録'}　守備：${current?.pos||'未設定'}`;
}
function applyDefensiveSub(){
 const g=db.current;if(!g)return;
 const idx=Number(document.getElementById('defSubPosition').value),name=document.getElementById('defSubReplacement').value;
 const replacement=db.team.players.find(p=>p.name===name),before=g.lineup[idx];
 if(!before)return toast('交代対象を選択してください'); if(!replacement)return toast('交代選手を選択してください');
 if(before.name===replacement.name)return toast('同じ選手です');
 pushGameHistory();g.subs=g.subs||[];g.subs.push({time:new Date().toISOString(),type:'守備交代',slot:idx,position:before.pos||'',from:before,to:replacement,defenseOnly:true});
 g.lineup[idx]=Object.assign({},replacement,{pos:before.pos||''});
 save();closeDefensiveSub();render();toast(`守備交代：${before.pos||'守備'} ${replacement.name}`);
}
function recordView(){
 if(!db.current)return setupView();
 let g=db.current;
 if(g.lineup.length<9){
   if(g.startedLate)return lateBatterView(g);
   return `<div class="card"><div class="title">まずオーダーを作成</div><p class="muted">チーム登録済みの選手から1〜9番を選びます。</p><button class="btn primary" onclick="tab='lineup';render()">オーダー作成へ</button></div>`;
 }
 if(g.half!==ownHalf(g)) return opponentView();
 let b=g.lineup[g.batterIndex%9]||{name:"打者"};
 let labels=[['単打','hit'],['二塁打','hit'],['三塁打','hit'],['本塁打','good'],['四球','walk'],['死球','walk'],['三振','out'],['犠打','good'],['犠飛','good'],['ゴロ','out'],['ライナー','out'],['フライ','out'],['グランドルール','out'],['その他','']];
 return gameHeader()+ruleEndAlert(g)+`<div class="card"><div class="title">スコア</div>${scoreTable(g)}<button class="btn small" style="margin-top:8px" onclick="undoGame()">↩ 直前の操作を戻す</button></div>
 <div class="card current"><div class="muted">${g.inning}回${g.half}・自チーム攻撃</div><div class="row between"><div><div class="batter">${esc(b.name)}</div><span class="badge">${(g.batterIndex%9)+1}番</span></div><div style="text-align:right"><div class="muted">アウト</div><b style="font-size:25px">${g.outs}</b><button class="btn small" style="margin-top:6px" onclick="adjustOuts()">✎ アウト修正</button></div></div></div>
 <div class="card"><div class="title">打席結果を選択</div><div class="resultgrid">${labels.map(([t,c])=>`<button class="result ${c}" onclick="pa('${t}')">${t}</button>`).join('')}</div></div>
 <div class="card"><div class="row between"><div class="title" style="margin:0">選手交代</div><button class="btn small" onclick="openInGameSub()">交代</button></div><div class="muted">${(g.subs||[]).slice(-2).map(x=>`${x.type}：${x.from?.name||''} → ${x.to?.name||''}`).join('<br>')||'交代なし'}</div></div>
 <div class="card"><div class="row between"><div class="title" style="margin:0">走者・グランド</div><button class="btn small" onclick="openRunnerCorrection()">✎ 走者修正</button></div>${renderBaseDiamond(g)}<div class="row" style="margin-top:10px">${['1塁','2塁','3塁'].map((x,i)=>`<button class="btn ${g.runners[i]?'green':''}" onclick="toggleRunner(${i})">${x} ${g.runners[i]?'●':'○'}</button>`).join('')}</div><div class="corrNote" style="margin-top:8px">ヒット・四死球後の打者も現在の塁に表示。盗塁は「走者→アウト/セーフ→進塁先」。その他は「走者→進塁先」。ボークは全走者を自動で1つ進めます。</div></div>
 <div class="card"><div class="row between"><div class="title" style="margin:0">走者プレー</div><span class="muted">盗塁：走者→アウト/セーフ→進塁先</span></div><div class="hint" style="margin-top:6px">盗塁・パスボール・暴投・捕逸・ボークを同じ操作で記録できます。</div><div class="stealGrid" style="margin-top:10px"><button class="runnerActionBtn" onclick="openRunnerMove('盗塁')" ${g.runners.some(Boolean)?'':'disabled'}>🏃 盗塁</button><button class="runnerActionBtn" onclick="openRunnerMove('パスボール')" ${g.runners.some(Boolean)?'':'disabled'}>⚾ パスボール</button><button class="runnerActionBtn" onclick="openRunnerMove('暴投')" ${g.runners.some(Boolean)?'':'disabled'}>🥎 暴投</button><button class="runnerActionBtn" onclick="openRunnerMove('捕逸')" ${g.runners.some(Boolean)?'':'disabled'}>🧤 捕逸</button><button class="runnerActionBtn" onclick="openRunnerMove('ボーク')" ${g.runners.some(Boolean)?'':'disabled'}>🚨 ボーク</button></div></div>
 <div class="card"><div class="row between"><div class="title" style="margin:0">今日の試合経過</div><button class="btn small" onclick="finishGame()">試合終了</button></div><div class="history">${g.pa.slice(-8).reverse().map((x,i)=>{const isLast=i===0;return `<div class="hist"><div class="row between"><div><b>${x.inning}回${x.half}</b>　${esc(x.batter)} <span class="muted">→</span> ${esc(x.result)}${x.runs?` <span class="badge">${x.runs}点</span>`:''}</div>${`<button class="editBtn" onclick="restartFromPA(${g.pa.length-1-i})">✎ この打席から修正</button>`}</div></div>`}).join('')||`<div class="empty">まだ記録がありません</div>`}</div></div>`;
}
function lateBatterView(g){
 const slot=g.batterIndex%9; const used=new Set((g.lineup||[]).map(p=>p?.name)); const opts=db.team.players.filter(p=>!used.has(p.name)).map(p=>`<option value="${esc(p.name)}">${esc(p.name)}${p.num?' #'+p.num:''}</option>`).join('');
 return gameHeader()+`<div class="card current"><div class="title">途中開始：${slot+1}番打者を登録</div><p class="muted">試合途中で入った場合は、分かる打順から1人ずつ登録できます。打者一巡（9人）が揃ったら打順を確定できます。</p><select id="lateBatterSelect" class="select"><option value="">${slot+1}番の選手を選択</option>${opts}</select><button class="btn primary" style="width:100%;margin-top:10px" onclick="saveLateBatter()">この打者を登録</button></div><div class="card"><div class="title">現在の打順</div>${Array.from({length:9},(_,i)=>`<div class="row between" style="padding:8px 0;border-bottom:1px solid #243248"><span>${i+1}番</span><b>${esc(g.lineup[i]?.name||'未登録')}</b></div>`).join('')}</div>`;
}
function saveLateBatter(){
 const g=db.current; if(!g)return; const name=document.getElementById('lateBatterSelect')?.value; if(!name)return toast('選手を選択してください'); const slot=g.batterIndex%9; if((g.lineup||[]).some(p=>p?.name===name))return toast('同じ選手は登録できません'); pushGameHistory(); const pl=db.team.players.find(p=>p.name===name);g.lineup[slot]=Object.assign({},pl,{pos:''});save();render();toast(`${slot+1}番 ${name} を登録しました`);
}
function opponentView(){
 let g=db.current;
 let x=g.innings[g.inning-1]||{us:0,opp:0};
 return gameHeader()+ruleEndAlert(g)+`<div class="card current"><div class="muted">現在：${g.inning}回${g.half}・相手チーム攻撃</div><div style="font-size:26px;font-weight:900;margin:8px 0">相手は何点入りましたか？</div><div class="hint">得点を選ぶと、その回の相手攻撃を終了して自チームの攻撃へ切り替わります。</div><div class="grid2"><button class="btn" onclick="setOppRuns(-1)">−</button><div class="input" style="text-align:center;font-weight:900;font-size:24px">${x.opp||0} 点</div></div><div class="row" style="flex-wrap:wrap;margin-top:10px">${[0,1,2,3,4,5,6,7,8,9].map(n=>`<button class="btn ${x.opp===n?'primary':''}" onclick="setOppRuns(${n})">${n}</button>`).join('')}</div><div class="title" style="margin-top:16px">相手のアウト</div><div class="row"><button class="btn" onclick="oppOut()">アウト＋1</button><span class="badge">${g.outs} / 3</span><button class="btn small" onclick="adjustOuts()">✎ アウト修正</button></div><div class="hint" style="margin-top:8px">3アウトになると自動で次の攻撃へ切り替わります。</div><button class="btn" style="width:100%;margin-top:10px" onclick="openDefensiveSub()">🧤 自チームの守備交代</button></div>
 <div class="card"><div class="title">イニングスコア</div>${scoreTable(g)}</div>`;
}
function setOppRuns(n){const g=db.current;if(!g)return;pushGameHistory();ensureInning(g,g.inning-1);const x=g.innings[g.inning-1];x.opp=Math.max(0,Number(n)||0);g.scoreOpp=g.innings.reduce((a,v)=>a+(Number(v.opp)||0),0);advanceHalf(g);save();render();toast(`${g.inning}回${g.half}へ`)}
function oppOut(){
 const g=db.current;if(!g)return;pushGameHistory();g.outs=(Number(g.outs)||0)+1;
 if(endHalfOnThreeOuts(g)){save();render();toast(`${g.inning}回${g.half}へ`);return;}
 save();render();
}
function finishHalf(){pushGameHistory();const g=db.current;if(!g)return;const x=g.innings[g.inning-1]||{us:0,opp:0};x.us=Number(x.us)||0;x.opp=Number(x.opp)||0;g.innings[g.inning-1]=x;advanceHalf(g);save();render();toast(`${g.inning}回${g.half}へ`)}

function cloneRunners(r){return [Number(r?.[0])||0,Number(r?.[1])||0,Number(r?.[2])||0]}
function cloneRunnerNames(r){return [r?.[0]||null,r?.[1]||null,r?.[2]||null]}
function syncRunnerNames(g,names){g.runnerNames=cloneRunnerNames(names);}
function advanceRunners(g,result,batterName){
  let before=cloneRunners(g.runners), names=cloneRunnerNames(g.runnerNames), after=[0,0,0], afterNames=[null,null,null], scored=0,rbi=0;
  const score=(n,credited=true)=>{scored+=n;if(credited)rbi+=n};
  const keep=(from,to)=>{if(before[from]){after[to]=1;afterNames[to]=names[from]||'走者'}};
  if(result==='本塁打'){score(before.filter(Boolean).length+1);syncRunnerNames(g,afterNames);return {runners:after,names:afterNames,scored,rbi,detail:`走者${before.filter(Boolean).length}人＋打者が生還`};}
  if(result==='三塁打'){score(before.filter(Boolean).length);after[2]=1;afterNames[2]=batterName;syncRunnerNames(g,afterNames);return {runners:after,names:afterNames,scored,rbi,detail:`走者${before.filter(Boolean).length}人が生還`};}
  if(result==='二塁打'){if(before[2])score(1);if(before[1])score(1);keep(0,2);after[1]=1;afterNames[1]=batterName;syncRunnerNames(g,afterNames);return {runners:after,names:afterNames,scored,rbi,detail:`二塁打で走者を進塁`};}
  if(result==='単打'){if(before[2])score(1);keep(1,2);keep(0,1);after[0]=1;afterNames[0]=batterName;syncRunnerNames(g,afterNames);return {runners:after,names:afterNames,scored,rbi,detail:`単打で走者を進塁`};}
  if(result==='四球'||result==='死球'){
    if(before[0]&&before[1]&&before[2])score(1);
    if(before[0]&&before[1]){after[2]=1;afterNames[2]=names[1]||'走者'}else if(before[2]){after[2]=1;afterNames[2]=names[2]||'走者'}
    if(before[0]){after[1]=1;afterNames[1]=names[0]||'走者'}else if(before[1]){after[1]=1;afterNames[1]=names[1]||'走者'}
    after[0]=1;afterNames[0]=batterName;syncRunnerNames(g,afterNames);return {runners:after,names:afterNames,scored,rbi,detail:scored?`押し出しで${scored}点`:''};
  }
  if(result==='犠飛'){if(before[2])score(1);keep(0,0);keep(1,1);syncRunnerNames(g,afterNames);return {runners:after,names:afterNames,scored,rbi,detail:scored?'犠飛で三塁走者生還':''};}
  if(result==='犠打'){if(before[2])score(1);else if(before[1])keep(1,2);keep(0,1);syncRunnerNames(g,afterNames);return {runners:after,names:afterNames,scored,rbi,detail:'犠打で走者を進塁'};}
  if(result==='グランドルール'){syncRunnerNames(g,names);return {runners:before,names:names,scored:0,rbi:0,detail:'グランドルールで打者アウト'};}
  after=before;afterNames=names;syncRunnerNames(g,afterNames);return {runners:after,names:afterNames,scored:0,rbi:0,detail:''};
}
function renderBaseDiamond(g){
 const names=cloneRunnerNames(g.runnerNames); const lab=(i,base)=>g.runners[i]?`<div class="baseName ${['bn1','bn2','bn3'][i]}">${esc(names[i]||'走者')}<br><span class="muted">${base}</span></div>`:'';
 return `<div class="runnerBases" style="height:250px"><div class="diamond" style="width:125px;height:125px;left:62px;top:62px"></div><div class="runnerBase rb1 ${g.runners[0]?'on':''}"><span>1塁</span></div><div class="runnerBase rb2 ${g.runners[1]?'on':''}"><span>2塁</span></div><div class="runnerBase rb3 ${g.runners[2]?'on':''}"><span>3塁</span></div><div class="baseName" style="left:50%;top:94%">本塁</div>${lab(0,'1塁')}${lab(1,'2塁')}${lab(2,'3塁')}</div>`;
}
let runnerMoveMode=null,runnerMoveFrom=null,runnerMoveJudged=false;
function openRunnerMove(mode){
 const g=db.current;if(!g||!g.runners.some(Boolean))return toast('走者がいません');
 if(mode==='ボーク')return applyBalk();
 runnerMoveMode=mode;runnerMoveFrom=null;runnerMoveJudged=false;
 document.getElementById('moveTarget').textContent=`${mode}：まず走者を選択してください`;
 document.getElementById('moveRunnerList').innerHTML=[0,1,2].filter(i=>g.runners[i]).map(i=>`<button class="btn" onclick="selectRunnerToMove(${i})">${i+1}塁　${esc(g.runnerNames?.[i]||'走者')}</button>`).join('');
 document.getElementById('moveDest').innerHTML='<div class="hint" style="grid-column:1/-1">先に走者を選択してください。</div>';
 document.getElementById('runnerMoveModal').style.display='flex';
}
function selectRunnerToMove(i){
 const g=db.current;if(!g?.runners[i])return;
 runnerMoveFrom=i;runnerMoveJudged=false;
 const name=g.runnerNames?.[i]||'走者';
 document.getElementById('moveTarget').textContent=`${runnerMoveMode}：${i+1}塁 ${name} の${runnerMoveMode==='盗塁'?'判定':'進塁先'}`;
 if(runnerMoveMode==='盗塁'){
   document.getElementById('moveDest').innerHTML='<div class="hint" style="margin-bottom:8px">まず盗塁の判定を選択してください。</div><div class="runnerActions"><button class="btn red" onclick="judgeSteal(\'アウト\')">アウト</button><button class="btn primary" onclick="judgeSteal(\'セーフ\')">セーフ</button></div>';
 }else{renderRunnerDestinations();}
}
function renderRunnerDestinations(){
 const g=db.current;if(runnerMoveFrom==null||!g)return;
 const i=runnerMoveFrom;
 document.getElementById('moveDest').innerHTML=`<div class="hint" style="margin-bottom:8px">進塁先を選択してください。</div><div class="runnerActions">${[1,2,3,4].filter(d=>d>i+1&&(d===4||!g.runners[d-1])).map(d=>`<button class="btn ${d===4?'red':''}" onclick="applyRunnerMove(${d})">${d===4?'本塁・得点':d+'塁へ'}</button>`).join('')}</div>`;
}
function judgeSteal(judgement){
 const g=db.current;if(runnerMoveFrom==null||!g?.runners[runnerMoveFrom])return closeRunnerMove();
 const from=runnerMoveFrom,before=cloneRunners(g.runners),beforeNames=cloneRunnerNames(g.runnerNames),name=beforeNames[from]||'走者';
 pushGameHistory();
 if(judgement==='アウト'){
   g.runners[from]=0;g.runnerNames[from]=null;g.outs=Math.min(3,(Number(g.outs)||0)+1);
   g.runnerMoves=g.runnerMoves||[];g.eventSeq=(Number(g.eventSeq)||0)+1;g.runnerMoves.push({seq:g.eventSeq,type:'盗塁',judgement:'アウト',inning:g.inning,half:g.half,from,dest:null,name,beforeRunners:before,beforeNames,afterRunners:cloneRunners(g.runners),afterNames:cloneRunnerNames(g.runnerNames),runs:0});
   const outNow=endHalfOnThreeOuts(g);
   save();closeRunnerMove();render();toast(`盗塁：${name} → アウト${outNow?'・3アウト':''}`);return;
 }
 runnerMoveJudged=true;
 document.getElementById('moveTarget').textContent=`盗塁：${name} → セーフ。進塁先を選択`;
 renderRunnerDestinations();
}
function closeRunnerMove(){document.getElementById('runnerMoveModal').style.display='none';runnerMoveMode=null;runnerMoveFrom=null;runnerMoveJudged=false}
function applyRunnerMove(dest){
 const g=db.current;if(runnerMoveFrom==null||!g?.runners[runnerMoveFrom])return closeRunnerMove();
 if(runnerMoveMode==='盗塁'&&!runnerMoveJudged)return toast('先にアウト・セーフを選択してください');
 const from=runnerMoveFrom,before=cloneRunners(g.runners),beforeNames=cloneRunnerNames(g.runnerNames),name=beforeNames[from]||'走者';
 pushGameHistory();
 g.runners[from]=0;g.runnerNames[from]=null;let scored=0;
 if(dest===4){scored=1;g.scoreUs=(Number(g.scoreUs)||0)+1}else{g.runners[dest-1]=1;g.runnerNames[dest-1]=name}
 g.runnerMoves=g.runnerMoves||[];g.eventSeq=(Number(g.eventSeq)||0)+1;g.runnerMoves.push({seq:g.eventSeq,type:runnerMoveMode,judgement:runnerMoveMode==='盗塁'?'セーフ':null,inning:g.inning,half:g.half,from,dest,name,beforeRunners:before,beforeNames,afterRunners:cloneRunners(g.runners),afterNames:cloneRunnerNames(g.runnerNames),runs:scored});
 updateInningScore(g);save();closeRunnerMove();render();toast(`${runnerMoveMode}：${name} → ${dest===4?'本塁・得点':dest+'塁'}`);
}
function applyBalk(){
 const g=db.current;if(!g||!g.runners.some(Boolean))return toast('走者がいません');
 const before=cloneRunners(g.runners),beforeNames=cloneRunnerNames(g.runnerNames);let scored=0;
 // ボーク：塁上の各走者を1つ先へ。同時進塁なので後ろの走者が前走者を追い越さない。
 const after=[0,0,0],afterNames=[null,null,null];
 if(before[2]){scored++;}
 if(before[1]){after[2]=1;afterNames[2]=beforeNames[1]||'走者';}
 if(before[0]){after[1]=1;afterNames[1]=beforeNames[0]||'走者';}
 pushGameHistory();
 g.runners=after;g.runnerNames=afterNames;g.scoreUs=(Number(g.scoreUs)||0)+scored;
 g.runnerMoves=g.runnerMoves||[];g.eventSeq=(Number(g.eventSeq)||0)+1;g.runnerMoves.push({seq:g.eventSeq,type:'ボーク',inning:g.inning,half:g.half,from:'auto',dest:'auto',name:'走者自動進塁',beforeRunners:before,beforeNames,afterRunners:cloneRunners(after),afterNames:cloneRunnerNames(afterNames),runs:scored});
 updateInningScore(g);save();render();toast(`ボーク：${scored?scored+'点・':''}走者を自動進塁`);
}
function openSteal(i){openRunnerMove('盗塁');selectRunnerToMove(i)}
function closeSteal(){closeRunnerMove()}
function updateInningScore(g){
  const prev=g.innings.slice(0,g.inning-1).reduce((a,v)=>a+(Number(v.us)||0),0);
  const x=g.innings[g.inning-1]||{us:0,opp:0}; x.us=Math.max(0,(Number(g.scoreUs)||0)-prev); g.innings[g.inning-1]=x;
}
function pa(result){
  pushGameHistory(); let g=db.current,b=g.lineup[g.batterIndex%9];if(!b)return;
  const before=cloneRunners(g.runners);
  const beforeNames=cloneRunnerNames(g.runnerNames);
  let out=0; if(['三振','ゴロ','ライナー','フライ','グランドルール'].includes(result)) out=1;
  // 併殺は現在の簡易入力では「ゴロ」として扱い、後から走者調整可能。
  const mv=advanceRunners(g,result,b.name);
  g.runners=mv.runners; g.runnerNames=cloneRunnerNames(mv.names); g.scoreUs=(Number(g.scoreUs)||0)+mv.scored;
  g.outs+=out;
  g.eventSeq=(Number(g.eventSeq)||0)+1; g.pa.push({seq:g.eventSeq,inning:g.inning,half:g.half,batter:b.name,result,rbi:mv.rbi,runs:mv.scored,beforeRunners:before,beforeRunnerNames:beforeNames,afterRunners:cloneRunners(g.runners),afterRunnerNames:cloneRunnerNames(g.runnerNames),outsAfter:g.outs,beforeScoreUs:Number(g.scoreUs)-mv.scored,beforeScoreUsSnapshot:Number(g.scoreUs)-mv.scored,beforeInning:g.inning,beforeHalf:g.half,beforeOuts:g.outs-out,beforeBatterIndex:g.batterIndex});
  updateInningScore(g);
  g.batterIndex++;
  const summary=mv.scored?` ${mv.scored}点`:(mv.detail?` ${mv.detail}`:'');
  if(endHalfOnThreeOuts(g)){}
  save();render();toast(`${b.name}：${result}${summary}`);
}
function openSteal(i){openRunnerMove('盗塁');selectRunnerToMove(i)}
function closeSteal(){closeRunnerMove()}
function restartFromPA(index){
 const g=db.current;if(!g||!g.pa[index])return; const p=g.pa[index]; if(!confirm(`${p.inning}回${p.half} ${p.batter}の打席から修正します。
この打席以降の記録をいったん削除して、そこから再入力します。`))return;
 pushGameHistory(); g.scoreUs=Number(p.beforeScoreUsSnapshot ?? p.beforeScoreUs ?? 0);g.inning=p.beforeInning;g.half=p.beforeHalf;g.outs=p.beforeOuts;g.runners=cloneRunners(p.beforeRunners);g.runnerNames=cloneRunnerNames(p.beforeRunnerNames);g.batterIndex=p.beforeBatterIndex;g.pa=g.pa.slice(0,index);g.steals=(g.steals||[]).filter(x=>x.inning<p.inning || (x.inning===p.inning && x.half!==p.half));g.runnerMoves=(g.runnerMoves||[]).filter(x=>x.inning<p.inning || (x.inning===p.inning && x.half!==p.half));updateInningScore(g);save();render();toast('この打席から再入力できます');
}
const PA_RESULTS=[['単打','hit'],['二塁打','hit'],['三塁打','hit'],['本塁打','good'],['四球','walk'],['死球','walk'],['三振','out'],['犠打','good'],['犠飛','good'],['ゴロ','out'],['ライナー','out'],['フライ','out'],['グランドルール','out'],['その他','']];
function openPACorrection(){
 ensureGame(); const g=db.current;
 if(!g||!g.pa.length)return toast('まず打席を1つ記録してください');
 const p=g.pa[g.pa.length-1];
 document.getElementById('paCorrTarget').textContent=`${p.inning}回${p.half} ${p.batter}：現在「${p.result}」`;
 document.getElementById('paCorrResults').innerHTML=PA_RESULTS.map(([t,c])=>`<button class="result ${c} ${p.result===t?'selected':''}" onclick="selectPACorrection('${t}')">${t}</button>`).join('');
 document.getElementById('paCorrectionModal').style.display='flex';
 document.getElementById('paCorrectionModal').dataset.result=p.result;
}
function selectPACorrection(result){
 document.getElementById('paCorrectionModal').dataset.result=result;
 document.querySelectorAll('#paCorrResults .result').forEach(b=>b.classList.toggle('selected',b.textContent===result));
}
function closePACorrection(){document.getElementById('paCorrectionModal').style.display='none'}
function applyPACorrection(){
 const g=db.current;if(!g||!g.pa.length)return;
 const p=g.pa[g.pa.length-1]; const result=document.getElementById('paCorrectionModal').dataset.result||p.result;
 if(result===p.result){closePACorrection();return toast('打席結果に変更はありません');}
 pushGameHistory();
 // 直前打席開始時点へ完全に戻し、新しい結果を同じ打者に再適用する。
 g.scoreUs=Number(p.beforeScoreUs)||0;
 g.inning=p.beforeInning; g.half=p.beforeHalf; g.outs=p.beforeOuts; g.batterIndex=p.beforeBatterIndex;
 g.runners=cloneRunners(p.beforeRunners);
 g.runnerNames=cloneRunnerNames(p.beforeRunnerNames);
 const b=g.lineup[g.batterIndex%9]||{name:p.batter};
 const out=['三振','ゴロ','ライナー','フライ','グランドルール'].includes(result)?1:0;
 const mv=advanceRunners(g,result,b.name);
 g.runners=mv.runners; g.runnerNames=cloneRunnerNames(mv.names); g.scoreUs+=mv.scored; g.outs+=out;
 p.result=result; p.rbi=mv.rbi; p.runs=mv.scored; p.afterRunners=cloneRunners(g.runners); p.outsAfter=g.outs;
 p.beforeScoreUs=Number(g.scoreUs)-mv.scored; // before value is preserved below
 // restore true before score from the snapshot source, not the recalculated value
 p.beforeScoreUs=Number(p.beforeScoreUsSnapshot ?? (g.scoreUs-mv.scored));
 // The original before score is needed for future corrections; create it if legacy data lacks a snapshot.
 if(p.beforeScoreUsSnapshot==null) p.beforeScoreUsSnapshot=Number(g.scoreUs)-mv.scored;
 updateInningScore(g);
 g.batterIndex=p.beforeBatterIndex+1;
 if(endHalfOnThreeOuts(g)){}
 save();closePACorrection();render();toast(`${p.batter}：${result} に修正しました`);
}
function openRunnerCorrection(){
 ensureGame();
 const g=db.current;
 if(!g.pa.length) return toast('まず打席を1つ記録してください');
 const p=g.pa[g.pa.length-1];
 document.getElementById('runnerCorrectionModal').style.display='flex';
 document.getElementById('corrTarget').textContent=`直前：${p.inning}回${p.half} ${p.batter} → ${p.result}`;
 document.getElementById('corrRuns').innerHTML=[0,1,2,3,4].map(n=>`<button class="btn ${p.runs===n?'primary':''}" onclick="setCorrectionRuns(${n})">${n}点</button>`).join('');
 ['1','2','3'].forEach((b,i)=>{document.getElementById('corrB'+b).classList.toggle('on',!!p.afterRunners[i])});
}
function setCorrectionRuns(n){document.getElementById('corrRuns').dataset.value=n;document.querySelectorAll('#corrRuns button').forEach(b=>b.classList.remove('primary'));const btn=[...document.querySelectorAll('#corrRuns button')].find(b=>b.textContent===n+'点');if(btn)btn.classList.add('primary')}
function toggleCorrectionBase(i){document.getElementById('corrB'+(i+1)).classList.toggle('on')}
function closeRunnerCorrection(){document.getElementById('runnerCorrectionModal').style.display='none'}
function applyRunnerCorrection(){
 const g=db.current;
 if(!g||!g.pa.length)return;
 pushGameHistory();
 const p=g.pa[g.pa.length-1];
 const runs=Number(document.getElementById('corrRuns').dataset.value ?? p.runs ?? 0);
 const after=[1,2,3].map((_,i)=>document.getElementById('corrB'+(i+1)).classList.contains('on')?1:0);
 // 直前の打席の状態へ戻し、修正後の結果を再適用する。
 g.scoreUs=Number(p.beforeScoreUs)||0;
 g.inning=p.beforeInning; g.half=p.beforeHalf; g.outs=p.beforeOuts; g.batterIndex=p.beforeBatterIndex;
 g.runners=cloneRunners(p.beforeRunners);
 g.runnerNames=cloneRunnerNames(p.beforeRunnerNames);
 p.runs=runs; p.rbi=runs; p.afterRunners=after; p.outsAfter=g.outs;
 g.scoreUs+=runs;
 g.runners=after;
 g.runnerNames=[1,2,3].map((_,i)=>after[i]?(p.afterRunnerNames?.[i]||'走者'):null);
 updateInningScore(g);
 g.outs=p.outsAfter;
 g.batterIndex=p.beforeBatterIndex+1;
 // 直前の打席が3アウトなら、元の攻守交代状態を復元
 if(p.outsAfter>=3){g.outs=3;endHalfOnThreeOuts(g);}
 save();closeRunnerCorrection();render();toast(`走者・得点を修正しました（${runs}点）`);
}
function toggleRunner(i){ensureGame();pushGameHistory();const g=db.current;g.runners[i]=g.runners[i]?0:1;g.runnerNames[i]=g.runners[i]?(g.runnerNames[i]||'走者'):null;save();render()}
function teamView(){
 return `<div class="card"><div class="title">チーム設定</div><div class="grid2"><input id="teamName" class="input" value="${esc(db.team.name)}" placeholder="チーム名"><button class="btn primary" onclick="setTeam()">保存</button></div></div>
 <div class="card"><div class="row between"><div class="title">選手名簿（${db.team.players.length}人）</div><button class="btn small" onclick="addPlayer()">＋ 選手追加</button></div>
 <div class="history">${db.team.players.map((p,i)=>`<div class="hist row between"><div><b>${p.num?`#${p.num} `:""}${esc(p.name)}</b></div><button class="btn small red" onclick="delPlayer(${i})">削除</button></div>`).join("")}</div></div>
 <div class="card"><div class="title">使い方</div><p class="muted">選手名はここで一度登録。試合ごとのオーダーは保存した名簿から選択します。</p></div>`;
}
function setTeam(){db.team.name=document.getElementById("teamName").value.trim()||"自校";save();render();toast("チーム名を保存しました")}
function addPlayer(){let name=prompt("選手名を入力");if(!name)return;let num=prompt("背番号（任意）")||"";db.team.players.push({name,num});save();render()}
function delPlayer(i){if(!confirm("この選手を名簿から削除しますか？"))return;db.team.players.splice(i,1);save();render()}
function lineupView(){
 ensureGame();let g=db.current;
 if(db.team.players.length<9)return `<div class="card"><div class="title">選手を9人以上登録してください</div><button class="btn" onclick="tab='team';render()">チーム登録へ</button></div>`;
 let opts=db.team.players.map(p=>`<option value="${esc(p.name)}">${esc(p.name)}</option>`).join('');
 let rows='';
 for(let i=0;i<9;i++){
   let v=g.lineup[i]?.name||db.lastLineup[i]?.name||db.team.players[i]?.name||'';
   let pos=g.lineup[i]?.pos||'';
   rows+=`<div class="playerrow"><div class="num">${i+1}</div><select class="select" data-li="${i}"><option value="">選手を選択</option>${opts}</select><select class="select" data-pos="${i}"><option value="">守備</option><option value="投">投</option><option value="捕">捕</option><option value="一">一</option><option value="二">二</option><option value="三">三</option><option value="遊">遊</option><option value="左">左</option><option value="中">中</option><option value="右">右</option><option value="DH">DH</option></select><button class="btn small" onclick="moveLine(${i},-1)">↑</button></div>`
 }
 return gameHeader()+`<div class="card"><div class="row between"><div class="title">試合情報</div><button class="btn small" onclick="copyPrev()">前回オーダー</button></div><div class="grid2"><input id="date" class="input" type="date" value="${g.date}"><input id="opp" class="input" value="${esc(g.opponent)}" placeholder="相手校"></div><div style="height:8px"></div><div class="grid2"><input id="tour" class="input" value="${esc(g.tournament)}" placeholder="大会名・回戦"><input id="stad" class="input" value="${esc(g.stadium)}" placeholder="球場"></div></div>
 <div class="card"><div class="title">打順・守備</div><div class="lineup">${rows}</div>
 <div style="height:10px"></div><div class="grid2"><div><div class="muted">投手</div><select id="pitcher" class="select"><option value="">選手を選択</option>${opts}</select></div><div><div class="muted">DH</div><select id="dh" class="select"><option value="">DHなし</option>${opts}</select></div></div>
 <button class="btn primary" style="width:100%;margin-top:10px" onclick="saveLineup()">オーダーを確定</button></div>
 <div class="card"><div class="title">守備イメージ</div><div class="field"><div class="diamond"></div><div class="base b1"></div><div class="base b2"></div><div class="base b3"></div><div class="base home"></div>${['投','捕','一','二','三','遊','左','中','右'].map((x,i)=>`<div class="pos p${i+1}">${x}</div>`).join('')}<div class="pos" style="left:82%;top:88%">DH</div></div></div>`;
}
function copyPrev(){if(!db.lastLineup.length)return toast("前回オーダーがありません");document.querySelectorAll("[data-li]").forEach((s,i)=>s.value=db.lastLineup[i]?.name||"");toast("前回オーダーを読み込みました")}
function saveLineup(){
 let g=db.current;g.date=document.getElementById('date').value;g.opponent=document.getElementById('opp').value.trim()||'相手校';g.tournament=document.getElementById('tour').value.trim();g.stadium=document.getElementById('stad').value.trim();
 let sels=[...document.querySelectorAll('[data-li]')];let arr=sels.map(s=>s.value);let poss=[...document.querySelectorAll('[data-pos]')].map(s=>s.value);
 if(arr.some(x=>!x)||new Set(arr).size!==9)return toast('1〜9番を9人、重複なしで選択してください');
 let pitcher=document.getElementById('pitcher').value;let dh=document.getElementById('dh').value;
 if(dh && arr.includes(dh)===false)return toast('DHは1〜9番の打順に入れてください');
 if(dh && pitcher===dh)return toast('DHと投手は別の選手にしてください');
 g.lineup=arr.map((n,i)=>Object.assign({},db.team.players.find(p=>p.name===n)||{name:n},{pos:poss[i]||''}));g.pitcher=pitcher?db.team.players.find(p=>p.name===pitcher):null;g.dh=dh?db.team.players.find(p=>p.name===dh):null;
 g.innings=g.innings||[];g.lastLineup=g.lineup;db.lastLineup=g.lineup;save();tab='record';render();toast('オーダーを確定しました')
}
function finishGame(){
 let g=db.current;if(!g)return;
 if(!confirm("試合を終了して結果を保存しますか？"))return;
 g.finished=true;g.finishedAt=new Date().toISOString();
 g.eventSeq=Number(g.eventSeq)||0;
 const saved=JSON.parse(JSON.stringify(g));
 const idx=db.games.findIndex(x=>x.id===g.id);
 if(idx>=0)db.games[idx]=saved;else db.games.push(saved);
 db.current=null;resultGameId=saved.id;tab="data";save();render();
 setTimeout(()=>viewGameResult(saved.id),80);
}
function loadGame(id){viewGameResult(id)}
function viewGameResult(id){const g=db.games.find(x=>x.id===id);if(!g)return toast('試合結果が見つかりません');resultGameId=id;tab='data';render();setTimeout(()=>{const el=document.getElementById('gameResultView');if(el)el.scrollIntoView({behavior:'smooth',block:'start'})},0)}
function battingStats(g){
 const stats={};
 const arr=Array.isArray(g.pa)?g.pa:[];
 const ensure=n=>{
   if(!stats[n]) stats[n]={name:n,pa:0,ab:0,h:0,d2:0,d3:0,hr:0,rbi:0,bb:0,hbp:0,so:0,sh:0,sf:0};
   return stats[n];
 };
 arr.forEach(p=>{
   const n=p.batter||'不明',result=p.result||'その他',s=ensure(n);
   s.pa++;
   s.ab++;
   s.rbi+=Number.isFinite(Number(p.rbi))?Number(p.rbi):0;
   switch(result){
     case '四球': s.bb++; break;
     case '死球': s.hbp++; break;
     case '犠打': s.sh++; break;
     case '犠飛': s.sf++; break;
     default:
       if(result==='単打') s.h++;
       else if(result==='二塁打'){s.h++;s.d2++;}
       else if(result==='三塁打'){s.h++;s.d3++;}
       else if(result==='本塁打'){s.h++;s.hr++;}
       else if(result==='三振') s.so++;
       break;
   }
 });
 return Object.values(stats);
}
function resultEvents(g){
 const events=[...(g.pa||[]).map(x=>({seq:Number(x.seq)||0,inning:x.inning,half:x.half,text:`${x.batter} → ${x.result}${x.runs?`・${x.runs}点`:''}`,kind:'打席'})),...(g.runnerMoves||[]).map(x=>({seq:Number(x.seq)||0,inning:x.inning,half:x.half,text:`${x.type}${x.judgement?`・${x.judgement}`:''}：${x.name||'走者'}${x.dest===4?' → 本塁・得点':x.dest?` → ${x.dest}塁`:''}${x.runs?`・${x.runs}点`:''}`,kind:'走者'}))];
 events.sort((a,b)=>a.seq-b.seq || a.inning-b.inning || (a.half==='表'?0:1)-(b.half==='表'?0:1));
 return events;
}
function resultInningRows(g){
 const max=Math.max(1,g.innings?.length||0,Math.ceil((g.pa||[]).reduce((m,p)=>Math.max(m,Number(p.inning)||1),0)));
 let rows='';for(let i=1;i<=max;i++){const x=g.innings?.[i-1]||{us:0,opp:0};rows+=`<tr><td>${i}</td><td>${Number(x.us)||0}</td><td>${Number(x.opp)||0}</td><td>${i===max&&g.finished?'—':''}</td></tr>`}return rows;
}
function renderGameResult(g){
 const win=g.scoreUs>g.scoreOpp?'勝利':g.scoreUs<g.scoreOpp?'敗戦':'引き分け';
 const stats=battingStats(g),events=resultEvents(g);
 const batting=stats.length?`<div class="resultStatsWrap"><table class="resultStatsTable"><thead><tr><th>選手</th><th>打席</th><th>打数</th><th>安打</th><th>二塁打</th><th>三塁打</th><th>本塁打</th><th>打点</th><th>四球</th><th>死球</th><th>三振</th><th>犠打</th><th>犠飛</th><th>打率</th></tr></thead><tbody>${stats.map(s=>`<tr><td>${esc(s.name)}</td><td>${s.pa}</td><td>${s.ab}</td><td>${s.h}</td><td>${s.d2}</td><td>${s.d3}</td><td>${s.hr}</td><td>${s.rbi}</td><td>${s.bb}</td><td>${s.hbp}</td><td>${s.so}</td><td>${s.sh}</td><td>${s.sf}</td><td class="avg">${s.ab?(s.h/s.ab).toFixed(3).replace(/^0/,''):'.000'}</td></tr>`).join('')}</tbody></table></div>`:`<div class="empty">打席記録はありません</div>`;
 const max=Math.max(1,g.innings?.length||0);
 const board=`<div class="stadiumBoard"><table><thead><tr><th>チーム</th>${Array.from({length:max},(_,i)=>`<th>${i+1}</th>`).join('')}<th class="total">R</th></tr></thead><tbody><tr><th>${esc(db.team.name)}</th>${Array.from({length:max},(_,i)=>{const n=Number(g.innings?.[i]?.us)||0;return `<td class="${n===0?'zero':''}">${n}</td>`}).join('')}<td class="total">${Number(g.scoreUs)||0}</td></tr><tr><th>${esc(g.opponent||'相手')}</th>${Array.from({length:max},(_,i)=>{const n=Number(g.innings?.[i]?.opp)||0;return `<td class="${n===0?'zero':''}">${n}</td>`}).join('')}<td class="total">${Number(g.scoreOpp)||0}</td></tr></tbody></table></div>`;
 let eventHtml='';
 if(events.length){
   let lastInning=null;
   const groups=[];
   events.forEach(e=>{const key=Number(e.inning)||1;if(key!==lastInning){groups.push({inning:key,items:[]});lastInning=key;}groups[groups.length-1].items.push(e);});
   eventHtml=groups.map(gr=>`<div class="eventGroup"><div class="eventGroupTitle">${gr.inning}回<span>試合経過</span></div>${gr.items.map(e=>`<div class="eventRow"><div class="eventTop"><b>${e.inning}回${e.half}　${esc(e.text)}</b><span class="eventTag">${e.kind}</span></div></div>`).join('')}</div>`).join('');
 }else eventHtml='<div class="empty">記録がありません</div>';
 return `<div id="gameResultView"><div class="resultHero"><div class="muted">${esc(g.date||'')}　${esc(g.tournament||'')}</div><div class="resultWin">${win}</div><div class="team">${esc(db.team.name)}　vs　${esc(g.opponent||'相手校')}</div><div class="resultScore">${g.scoreUs} - ${g.scoreOpp}</div><div class="muted">${esc(g.stadium||'')}　${g.finishedAt?new Date(g.finishedAt).toLocaleString('ja-JP'):''}</div></div>
 <div class="card"><div class="title">結果を保存・共有</div><div class="resultTools"><button class="resultTool primary" onclick="saveResultImage(${g.id})">📷 写真として保存</button><button class="resultTool" onclick="shareGameResult(${g.id})">📤 SNS・共有</button></div><p class="shareNote">保存する写真も、球場の得点板をイメージした見やすいレイアウトになります。</p><div class="shareVisual"><div class="shareStep"><span class="shareIcon">①📷</span><b>写真として保存</b><span>結果画像をスマホに保存</span></div><div class="shareStep"><span class="shareIcon">②📤</span><b>共有ボタン</b><span>「SNS・共有」をタップ</span></div><div class="shareStep"><span class="shareIcon">③📱</span><b>送信先を選択</b><span>LINE・SNSなど</span></div></div></div>
 <div class="card"><div class="title">イニング別スコア</div>${board}</div>
 <div class="card"><div class="title">打撃成績</div>${batting}</div>
 <div class="card"><div class="title">試合経過・全記録</div><div class="eventList">${eventHtml}</div></div>
 <button class="btn resultBack" onclick="resultGameId=null;render()">← 試合データへ戻る</button></div>`;
}
function dataView(){
 let games=db.games.slice().reverse();
 if(resultGameId){const g=db.games.find(x=>x.id===resultGameId);if(g)return `<div class="content">${renderGameResult(g)}</div>`;resultGameId=null;}
 return `<div class="card"><div class="title">試合データ</div><div class="statgrid"><div class="stat"><b>${games.length}</b><span class="muted">試合</span></div><div class="stat"><b>${games.filter(g=>g.scoreUs>g.scoreOpp).length}</b><span class="muted">勝利</span></div><div class="stat"><b>${games.reduce((a,g)=>a+g.scoreUs,0)}</b><span class="muted">総得点</span></div><div class="stat"><b>${db.team.players.length}</b><span class="muted">登録選手</span></div></div></div>
 ${games.length?games.map(g=>`<div class="card"><div class="row between"><div><b>${esc(g.date)}　${esc(db.team.name)} ${g.scoreUs}-${g.scoreOpp} ${esc(g.opponent)}</b><div class="muted">${esc(g.tournament||"")} ${esc(g.stadium||"")}</div></div><div class="row"><button class="btn small" onclick="viewGameResult(${g.id})">結果を見る</button><button class="btn small red" onclick="deleteGame(${g.id})">削除</button></div></div></div>`).join(""):`<div class="card empty">試合終了すると、ここに試合結果が残ります。</div>`}
 <div class="card"><div class="title">データ管理</div><div class="row"><button class="btn" onclick="exportData()">バックアップ保存</button><button class="btn red" onclick="deleteSelectedData()">不要な試合データを選んで削除</button></div><p class="muted">試合ごとに削除できます。チーム名簿などの必要な設定データは残ります。全データを消したい場合は「全データ削除」から実行できます。</p><button class="btn red" style="width:100%;margin-top:8px" onclick="resetAll()">全データ削除</button></div>`;
}
function resultCanvas(g){
 const W=1600, events=resultEvents(g), stats=battingStats(g), max=Math.max(1,g.innings?.length||0);
 const font='-apple-system,BlinkMacSystemFont,"Noto Sans JP",sans-serif';
 const H=Math.min(2200,980+Math.ceil(stats.length/9)*250+Math.ceil(events.length/10)*250);
 const c=document.createElement('canvas');c.width=W;c.height=H;const ctx=c.getContext('2d');
 const bg='#070d16',panel='#0e1826',panel2='#121f31',line='#2a3d57',text='#f5f7fb',muted='#8fa2bd',accent='#4d8dff';
 ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
 // top sports-card header
 ctx.fillStyle=accent;ctx.fillRect(0,0,W,10);
 ctx.fillStyle=text;ctx.textAlign='left';ctx.font=`900 34px ${font}`;ctx.fillText('野球メモ',70,72);
 ctx.fillStyle=muted;ctx.font=`700 18px ${font}`;ctx.fillText(`${g.date||''}  ${g.tournament||''}  ${g.stadium||''}`,70,104);
 ctx.textAlign='right';ctx.fillStyle=muted;ctx.font=`800 16px ${font}`;ctx.fillText('GAME RESULT',W-70,72);
 // score hero
 const heroY=135, heroH=250;
 ctx.fillStyle=panel;ctx.fillRect(60,heroY,W-120,heroH);
 ctx.strokeStyle=line;ctx.lineWidth=2;ctx.strokeRect(60,heroY,W-120,heroH);
 ctx.textAlign='center';ctx.fillStyle=muted;ctx.font=`800 15px ${font}`;ctx.fillText('FINAL',W/2,heroY+38);
 ctx.fillStyle=text;ctx.font=`900 28px ${font}`;ctx.fillText(db.team.name,W/2-260,heroY+94);
 ctx.fillStyle=muted;ctx.font=`800 20px ${font}`;ctx.fillText('VS',W/2,heroY+94);
 ctx.fillStyle=text;ctx.fillText(g.opponent||'相手校',W/2+260,heroY+94);
 ctx.fillStyle=text;ctx.font=`950 92px ${font}`;ctx.fillText(`${g.scoreUs}  -  ${g.scoreOpp}`,W/2,heroY+185);
 const result=g.scoreUs>g.scoreOpp?'WIN':g.scoreUs<g.scoreOpp?'LOSS':'DRAW';
 ctx.fillStyle=result==='WIN'?'#dff7e8':result==='LOSS'?'#ffdfe2':'#e8eef8';ctx.font=`950 18px ${font}`;ctx.fillText(result,W/2,heroY+224);
 let y=heroY+heroH+38;
 // scoreboard panel
 ctx.textAlign='left';ctx.fillStyle=text;ctx.font=`900 25px ${font}`;ctx.fillText('SCOREBOARD',70,y);y+=18;
 const left=70, top=y, rowH=62, teamW=330, totalW=92, usable=W-left*2-teamW-totalW;
 const cellW=Math.max(70,Math.min(105,usable/max));
 const drawCell=(x,yy,w,h,val,bold=false,fill=panel2)=>{ctx.fillStyle=fill;ctx.fillRect(x,yy,w,h);ctx.strokeStyle=line;ctx.lineWidth=1;ctx.strokeRect(x,yy,w,h);ctx.fillStyle=text;ctx.font=`${bold?'900':'750'} ${bold?22:20}px ${font}`;ctx.textAlign='center';ctx.fillText(String(val),x+w/2,yy+h/2+7)};
 drawCell(left,top,teamW,rowH,'TEAM',true,'#1a2a41');
 for(let i=0;i<max;i++)drawCell(left+teamW+i*cellW,top,cellW,rowH,i+1,true,'#1a2a41');
 drawCell(left+teamW+max*cellW,top,totalW,rowH,'R',true,'#243b5d');
 [[db.team.name,'us',g.scoreUs],[g.opponent||'相手','opp',g.scoreOpp]].forEach((r,ri)=>{const yy=top+rowH*(ri+1);drawCell(left,yy,teamW,rowH,r[0],true,panel);for(let i=0;i<max;i++)drawCell(left+teamW+i*cellW,yy,cellW,rowH,Number(g.innings?.[i]?.[r[1]])||0,false,panel);drawCell(left+teamW+max*cellW,yy,totalW,rowH,r[2],true,'#243b5d');});
 y=top+rowH*3+38;
 // key numbers
 const totalAB=stats.reduce((a,s)=>a+s.ab,0), totalH=stats.reduce((a,s)=>a+s.h,0), totalRBI=stats.reduce((a,s)=>a+s.rbi,0);
 ctx.fillStyle=text;ctx.font=`900 25px ${font}`;ctx.textAlign='left';ctx.fillText('TEAM HIGHLIGHTS',70,y);y+=34;
 const kw=470, kh=88;[['H',totalH],['AB',totalAB],['RBI',totalRBI]].forEach((k,i)=>{const x=70+i*(kw+35);ctx.fillStyle=panel;ctx.fillRect(x,y,kw,kh);ctx.strokeStyle=line;ctx.strokeRect(x,y,kw,kh);ctx.fillStyle=muted;ctx.font=`800 15px ${font}`;ctx.fillText(k[0],x+22,y+30);ctx.fillStyle=text;ctx.font=`950 32px ${font}`;ctx.fillText(k[1],x+22,y+65);});
 y+=kh+38;
 // batting stats as wide modern table
 ctx.fillStyle=text;ctx.font=`900 25px ${font}`;ctx.fillText('BATTING',70,y);y+=32;
 const cols=[['選手',300],['PA',70],['AB',70],['H',70],['2B',70],['3B',70],['HR',70],['RBI',80],['BB',70],['HBP',70],['SO',70],['SH',70],['SF',70],['AVG',95]];
 let x=70;cols.forEach(([lab,w])=>{drawCell(x,y,w,42,lab,true,'#1a2a41');x+=w;});
 stats.forEach((s,ri)=>{y+=42;x=70;const vals=[s.name,s.pa,s.ab,s.h,s.d2,s.d3,s.hr,s.rbi,s.bb,s.hbp,s.so,s.sh,s.sf,s.ab?(s.h/s.ab).toFixed(3).replace(/^0/,''):'.000'];cols.forEach(([_,w],i)=>{drawCell(x,y,w,42,vals[i],i===0||i===13, i===0?panel:(ri%2?panel:'#0b1422'));x+=w;});});
 y+=60;
 // compact play-by-play in two columns
 ctx.fillStyle=text;ctx.font=`900 25px ${font}`;ctx.textAlign='left';ctx.fillText('PLAY-BY-PLAY',70,y);y+=34;
 const half=Math.ceil(events.length/2), colW=(W-170)/2;
 const drawEvents=(list,ox)=>{let yy=y;let last=null;list.forEach(e=>{if(e.inning!==last){ctx.fillStyle=accent;ctx.fillRect(ox,yy,colW,3);yy+=18;ctx.fillStyle=muted;ctx.font=`900 16px ${font}`;ctx.fillText(`${e.inning}回`,ox,yy);yy+=20;last=e.inning;}ctx.fillStyle=panel;ctx.fillRect(ox,yy,colW,58);ctx.fillStyle=line;ctx.strokeStyle=line;ctx.strokeRect(ox,yy,colW,58);ctx.fillStyle='#9fc3ff';ctx.font=`900 14px ${font}`;ctx.fillText(`${e.half}`,ox+16,yy+22);ctx.fillStyle=text;ctx.font=`700 16px ${font}`;let tx=`${e.text}`;if(tx.length>43)tx=tx.slice(0,42)+'…';ctx.fillText(tx,ox+52,yy+22);ctx.fillStyle=muted;ctx.font=`600 12px ${font}`;ctx.fillText(e.kind||'',ox+52,yy+43);yy+=68;});return yy;};
 const y1=drawEvents(events.slice(0,half),70), y2=drawEvents(events.slice(half),70+colW+30); y=Math.max(y1,y2)+35;
 ctx.fillStyle=muted;ctx.font=`600 15px ${font}`;ctx.fillText('野球メモ  •  観戦しながら、思い出を残そう。',70,H-28);
 return c;
}
async function saveResultImage(id){const g=db.games.find(x=>x.id===id);if(!g)return;try{const c=resultCanvas(g);const blob=await new Promise(r=>c.toBlob(r,'image/png'));if(!blob)return toast('画像作成に失敗しました');const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`野球メモ_${g.date||'試合結果'}_${g.opponent||'相手'}.png`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('試合結果画像を保存しました')}catch(e){toast('画像保存に失敗しました')}}
async function shareGameResult(id){const g=db.games.find(x=>x.id===id);if(!g)return;const text=`${g.date||''} 野球メモ\n${db.team.name} ${g.scoreUs}-${g.scoreOpp} ${g.opponent||'相手校'}\n試合結果・打撃成績・試合経過を記録しました。`;try{const c=resultCanvas(g);const blob=await new Promise(r=>c.toBlob(r,'image/png'));const file=blob?new File([blob],`野球メモ_${g.date||'試合結果'}.png`,{type:'image/png'}):null;if(navigator.share){if(file && (!navigator.canShare || navigator.canShare({files:[file]}))){await navigator.share({title:'野球メモ 試合結果',text,files:[file]})}else{await navigator.share({title:'野球メモ 試合結果',text})}toast('共有しました')}else{await navigator.clipboard?.writeText(text);toast('共有機能がないため、結果文をコピーしました')}}catch(e){if(e?.name!=='AbortError')toast('共有をキャンセルしました')}}
function exportData(){let blob=new Blob([JSON.stringify(db,null,2)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="野球メモ_バックアップ.json";a.click();URL.revokeObjectURL(a.href)}
function deleteGame(id){
 const g=db.games.find(x=>x.id===id); if(!g)return;
 if(!confirm(`${g.date||''} ${g.opponent||'相手校'} の試合データを削除しますか？\nこの試合だけを削除し、チーム名簿や他の試合は残します。`))return;
 db.games=db.games.filter(x=>x.id!==id);
 if(resultGameId===id)resultGameId=null;
 save();render();toast('試合データを削除しました');
}
function deleteSelectedData(){
 const games=db.games.slice().reverse(); if(!games.length)return toast('削除できる試合データがありません');
 const lines=games.map((g,i)=>`${i+1}. ${g.date||'日付なし'} ${g.opponent||'相手校'} ${g.scoreUs}-${g.scoreOpp}`).join('\n');
 const answer=prompt(`削除する試合の番号を入力してください。\n複数はカンマ区切り（例：1,3）\n\n${lines}`);
 if(answer==null)return;
 const nums=answer.split(',').map(x=>Number(x.trim())).filter(Number.isInteger).filter(n=>n>=1&&n<=games.length);
 const ids=[...new Set(nums.map(n=>games[n-1].id))]; if(!ids.length)return toast('削除対象が選択されていません');
 if(!confirm(`${ids.length}試合を削除しますか？\nチーム名簿などの設定データは残ります。`))return;
 db.games=db.games.filter(g=>!ids.includes(g.id));
 if(resultGameId!=null && ids.includes(resultGameId))resultGameId=null;
 save();render();toast(`${ids.length}試合を削除しました`);
}
function resetAll(){if(!confirm("全データを削除します。よろしいですか？"))return;localStorage.removeItem(KEY);location.reload()}
function render(){
 document.querySelectorAll(".tab").forEach(b=>b.classList.toggle("active",b.dataset.tab===tab));
 document.getElementById("app").innerHTML=tab==="record"?recordView():tab==="team"?teamView():tab==="lineup"?lineupView():dataView();
}
document.querySelectorAll(".tab").forEach(b=>b.onclick=()=>{tab=b.dataset.tab;render()});
if("serviceWorker"in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("sw.js"));
render();

let inGameSubType='代打',inGameSubSlot=null;
function openInGameSub(){let g=db.current;if(!g||!g.lineup.length)return;inGameSubSlot=g.batterIndex%9;let cur=g.lineup[inGameSubSlot];document.getElementById('subTargetLabel').textContent=`${inGameSubSlot+1}番 ${cur?.name||''} を交代`;setSubType('代打');document.getElementById('inGameSubModal').style.display='flex';}
function closeInGameSub(){document.getElementById('inGameSubModal').style.display='none';inGameSubSlot=null}
function setSubType(t){inGameSubType=t;['PH','PR','DF'].forEach(x=>document.getElementById('subType'+x)?.classList.remove('active'));let id=t==='代打'?'PH':t==='代走'?'PR':'DF';document.getElementById('subType'+id)?.classList.add('active');refreshSubReplacement()}
function refreshSubReplacement(){let sel=document.getElementById('subReplacement');if(!sel||!db.current)return;let active=new Set((db.current.lineup||[]).map(p=>p?.name));let roster=(db.team.players||[]).filter(p=>!active.has(p.name));sel.innerHTML=roster.map(p=>`<option value="${esc(p.name)}">${esc(p.name)}${p.num?' #'+p.num:''}</option>`).join('')}
function applyInGameSub(){let g=db.current;if(!g||inGameSubSlot==null)return;let name=document.getElementById('subReplacement').value,replacement=db.team.players.find(p=>p.name===name);if(!replacement)return;let before=g.lineup[inGameSubSlot];g.subs=g.subs||[];g.subs.push({time:new Date().toISOString(),type:inGameSubType,slot:inGameSubSlot,from:before,to:replacement});g.lineup[inGameSubSlot]=Object.assign({},replacement,{pos:before?.pos||''});save();closeInGameSub();render();toast(`${inGameSubType}：${replacement.name}`)}

let gameOrder = '先攻';

function setGameOrder(order){
  gameOrder=order;
  document.getElementById('orderAway')?.classList.toggle('active', order==='先攻');
  document.getElementById('orderHome')?.classList.toggle('active', order==='後攻');
  const h=document.getElementById('orderHint');
  if(h) h.textContent = order==='先攻'
    ? '自チームが先攻。1回表から開始します。'
    : '自チームが後攻。1回裏から開始します。';
}

function pushGameHistory(){
  try{
    if(db.current) gameHistory.push(JSON.stringify(db.current));
    if(gameHistory.length>30) gameHistory.shift();
  }catch(e){}
}

function undoGame(){
  if(!gameHistory.length) return toast('戻せる操作がありません');
  try{
    db.current=JSON.parse(gameHistory.pop());
    save(); render(); toast('直前の操作を取り消しました');
  }catch(e){ toast('取り消しに失敗しました'); }
}

function addGameBackButton(){
  if(document.getElementById('gameBackBtn')) return;
  const b=document.createElement('button');
  b.id='gameBackBtn'; b.className='backGameBtn'; b.textContent='↩ 戻る';
  b.onclick=undoGame;
  document.body.appendChild(b);
}

window.addEventListener('popstate', function(){
  if(gameHistory.length){
    undoGame();
  }
});

function recordGameActionWithHistory(fn){
  pushGameHistory();
  fn();
  history.pushState({game:true}, '');
}

let deferredInstallPrompt = null;

function hasSavedGame(){
  try{
    const data = (typeof db !== 'undefined') ? db : JSON.parse(localStorage.getItem(KEY)||'null');
    return !!(data && data.current && !data.current.finished);
  }catch(e){ return false; }
}

function showLaunchScreen(){
  const ls=document.getElementById('launchScreen');
  if(!ls) return;
  ls.style.display='flex';
  const cb=document.getElementById('continueGameBtn');
  if(cb) cb.style.display=hasSavedGame()?'block':'none';
  const area=document.getElementById('installArea');
  if(area && !window.matchMedia('(display-mode: standalone)').matches){
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const btn=document.getElementById('homeInstallBtn');
    const guide=document.getElementById('installGuide');
    if(btn) btn.style.display = ios ? 'block' : (deferredInstallPrompt ? 'block' : 'none');
    if(guide){
      guide.textContent = ios
        ? 'iPhoneはSafariの共有ボタン →「ホーム画面に追加」で登録できます。'
        : 'Androidは「ホーム画面に追加」または「アプリをインストール」から登録できます。';
    }
  }
}

function hideLaunchScreen(){
  const ls=document.getElementById('launchScreen');
  if(ls) ls.style.display='none';
}

function startNewFromLaunch(){ hideLaunchScreen(); newGameSetup(); }

function continueFromLaunch(){
  try{
    if(typeof db !== 'undefined' && db.current){
      tab='record';
      render();
    }
  }catch(e){}
  hideLaunchScreen();
}

window.addEventListener('beforeinstallprompt', e=>{
  e.preventDefault();
  deferredInstallPrompt=e;
  const btn=document.getElementById('homeInstallBtn');
  const guide=document.getElementById('installGuide');
  if(btn) btn.style.display='block';
  if(guide) guide.textContent='タップするとホーム画面への追加を開始します。';
});

async function installPWA(){
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  if(isStandalone) return;
  if(ios){
    alert('iPhone / iPad\n\n① Safariの「共有」ボタンをタップ\n② 「ホーム画面に追加」をタップ\n③ 右上の「追加」をタップ\n\n※ iPhoneではSafariから追加してください。');
    return;
  }
  if(deferredInstallPrompt){
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt=null;
    return;
  }
  const guide=document.getElementById('installGuide');
  if(guide) guide.textContent='ブラウザのメニュー（⋮）から「ホーム画面に追加」または「アプリをインストール」を選択してください。';
}

window.addEventListener('appinstalled', ()=>{
  deferredInstallPrompt=null;
  const btn=document.getElementById('homeInstallBtn');
  const guide=document.getElementById('installGuide');
  if(btn) btn.style.display='none';
  if(guide) guide.textContent='ホーム画面に追加済みです。アイコンからいつでも起動できます。';
});

document.addEventListener('DOMContentLoaded', ()=>{
  setTimeout(()=>{
    showLaunchScreen();
    const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    const btn=document.getElementById('homeInstallBtn');
    const guide=document.getElementById('installGuide');
    if(standalone){
      if(btn) btn.style.display='none';
      if(guide) guide.textContent='ホーム画面から起動中です。';
    }
  }, 0);
});
