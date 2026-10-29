const fs=require('node:fs');const path=require('node:path');
const dir=path.resolve(__dirname,'../site/_next/static/chunks');
const backup=path.resolve(__dirname,'../backups/before-sponsor-removal');
fs.mkdirSync(backup,{recursive:true});
for(const file of fs.readdirSync(dir)){
 if(!file.endsWith('.js'))continue;
 const full=path.join(dir,file);let s=fs.readFileSync(full,'utf8');const original=s;
 if(file==='0axfra5kwz6z1.js'){
  s=s.replace('function eQ({placement:e,className:t=""}){return','function eQ({placement:e,className:t=""}){return null;return');
  s=s.replace('function eJ({className:e=""}){return','function eJ({className:e=""}){return null;return');
 }
 if(file==='1u9dsutcnsye8.js'){
  s=s.replace('name:"Taplinc",wordmark:"taplinc",site:"taplinc.com",tagline:"One click. Your whole bio."','name:"",wordmark:"",site:"",tagline:""');
 }
 // Sponsor lettering is painted into generated canvas textures, including the floor and net.
 if(['0axfra5kwz6z1.js','0ypohqpl3fqrx.js'].includes(file)){
  s=s.replace(/`\$\{\w+\.h\.wordmark\}\.`/g,'""');
  s=s.replaceAll('"PRESENTED BY"','""');
  s=s.replace('o(t,".",r,0,i.h.colors.lime)','o(t,"",r,0,i.h.colors.lime)');
  s=s.replace('return n+R(t,".",e+n,i,r)','return n');
 }
 s=s.replace(/taplinc(?:\.com)?/gi,'');
 if(s!==original){if(!fs.existsSync(path.join(backup,file)))fs.writeFileSync(path.join(backup,file),original);fs.writeFileSync(full,s);console.log('Updated',file);}
}
