(function(){
'use strict';
if(window.__v30315Patched)return;window.__v30315Patched=true;
function escSafe(v){return typeof esc==='function'?esc(v):String(v==null?'':v).replace(/[&<>"']/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));}
function nameOf(v){return typeof displayPlayerName==='function'?displayPlayerName(v):String(v?.name||v||'').trim();}
function seasonBattingStats315(games){
 const seasons=new Map();
 (Array.isArray(games)?games:[]).filter(g=>g&&g.finished!==false).forEach(g=>{
  const m=String(g.date||'').match(/(?:^|\D)((?:19|20)\d{2})(?:\D|$)/);const year=m?m[1]:'年度不明';
  if(!seasons.has(year))seasons.set(year,new Map());const players=seasons.get(year);
  let stats=null;try{stats=typeof battingStats==='function'?battingStats(g):null;}catch(e){stats=null;}
  const all=[...(stats?.starters||[]),...(stats?.replacements||[]).map(x=>x?.stat),...(stats?.rest||[])];
  const appeared=new Set();
  all.forEach(s=>{
   if(!s?.name)return;
   if(!players.has(s.name))players.set(s.name,{name:s.name,games:0,pa:0,ab:0,h:0,hr:0,rbi:0,sb:0});
   const t=players.get(s.name);
   if(!appeared.has(s.name)){t.games++;appeared.add(s.name);}
   ['pa','ab','h','hr','rbi'].forEach(k=>t[k]+=Number(s[k])||0);
  });
  (Array.isArray(g.runnerMoves)?g.runnerMoves:[]).forEach(r=>{
   if(r?.type!=='盗塁'||r?.judgement!=='セーフ')return;
   const n=nameOf(r.name);
   if(!n)return;
   if(!players.has(n))players.set(n,{name:n,games:0,pa:0,ab:0,h:0,hr:0,rbi:0,sb:0});
   const t=players.get(n);
   if(!appeared.has(n)){t.games++;appeared.add(n);}
   t.sb++;
  });
 });
 return [...seasons.entries()].sort((a,b)=>b[0].localeCompare(a[0])).map(([year,ps])=>({year,players:[...ps.values()].sort((a,b)=>a.name.localeCompare(b.name,'ja')).map(s=>({...s,avg:s.ab?s.h/s.ab:0}))}));
}
function renderSeason315(games){
 const ss=seasonBattingStats315(games);if(!ss.length)return '';
 return '<div class="card seasonStatsCard315"><div class="title">年度別打者成績</div><p class="muted">試合記録から自動集計。打率は安打÷打数、盗塁は成功記録のみを計上します。</p>'+ss.map(se=>'<div class="seasonStatsSection315"><h3>'+escSafe(se.year)+'年度</h3><div class="resultStatsWrap"><table class="resultStatsTable seasonStatsTable315"><thead><tr><th>選手</th><th>試合</th><th>打席</th><th>打数</th><th>安打</th><th>本塁打</th><th>打点</th><th>盗塁</th><th>打率</th></tr></thead><tbody>'+se.players.map(s=>'<tr><td>'+escSafe(s.name)+'</td><td>'+s.games+'</td><td>'+s.pa+'</td><td>'+s.ab+'</td><td>'+s.h+'</td><td>'+s.hr+'</td><td>'+s.rbi+'</td><td>'+s.sb+'</td><td>'+(s.ab?s.avg.toFixed(3).replace(/^0/,''):'.000')+'</td></tr>').join('')+'</tbody></table></div></div>').join('')+'</div>';
}
if(typeof window.dataView==='function'){
 const oldDataView=window.dataView;
 window.dataView=function(){const html=oldDataView.apply(this,arguments);if(window.sharedGame||window.resultGameId)return html;try{const games=(window.db&&Array.isArray(db.games))?db.games.slice().reverse():[];return renderSeason315(games)+html}catch(e){console.warn('v30315 season patch',e);return html;}};
}
/* Reliable tab routing: delegate click only; avoid touchend+click double firing.
   Keep hit targets limited to the actual tab buttons and do not force a fixed overlay. */
function hardTabSwitch(next){
 const nextTab=String(next||'');
 if(!['record','team','lineup','data'].includes(nextTab))return;
 try{tab=nextTab;}catch(e){window.__v30315Tab=nextTab;}
 if(nextTab==='data'){
  try{resultGameId=null;sharedGame=null;history.replaceState(null,'',location.pathname+location.search);}catch(e){}
 }
 try{render();}catch(e){console.warn('v30315 tab switch',e);}
}
function installTabGuard(){
 if(window.__v30315TabGuardInstalled)return;
 window.__v30315TabGuardInstalled=true;
 document.addEventListener('click',function(ev){
  const b=ev.target?.closest?.('.tabs .tab[data-tab]');
  if(!b)return;
  const next=b.dataset.tab;
  if(!['record','team','lineup','data'].includes(next))return;
  ev.preventDefault();
  ev.stopImmediatePropagation();
  hardTabSwitch(next);
 },true);
}
installTabGuard();

const style=document.createElement('style');style.textContent='.seasonStatsCard315{margin-bottom:12px}.seasonStatsSection315{margin-top:12px}.seasonStatsSection315 h3{margin:0 0 8px;font-size:16px}.seasonStatsTable315{min-width:760px}.seasonStatsTable315 th,.seasonStatsTable315 td{white-space:nowrap}.seasonStatsTable315 td{text-align:center}.seasonStatsTable315 td:first-child,.seasonStatsTable315 th:first-child{text-align:left;position:sticky;left:0;background:#fff;z-index:2}.seasonStatsTable315 th{position:sticky;top:0;z-index:3}';document.head.appendChild(style);

/* Restore the original Home control: return to the main recording screen. */
function installHomeGuard(){
 if(window.__v30315HomeGuardInstalled)return;
 window.__v30315HomeGuardInstalled=true;
 function handleHome(ev){
  const el=ev.target?.closest?.('button,a,[role="button"],[data-action],[data-tab]');
  if(!el)return;
  if(el.closest?.('.tabs .tab[data-tab]'))return;
  const label=String(el.getAttribute('aria-label')||el.getAttribute('title')||el.dataset?.action||el.textContent||'').replace(/\\s+/g,'').toLowerCase();
  const isHome=label==='ホーム'||label.includes('ホームに戻る')||label.includes('ホームへ戻る')||label==='home'||label.includes('gohome')||el.dataset?.action==='home';
  if(!isHome)return;
  ev.preventDefault();
  ev.stopImmediatePropagation();
  hardTabSwitch('record');
 }
 document.addEventListener('click',handleHome,true);
 document.addEventListener('touchend',function(ev){
  const el=ev.target?.closest?.('button,a,[role="button"],[data-action],[data-tab]');
  if(!el)return;
  const label=String(el.getAttribute('aria-label')||el.getAttribute('title')||el.dataset?.action||el.textContent||'').replace(/\\s+/g,'').toLowerCase();
  const isHome=label==='ホーム'||label.includes('ホームに戻る')||label.includes('ホームへ戻る')||label==='home'||label.includes('gohome')||el.dataset?.action==='home';
  if(!isHome||el.closest?.('.tabs .tab[data-tab]'))return;
  ev.preventDefault();
  ev.stopImmediatePropagation();
  hardTabSwitch('record');
 },{capture:true,passive:false});
}
installHomeGuard();

})();