const fs=require('fs');const s=fs.readFileSync('paddleup-offline/site/_next/static/chunks/0axfra5kwz6z1.js','utf8');
for(const key of ['function e6(','function eS(','function eT(','function aJ(','function aT(','function ie(','function eY(','difficulty','ballSpeed','moveSpeed','speed:','function e7(','data-screen":"settings','testId:"settings','phase="point"','phase:"point"']){
 let pos=0;for(let k=0;k<3;k++){let i=s.indexOf(key,pos);if(i<0)break;console.log(key,i,s.slice(Math.max(0,i-180),i+1700));pos=i+key.length;}
}
