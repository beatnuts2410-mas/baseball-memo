<script id="v30314-runtime-patch">
(function(){
'use strict';
var UNIFORM='__UNIFORM__';
function escSafe(v){return typeof esc==='function'?esc(v):String(v==null?'':v)}
function displaySafe(v){return typeof displayPlayerName==='function'?displayPlayerName(v):String(v||'')}
var oldSelectPAResult=window.selectPAResult;
window.selectPAResult=function(result){
 if(['内野ゴロ','ライナー','内野フライ'].indexOf(result)>=0){
  var el=document.getElementById('battedBallDirectionModal');
  if(!el||typeof window.pa!=='function')return oldSelectPAResult?oldSelectPAResult(result):window.pa(result);
  document.getElementById('battedBallDirectionTitle').textContent=result+'：打球方向・種類を選択してください。';
  document.getElementById('battedBallDirectionTarget').textContent='どの方向・どの種類の打球かを選択してください。';
  var dirs=result==='内野ゴロ'?['ピッチャー前','1塁','2塁','3塁','ショート']:['ピッチャー','1塁','2塁','3塁','ショート'];
  var disp=function(d){return({'1塁':'ファースト','2塁':'セカンド','3塁':'サード','ショート':'ショート'})[d]||d};
  document.getElementById('battedBallDirectionGrid').innerHTML=dirs.map(function(d){return '<button type="button" class="directionBtn" onclick="selectBattedBallDirection(\\''+d.replace(/'/g,"\\\\'")+ '\\')">'+disp(d)+'</button>'}).join('');
  el.style.display='flex';return;
 }
 return oldSelectPAResult?oldSelectPAResult(result):window.pa(result);
};
function fixStealLabel(){document.querySelectorAll('*').forEach(function(el){if(el.children.length===0&&(el.textContent||'').trim()==='③ 進塁先を確認してください。')el.textContent='③ 選択した走者ごとに、進塁先を選択してください。'})}
var style=document.createElement('style');style.id='v30314-runtime-styles';style.textContent=`
#stealStepDestList .stealMultiDestGrid button[data-dest="2"],#stealStepDestList .stealMultiDestGrid button[data-dest="3"],#stealStepDestList .stealMultiDestGrid button[data-dest="4"]{min-height:64px!important;padding:16px 24px!important;font-size:1.15em!important}
#launchScreen.homePhotoLaunch .launchActions{transform:translateY(-60px)!important}
.v30310-full-record-separator{border-bottom:1px solid #999!important;padding-bottom:8px!important;margin-bottom:10px!important}
#gameResultView .eventList{display:flex!important;flex-direction:column!important;gap:0!important}
#gameResultView .eventList .eventGroup{margin-top:12px!important}#gameResultView .eventList .eventGroup:first-child{margin-top:0!important}
#gameResultView .eventList .eventGroupTitle{padding:8px 4px 7px!important;margin-bottom:0!important;border-bottom:2px solid #58708f!important;font-size:15px!important;line-height:1.3!important}
#gameResultView .eventList .eventRow{background:transparent!important;border:0!important;border-bottom:1px solid #cfd7e2!important;border-radius:0!important;padding:9px 4px!important;margin:0!important;min-height:0!important;font-size:13px!important;line-height:1.45!important}
#gameResultView .eventList .eventRow:last-child{border-bottom:0!important}
#gameResultView .commentaryList{display:flex!important;flex-direction:column!important;gap:0!important}
#gameResultView .commentaryList .commentaryLine{background:transparent!important;border:0!important;border-bottom:1px solid #cfd7e2!important;border-radius:0!important;padding:9px 4px!important;margin:0!important;font-size:13px!important;line-height:1.5!important}
#gameResultView .commentaryList .commentaryLine:last-child{border-bottom:0!important}
@media(max-width:430px){#gameResultView .eventList .eventRow,#gameResultView .commentaryList .commentaryLine{padding:8px 3px!important;font-size:12px!important;line-height:1.45!important}}
img[src*="nishiharu_uniform"],img.nishiharuUniform,img[alt*="西春"]{transform:scale(1.15);transform-origin:center center}
`;
document.head.appendChild(style);
window.build実況Text=function(e){var raw=String(e&&e.text||'').replace(/\s+/g,' ').trim();if(!raw)return'プレーが記録されました。';var runnerPart=raw.indexOf(' ｜ ')>=0?raw.split(' ｜ ').slice(1).join(' ｜ '):'',main=raw.split(' ｜ ')[0],m=main.match(/^(?:\d+番\s*)?(?:◆\s*)?(.+?)(?:\s*（[^）]+）)?\s*→\s*(.+)$/),parsedPlayer=m?m[1].replace(/^◆\s*/,'').trim():'',explicitPlayer=displaySafe(e&&e.batter),player=(explicitPlayer&&['打者','不明'].indexOf(explicitPlayer)<0)?explicitPlayer:parsedPlayer,result=(e&&e.kind==='打席'&&e.result)?String(e.result).trim():(m?m[2].trim():main),who=player||'打者',orderNum=Number(e&&e.batterOrder)||0,displayWho=(e&&e.kind==='打席'&&orderNum>0?orderNum+'番　':'')+who,lead='';
if(/本塁打/.test(result))lead=displayWho+'、打った！ホームラン！';else if(/三塁打/.test(result))lead=displayWho+'、三塁打！一気に三塁まで到達！';else if(/二塁打/.test(result))lead=displayWho+'、二塁打！鋭い打球で二塁へ！';else if(/シングルヒット|単打/.test(result))lead=displayWho+'、シングルヒット！まずは出塁！';else if(/四球/.test(result))lead=displayWho+'、四球を選んで出塁！';else if(/死球/.test(result))lead=displayWho+'、死球で出塁！';else if(/振り逃げ/.test(result))lead=displayWho+'、振り逃げ！';else if(/三振/.test(result))lead=displayWho+'、三振！ここは打ち取られました。';else if(/犠飛/.test(result))lead=displayWho+'、犠牲フライ！走者をホームへ返します！';else if(/犠打|バント/.test(result))lead=displayWho+'、バント！走者を進めるプレーです。';else if(/エラー/.test(result))lead=displayWho+'、相手のエラーを誘って出塁！';else if(/ゴロ/.test(result))lead=displayWho+'、ゴロ！';else if(/ライナー/.test(result))lead=displayWho+'、鋭いライナー！';else if(/フライ/.test(result))lead=displayWho+'、フライに打ち取られました。';else lead=displayWho+'、'+result+'！';if(/\d+点/.test(main)||/本塁打/.test(result))lead+=' 得点が動きます！';if(Number(e&&e.runs)||0)lead+=' 【ホームイン：'+(Number(e.runs)||0)+'点追加】';if(runnerPart)lead+=' '+runnerPart.replace(/盗塁：/g,'盗塁！').replace(/：/g,'、');if(/走者/.test(e&&e.kind||'')&&!m){if(/盗塁/.test(raw))return raw.indexOf('アウト')>=0?'盗塁を仕掛ける！'+raw:'盗塁！'+raw;if(/暴投/.test(raw))return'暴投！走者が動きます。'+raw;if(/パスボール/.test(raw))return'捕逸！走者が進みます。'+raw;if(/ボーク/.test(raw))return'ボーク！走者が進みます。'+raw}return lead};
window.buildResultCommentary=function(g,events){var own=String(g.sourceTeamName||g.sharedTeamName||db.team.name||'自チーム'),opp=String(g.opponent||g.opponentTeamName||g.sharedOpponentName||'相手校'),chunks=['<div class="commentaryLine">'+escSafe('【試合開始】'+own+' 対 '+opp+'。')+'</div>'],lineup=(g.initialLineup||g.lineup||[]).slice(0,9).map(function(p,i){return p&&p.name?(i+1)+'番 '+displaySafe(p):''}).filter(Boolean);if(lineup.length)chunks.push('<div class="commentaryLine">'+escSafe('【スターティングメンバー】'+lineup.join('、'))+'</div>');var buckets=new Map;(events||[]).forEach(function(e){var key=(Number(e.inning)||1)+'-'+(e.half==='裏'?'裏':'表');if(!buckets.has(key))buckets.set(key,[]);buckets.get(key).push(e)});resultPlayedHalfKeys(g,events).forEach(function(key){var p=key.split('-');(buckets.get(key)||[]).forEach(function(e){chunks.push('<div class="commentaryLine">'+escSafe(window.build実況Text(e))+'</div>')});chunks.push(resultHalfSummaryHtml(g,p[0],p[1]))});if(g.finished){var us=Number(g.scoreUs)||0,op=Number(g.scoreOpp)||0;chunks.push('<div class="commentaryLine">'+escSafe('【試合終了】'+us+'対'+op+'。'+(g.finishReason||(us>op?own+'の勝利':us<op?opp+'の勝利':'引き分け')) )+'</div>')}return chunks.join('')};
function applyFullRecordSeparators(){document.querySelectorAll('body *').forEach(function(el){if(el.children.length!==0||el.dataset.v30314Done==='1')return;var text=(el.textContent||'').trim(),isOut=/^アウト\s*[:：]/.test(text),isAdvance=/^進塁結果\s*[:：]/.test(text);if(!isOut&&!isAdvance)return;var parent=el.parentElement;if(!parent)return;if(isOut){var prev=parent.previousElementSibling,pt=prev?(prev.textContent||''):'';if(pt.indexOf('打席前')<0&&pt.indexOf('打席後')<0)return}el.classList.add('v30310-full-record-separator');el.dataset.v30314Done='1'})}
function fixLabels(){document.querySelectorAll('button,.title,.resultTool,[role="tab"],span,div').forEach(function(el){if(el.children.length===0&&(el.textContent||'').trim()==='全記録')el.textContent='試合全記録'});fixStealLabel();applyFullRecordSeparators()}
function replaceUniform(){document.querySelectorAll('img.nishiharuUniform').forEach(function(x){x.src=UNIFORM})}
var obs=new MutationObserver(function(){fixLabels();replaceUniform()});obs.observe(document.body,{childList:true,subtree:true});fixLabels();replaceUniform();if(typeof window.render==='function'){try{window.render()}catch(e){console.warn('v30314 render patch',e)}}setTimeout(function(){fixLabels();replaceUniform()},100);
})();
</script>
