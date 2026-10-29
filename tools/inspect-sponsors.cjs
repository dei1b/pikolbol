const fs=require('fs');
for(const file of fs.readdirSync('paddleup-offline/site/_next/static/chunks')){
 if(!file.endsWith('.js'))continue;
 const s=fs.readFileSync('paddleup-offline/site/_next/static/chunks/'+file,'utf8');
 for(const m of s.matchAll(/taplinc|data-sponsor|Presented by/gi))console.log(file,m.index,s.slice(Math.max(0,m.index-140),m.index+220));
}
