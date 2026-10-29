const targets=await(await fetch('http://127.0.0.1:9229/json/list')).json();
if(!targets[0])throw new Error('No game page');
const socket=new WebSocket(targets[0].webSocketDebuggerUrl);
await new Promise((r,j)=>{socket.onopen=r;socket.onerror=j;});
let seq=0;
async function call(method,params={}){const id=++seq;return new Promise((resolve,reject)=>{const listener=e=>{const msg=JSON.parse(e.data);if(msg.id===id){socket.removeEventListener('message',listener);msg.error?reject(msg.error):resolve(msg.result);}};socket.addEventListener('message',listener);socket.send(JSON.stringify({id,method,params}));});}
try{
 if(process.argv.includes('--play'))await call('Runtime.evaluate',{expression:'[...document.querySelectorAll("button")].find(e=>e.innerText.trim().toLowerCase()==="play match")?.click()'});
 if(process.argv.includes('--pause'))await call('Runtime.evaluate',{expression:'document.querySelector("[data-match-overlay][data-paused=false]")&&document.querySelector("button[aria-label=Pause]")?.click()'});
 if(process.argv.includes('--blitz'))await call('Runtime.evaluate',{expression:'document.querySelector("[data-blitz-picker] button:last-child")?.click()'});
 const r=await call('Runtime.evaluate',{expression:'JSON.stringify({text:document.body.innerText,blitz:globalThis.RallyMods?.engine?.blitz,scoring:globalThis.RallyMods?.engine?.score?.scoring,phase:document.querySelector("[data-match-overlay]")?.dataset.phase,buttons:[...document.querySelectorAll("button")].map(e=>({text:e.innerText,label:e.getAttribute("aria-label")}))})',returnByValue:true});console.log(r.result.value);
}finally{socket.close();}
