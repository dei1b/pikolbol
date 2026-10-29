const fs=require('fs');
for(const [f,keys]of [['0axfra5kwz6z1.js',['function eQ','function e0','function s3','function s1','function s2','eZ.h.wordmark','eZ.h.tagline']],['0ypohqpl3fqrx.js',['function B(','d.h.wordmark','i.h.wordmark']]]){
 const s=fs.readFileSync('paddleup-offline/site/_next/static/chunks/'+f,'utf8');for(const k of keys){let start=0;for(let n=0;n<10;n++){let i=s.indexOf(k,start);if(i<0)break;console.log(f,k,s.slice(Math.max(0,i-220),i+1000));start=i+k.length;}}
}
