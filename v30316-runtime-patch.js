(function(){
'use strict';
if(window.__v30316OpponentPatch)return;
window.__v30316OpponentPatch=true;
function norm(v){return String(v||'').replace(/\s+/g,'').toLowerCase();}
function findPanel(){
 const nodes=[...document.querySelectorAll('div,section,article')];
 return nodes.find(el=>{const t=norm(el.textContent);return t.includes('相手は何点入りましたか？')&&t.includes('相手のアウト');})||nodes.find(el=>norm(el.textContent).includes('相手は何点入りましたか？'));
}
function btnByText(root,text){return [...root.querySelectorAll('button')].find(b=>norm(b.textContent)===norm(text));}
function makeBtn(text,cls){const b=document.createElement('button');b.type='button';b.className='v30316-btn '+(cls||'');b.textContent=text;return b;}
function clickScore(root,n){const b=btnByText(root,String(Math.max(0,Math.min(9,n))));if(b)b.click();}
function decorate(){
 const panel=findPanel();if(!panel)return false;if(panel.dataset.v30316==='1')return true;panel.dataset.v30316='1';panel.classList.add('v30316-opponent-panel');
 const original=[...panel.querySelectorAll('button')];
 const scoreBtns=original.filter(b=>/^[0-9]$/.test(b.textContent.trim()));
 const scoreRow=scoreBtns.length?scoreBtns[0].parentElement:null;
 const outPlus=btnByText(panel,'アウト+1'),outFix=btnByText(panel,'アウト修正'),pitcher=btnByText(panel,'投手交代');
 const defense=btnByText(panel,'🧤自チームの守備交代')||[...panel.querySelectorAll('button')].find(b=>norm(b.textContent).includes('自チームの守備交代'));
 const top=document.createElement('div');top.className='v30316-topline';top.innerHTML='<div class="v30316-title">相手攻撃</div><div class="v30316-note">得点・アウトをその場で調整</div>';panel.prepend(top);
 const scoreSection=document.createElement('div');scoreSection.className='v30316-section';scoreSection.innerHTML='<div class="v30316-label">得点</div>';
 const scoreCtl=document.createElement('div');scoreCtl.className='v30316-counter';const sm=makeBtn('−','minus'),sv=document.createElement('div');sv.className='value';sv.textContent='0';const sp=makeBtn('+','plus');
 sm.onclick=()=>{sv.textContent=String(Math.max(0,(Number(sv.textContent)||0)-1));};sp.onclick=()=>{sv.textContent=String(Math.min(9,(Number(sv.textContent)||0)+1));};scoreCtl.append(sm,sv,sp);scoreSection.append(scoreCtl);
 const outSection=document.createElement('div');outSection.className='v30316-section';outSection.innerHTML='<div class="v30316-label">アウト</div>';
 const outCtl=document.createElement('div');outCtl.className='v30316-counter';const om=makeBtn('−','minus'),ov=document.createElement('div');ov.className='value';ov.textContent='0';const op=makeBtn('+','plus');
 op.onclick=()=>{if(outPlus){outPlus.click();ov.textContent=String(Math.min(3,(Number(ov.textContent)||0)+1));if(Number(ov.textContent)>=3)setTimeout(()=>clickScore(panel,Number(sv.textContent)||0),0);}};
 om.onclick=()=>{ov.textContent=String(Math.max(0,(Number(ov.textContent)||0)-1));if(outFix)outFix.click();};outCtl.append(om,ov,op);outSection.append(outCtl);
 const actions=document.createElement('div');actions.className='v30316-actions';
 if(pitcher){const p=makeBtn('⚾ 自チームの投手交代','green');p.onclick=()=>pitcher.click();actions.append(p);}
 if(defense){const d=makeBtn('🧤 自チームの守備交代','blue');d.onclick=()=>defense.click();actions.append(d);}
 const back=makeBtn('← 戻る','back');back.onclick=()=>{try{if(typeof hardTabSwitch==='function'){hardTabSwitch('record');return;}}catch(e){}try{history.back();}catch(e){}};actions.append(back);
 if(scoreRow)scoreRow.style.display='none';if(outPlus)outPlus.style.display='none';if(outFix)outFix.style.display='none';if(pitcher)pitcher.style.display='none';if(defense)defense.style.display='none';
 panel.append(scoreSection,outSection,actions);return true;
}
const css=document.createElement('style');css.textContent=`
.v30316-opponent-panel{position:relative!important;overflow:hidden!important;padding:0!important;border-radius:18px!important;border:1px solid rgba(255,255,255,.8)!important;background:linear-gradient(rgba(255,255,255,.86),rgba(255,255,255,.92)),linear-gradient(135deg,#75a85d,#d8f0d0)!important;box-shadow:0 8px 24px rgba(0,0,0,.16)!important}
.v30316-opponent-panel:before{content:'';position:absolute;inset:0;background:linear-gradient(180deg,rgba(16,76,126,.08),rgba(255,255,255,.18));pointer-events:none}.v30316-topline,.v30316-section,.v30316-actions{position:relative;z-index:1}.v30316-topline{padding:14px 16px 10px;background:rgba(10,67,116,.92);color:#fff}.v30316-title{font-size:20px;font-weight:800}.v30316-note{font-size:12px;margin-top:3px;opacity:.9}.v30316-section{margin:12px 14px;padding:12px;border-radius:14px;background:rgba(255,255,255,.88);border:1px solid #d7e1e8}.v30316-label{font-weight:800;font-size:16px;margin-bottom:8px;color:#123b59}.v30316-counter{display:grid;grid-template-columns:56px 1fr 56px;gap:8px;align-items:center}.v30316-btn{appearance:none;border:1px solid #b9c9d4;border-radius:12px;background:#fff;min-height:44px;font-size:24px;font-weight:800;cursor:pointer;box-shadow:0 2px 5px rgba(0,0,0,.08)}.v30316-btn.minus{background:#edf2f5;color:#173f5c}.v30316-btn.plus{background:#1479c9;color:#fff;border-color:#1479c9}.v30316-counter .value{text-align:center;font-size:30px;font-weight:900;color:#102f48}.v30316-actions{display:grid;gap:8px;padding:0 14px 14px}.v30316-actions .v30316-btn{font-size:16px;min-height:46px}.v30316-btn.green{background:#159447;color:#fff;border-color:#159447}.v30316-btn.blue{background:#1672c5;color:#fff;border-color:#1672c5}.v30316-btn.back{background:#fff;color:#173f5c}`;document.head.appendChild(css);
let tries=0;const timer=setInterval(()=>{tries++;if(decorate()||tries>80)clearInterval(timer)},250);
})();