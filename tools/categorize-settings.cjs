const fs=require('node:fs'),path=require('node:path'),root=path.resolve(__dirname,'..');let file=path.join(root,'site/_next/static/chunks/0axfra5kwz6z1.js'),s=fs.readFileSync(file,'utf8');
if(!s.includes('"data-settings-categories":true')){
 const start=s.indexOf('function tx('),end=s.indexOf('function tv(',start);if(start<0||end<0)throw Error('Settings component missing');let part=s.slice(start,end),at=part.indexOf('children:[')+'children:['.length,depth=0,quote=null,escape=false,last=at,parts=[],tail=-1;
 for(let i=at;i<part.length;i++){const ch=part[i];if(quote){if(escape){escape=false;continue;}if(ch==='\\'){escape=true;continue;}if(ch===quote)quote=null;continue;}if(ch==='"'||ch==="'"||ch==='`'){quote=ch;continue;}if(ch==='['||ch==='{'||ch==='(')depth++;else if(ch===']'&&depth===0){parts.push(part.slice(last,i));tail=i;break;}else if(ch===']'||ch==='}'||ch===')')depth--;else if(ch===','&&depth===0){parts.push(part.slice(last,i));last=i+1;}}
 if(parts.length!==7||!parts[1].includes('title:"Controls"')||!parts[4].includes('title:"Sound"'))throw Error('Unexpected settings structure '+parts.length);
 let prefix=part.slice(0,at).replace('[d,u]=(0,i.useState)(!1);return','[d,u]=(0,i.useState)(!1),[category,setCategory]=(0,i.useState)(()=>globalThis.RallySettings.initial(!!r)),settingsId=(0,i.useId)();return').replace('"data-settings":!0','"data-settings":!0,className:"rally-settings"');
 const tabs='(0,n.jsx)("div",{className:"rally-settings-tabs",role:"tablist","aria-label":"Settings categories","data-settings-categories":true,onKeyDown:globalThis.RallySettings.keyboard,children:globalThis.RallySettings.categories.filter(([id])=>id!=="progress"||!!r).map(([id,label])=>(0,n.jsx)("button",{type:"button",role:"tab",id:"settings-tab-"+settingsId+"-"+id,"aria-selected":category===id,"aria-controls":"settings-pane-"+settingsId,tabIndex:category===id?0:-1,onClick:event=>{setCategory(id);globalThis.RallySettings.changed(event,id)},children:label},id))})';
 const panel='(0,n.jsxs)("div",{role:"tabpanel",className:"rally-settings-pane",id:"settings-pane-"+settingsId,"aria-labelledby":"settings-tab-"+settingsId+"-"+category,tabIndex:0,children:['+['category==="controls"&&'+parts[1],'category==="display"&&'+parts[2],'category==="display"&&'+parts[3],'category==="audio"&&'+parts[4],'category==="progress"&&'+parts[5],'(0,n.jsx)("div",{"data-remap-settings":true,ref:node=>globalThis.RallyMods?.mountControls(node,category)},category)'].join(',')+']})';
 part=prefix+tabs+','+panel+','+parts[6]+part.slice(tail);s=s.slice(0,start)+part+s.slice(end);fs.writeFileSync(file,s);
}
s=s.replace('className:"rally-settings-tabs",role:"tablist"','className:"rally-settings-tabs",style:{"--settings-tab-count":r?5:4},role:"tablist"');fs.writeFileSync(file,s);
file=path.join(root,'site/game-mods.js');s=fs.readFileSync(file,'utf8').replace(/\r\n/g,'\n');if(!s.includes("mountControls(host,category='all')")){
 s=s.replace('mountControls(host){',"mountControls(host,category='all'){");
 s=s.replace('if(globalThis.RallyUmpire){const voice=',"if((category==='all'||category==='audio')&&globalThis.RallyUmpire){const voice=");
 s=s.replace("      host.append(panel('Shot spin'","      if(category==='all'||category==='controls')host.append(panel('Shot spin'");
 s=s.replace("      const p=panel('Keyboard controls'","      if(category==='all'||category==='keyboard'){\n      const p=panel('Keyboard controls'");
 s=s.replace("const status=el('div',null,'rally-mod-status');","p.classList.add('rally-keyboard-panel');const status=el('div',null,'rally-mod-status');");
 s=s.replace("host.append(p);\n      const t=panel('Touch shot positions'","host.append(p);}\n      if(category==='all'||category==='controls'){\n      const t=panel('Touch shot positions'");
 s=s.replace('Movement, left-handed mode, and swipe controls remain in Controls below.','Movement, left-handed mode, and swipe controls are in Controls.');
 s=s.replace('t.append(resetTouch);host.append(t);','t.append(resetTouch);host.append(t); }');
 s=s.replaceAll('mods.mountControls(host);revision++','mods.mountControls(host,category);revision++');
 fs.writeFileSync(file,s);
}
s=s.replace("host.append(p);\n      const t=panel('Touch shot positions'","host.append(p);}\n      if(category==='all'||category==='controls'){\n      const t=panel('Touch shot positions'");
s=s.replace(/^.*const voice=el\('p','Umpire: ElevenLabs[^\r\n]*(?:\r?\n)?/m,'').replace('Cycle spin with your saved keyboard binding below.','Cycle spin using the binding in Keyboard.');fs.writeFileSync(file,s);
file=path.join(root,'site/index.html');s=fs.readFileSync(file,'utf8');if(!s.includes('src="/settings-categories.js"'))s=s.replace('<script src="/game-mods.js"></script>','<script src="/settings-categories.js"></script><link rel="stylesheet" href="/settings-categories.css"><script src="/game-mods.js"></script>');fs.writeFileSync(file,s);console.log('Installed five settings categories with native callbacks and category-aware custom panels');
