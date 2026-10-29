const fs=require('fs'),s=fs.readFileSync('paddleup-offline/site/_next/static/chunks/0axfra5kwz6z1.js','utf8');
for(const key of ['tickPoint(){','speedOf(e){','constructor(','tickIntro(){','beginServe(){','this.config','this.toScore','this.powerUps=','this.phase="intro"','ball.v','function tx(','let aT=','let t=','new p']){
 let pos=key==='constructor('?800000:0;for(let k=0;k<(key==='constructor('?4:1);k++){let i=s.indexOf(key,pos);if(i<0)break;console.log(key,i,s.slice(Math.max(0,i-150),i+2200));pos=i+key.length;}
}
