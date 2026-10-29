const fs=require('fs');const s=fs.readFileSync('paddleup-offline/site/_next/static/chunks/0axfra5kwz6z1.js','utf8');
for(const [key,length] of [['u7=',4500],['mind.tune',1500],['chooseShot',2000],['tickCpu',4000],['tickCPU',4000],['planHit',3500],['tick(){',3300],['cpuShot',3000],['Kitchen queen',1800],['netDepth(',1600],['planServe()',1700]]){
 let from=0;for(let k=0;k<(key==='mind.tune'?3:1);k++){const pos=s.indexOf(key,from);if(pos<0)break;console.log('\n'+key+' @'+pos+'\n'+s.slice(Math.max(0,pos-180),pos+length));from=pos+key.length;}
}
for(const f of fs.readdirSync('paddleup-offline/site/_next/static/chunks')){if(!f.endsWith('.js'))continue;const text=fs.readFileSync('paddleup-offline/site/_next/static/chunks/'+f,'utf8');for(const key of ['Kitchen queen','Gentle','Gentle hit','title:"','label:"Easy"']){const p=text.indexOf(key);if(p>=0)console.log('\n'+f+' '+key+'\n'+text.slice(Math.max(0,p-900),p+2200));}}
