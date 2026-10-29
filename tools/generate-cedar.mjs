// Generate once on the PC. The game plays the bundled MP3s without API access.
// Set OPENAI_API_KEY locally; never put it in source files or the Android app.
import fs from 'node:fs/promises';
import path from 'node:path';
const key=process.env.OPENAI_API_KEY;
if(!key){console.error('Set OPENAI_API_KEY locally before generating Cedar recordings. No requests sent.');process.exit(1);}
const root=path.resolve(import.meta.dirname,'../site/rally/umpire-cedar');
await fs.mkdir(root,{recursive:true});
const calls=['Game point','Out','Net','Fault','Game','Side out','Second server'];
const phrases=[...Array.from({length:100},(_,i)=>String(i)),...calls];
const files={};
for(const [i,text] of phrases.entries()){
 const name=`call-${i}.mp3`,file=path.join(root,name);files[text]=name;
 try{if((await fs.stat(file)).size>0)continue;}catch{}
 const response=await fetch('https://api.openai.com/v1/audio/speech',{
  method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},
  body:JSON.stringify({model:'gpt-4o-mini-tts',voice:'cedar',input:text,response_format:'mp3',instructions:'You are a calm, warm, confident pickleball umpire. Speak only the supplied call. Crisp, natural, concise delivery at a brisk sports officiating pace. No introductions, music or extra words.'})
 });
 if(!response.ok){console.error(`Generation stopped: HTTP ${response.status}. Completed files are kept for resuming.`);process.exit(1);}
 await fs.writeFile(file,Buffer.from(await response.arrayBuffer()));console.log(`Saved ${i+1}/${phrases.length}: ${text}`);
}
await fs.writeFile(path.join(root,'manifest.json'),JSON.stringify({voice:'cedar',disclosure:'AI-generated umpire voice',files},null,2));
const index=path.resolve(root,'../../index.html');
let html=await fs.readFile(index,'utf8');
if(!html.includes('data-cedar-voice'))html=html.replace('<html','<html data-cedar-voice="true"');
await fs.writeFile(index,html);
console.log('Cedar recordings ready. Run tools/prepare.mjs and rebuild Android to bundle them.');
