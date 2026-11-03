const fs=require('node:fs'),path=require('node:path'),root=path.resolve(__dirname,'..');let file=path.join(root,'site/_next/static/chunks/0axfra5kwz6z1.js'),s=fs.readFileSync(file,'utf8');
if(!s.includes('"data-main-actions":true')){
 const start=s.indexOf('function tD('),end=s.indexOf('function tO(',start);if(start<0||end<0)throw Error('Title component missing');let part=s.slice(start,end),nav=part.indexOf('(0,n.jsxs)("nav",'),open=part.indexOf('("nav",',nav),depth=1,quote=null,escape=false,close=-1;
 for(let i=open+1;i<part.length;i++){const ch=part[i];if(quote){if(escape){escape=false;continue;}if(ch==='\\'){escape=true;continue;}if(ch===quote)quote=null;continue;}if(ch==='"'||ch==="'"||ch==='`'){quote=ch;continue;}if(ch==='(')depth++;else if(ch===')'&&--depth===0){close=i+1;break;}}
 if(nav<0||close<0)throw Error('Main navigation missing');const replacement='(0,n.jsx)("nav",{"aria-label":"Main menu",className:"rally-home-menu",children:(0,n.jsx)("div",{"data-main-actions":true,ref:host=>globalThis.RallyHome?.mount(host,{quick:a,tournament:s,practice:o,help:l,settings:c,runLabel:t})})})';
 part=part.slice(0,nav)+replacement+part.slice(close);
 const classStart=part.indexOf('className:',part.indexOf('"data-screen":"title"')),classEnd=part.indexOf(',children:',classStart);part=part.slice(0,classStart)+'className:"rally-home"'+part.slice(classEnd);
 const children=part.indexOf('children:[',classStart);let next=part.indexOf('{className:',children);part=part.slice(0,next)+'{"data-home-wins":true,'+part.slice(next+1);next=part.indexOf('(0,n.jsxs)("div",{className:',next);if(next<0)throw Error('Brand container missing');part=part.slice(0,next)+part.slice(next).replace('(0,n.jsxs)("div",{className:','(0,n.jsxs)("div",{"data-home-brand":true,className:');
 s=s.slice(0,start)+part+s.slice(end);
}
s=s.replaceAll('children:"Play match"','children:"Quick match"').replaceAll('kicker:"Play match"','kicker:"Quick match"');fs.writeFileSync(file,s);
file=path.join(root,'site/index.html');s=fs.readFileSync(file,'utf8');if(!s.includes('src="/home-menu.js"'))s=s.replace('<script src="/settings-categories.js"></script>','<script src="/home-menu.js"></script><link rel="stylesheet" href="/home-menu.css"><script src="/settings-categories.js"></script>');fs.writeFileSync(file,s);console.log('Installed focused main menu and Quick match naming');
