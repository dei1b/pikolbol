import assert from 'node:assert/strict';
const targets=await(await fetch('http://127.0.0.1:9229/json/list')).json(),target=targets.find(t=>t.url.startsWith('https://appassets.androidplatform.net'));
if(!target)throw Error('No game WebView');const socket=new WebSocket(target.webSocketDebuggerUrl);await new Promise((r,j)=>{socket.onopen=r;socket.onerror=j;});let seq=0;
async function call(method,params={}){const id=++seq;return new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('CDP timeout')),10000);const listener=e=>{const m=JSON.parse(e.data);if(m.id===id){clearTimeout(timer);socket.removeEventListener('message',listener);m.error?reject(m.error):resolve(m.result);}};socket.addEventListener('message',listener);socket.send(JSON.stringify({id,method,params}));});}
async function evaluate(expression){const r=await call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description);return r.result.value;}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function until(expression){for(let i=0;i<60;i++){if(await evaluate(expression))return;await sleep(250);}throw Error('Timed out '+expression);}
try{
 await until('!!globalThis.RallySpin&&!!globalThis.RallyCareerUI?.actions');const before=await evaluate("localStorage.getItem('rally.offline.career.v1')");
 for(let i=0;i<2;i++){await evaluate("[...document.querySelectorAll('button')].find(b=>b.textContent.trim().toLowerCase()==='play match').click()");await sleep(300);}
 await until("!!document.querySelector('.rally-spin-picker')");
 const point=await evaluate("(()=>{const r=document.querySelector('[data-spin=topspin]').getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2};})()");
 await call('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...point,radiusX:3,radiusY:3,force:1,id:1}]});await call('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});assert.equal(await evaluate('RallySpin.selected'),'topspin');
 const physics=await evaluate("(()=>{const e=RallyMods.engine;e.skipIntro();const server=e.players.find(p=>p.id===e.setup.server);if(!server.human)e.setHuman(server.id,true);e.serveChoice={variant:'standard',aim:{x:0,depth:0},quality:1,extra:0};e.launchServe();return{spin:e.ball.v.spin,samples:e.incoming.samples.length,guide:e.landingView(1-server.team)};})()");assert(physics.spin>0);assert(physics.samples>0);
 await evaluate("document.querySelector('button[aria-label=Pause]').click()");await sleep(200);assert.equal(await evaluate("document.querySelector('.rally-spin-picker').hidden"),true);await evaluate('RallyCareerUI.actions.home()');await sleep(300);assert.equal(await evaluate("localStorage.getItem('rally.offline.career.v1')"),before);console.log('PASS actual phone touch selector, spin serve, predicted samples, pause, return home and career-save preservation',physics);
}finally{socket.close();}
