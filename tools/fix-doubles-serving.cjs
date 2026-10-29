// Rally doubles: receiving a point changes the team's court positions too.
// Every new service turn starts with the player now on the right court.
const fs=require('node:fs');
const path=require('node:path');
const file=path.join(__dirname,'../site/_next/static/chunks/0axfra5kwz6z1.js');
const before='e.serving=t,e.server=i?e.points[t]%2==0?e.right[t]:1^e.right[t]:2*t,n';
const after='e.serving=t,i&&(e.right[t]=1^e.right[t]),e.server=i?e.right[t]:2*t,n';
const source=fs.readFileSync(file,'utf8');
if(source.includes(before)){
 if(source.split(before).length!==2)throw new Error('Ambiguous scoring hook');
 fs.writeFileSync(file,source.replace(before,after));
 console.log('Fixed Rally doubles court rotation and right-court side-out serve');
}else if(source.includes(after))console.log('Doubles serving fix already installed');
else throw new Error('Cannot find Rally scoring transition');
