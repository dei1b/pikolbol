const fs=require('fs');const s=fs.readFileSync('paddleup-offline/site/_next/static/chunks/0axfra5kwz6z1.js','utf8');
for(const k of ['e.move(aC','Space','requestAnimationFrame','setAnimationLoop','document.hidden','visibilitychange','performance.now']){
 let start=0,count=0;
 while(count++<8){const i=s.indexOf(k,start);if(i<0)break;console.log(k,i,s.slice(Math.max(0,i-300),i+700));start=i+k.length;}
}
