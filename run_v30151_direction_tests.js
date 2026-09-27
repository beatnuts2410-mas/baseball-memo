const fs=require('fs'), crypto=require('crypto');
const html=fs.readFileSync(__dirname+'/index.html','utf8');
const dirs={
'単打':['1塁内野安打','2塁内野安打','3塁内野安打','ショート内野安打','ライト前ヒット','センター前ヒット','レフト前ヒット'],
'二塁打':['右中間ヒット ツーベース','左中間ヒット ツーベース'],
'三塁打':['オーバー スリーベース'],
'犠打':['1塁線','3塁線'],
'犠飛':['ライト','右中間','センター','左中間','レフト'],
'内野ゴロ':['1塁','2塁','3塁','ショート'],
'ライナー':['1塁','2塁','3塁','ショート'],
'内野フライ':['1塁','2塁','3塁','ショート'],
'外野フライ':['ライト','センター','レフト']};
const total=Object.values(dirs).flat().length*8*3;
const flat=Object.values(dirs).flat();
const checks=[];
checks.push(['direction-pattern-count',flat.length===32]);
checks.push(['all-direction-labels-present',flat.every(x=>html.includes(`'${x}'`))]);
checks.push(['all-result-buttons-use-direction-router',(html.match(/onclick="selectPAResult\('\$\{t\}'\)"/g)||[]).length===2]);
checks.push(['direction-modal-present',html.includes('id="battedBallDirectionModal"')]);
checks.push(['direction-persisted-to-pending',html.includes('direction:direction||null')]);
checks.push(['direction-persisted-to-pa',html.includes('direction:p.direction||null')]);
checks.push(['direction-shown-in-confirm',html.includes('打球：${esc(p.direction||\'方向指定なし\')}')]);
checks.push(['direction-shown-in-result-text',html.includes('x.direction?`（${x.direction}）`')]);
const start=html.indexOf('function advanceRunners(g,result,batterName){');
const end=html.indexOf('\nfunction renderBaseDiamond',start);
const hash=crypto.createHash('sha256').update(html.slice(start,end)).digest('hex');
checks.push(['advanceRunners-unchanged',hash==='aafbd8a7957714a8796b3fdf91014ce35e54deb1b9369cc647de0039bcc2a833']);
const pass=checks.filter(x=>x[1]).length;
console.log(JSON.stringify({fixedCases:total,checks:checks.length,passed:pass,allPass:pass===checks.length,advanceRunnersHash:hash,checks:Object.fromEntries(checks)},null,2));
process.exit(pass===checks.length?0:1);
