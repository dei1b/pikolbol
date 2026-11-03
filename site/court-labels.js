/* Flat court lettering outside the playing lines, shared by every venue. */
(() => {
  let active=null;
  function attach(venue,K){
    const resources=[],labels=[];
    for(const side of [-1,1]){
      const canvas=document.createElement('canvas');canvas.width=1536;canvas.height=192;
      const texture=new K.Texture(canvas);texture.colorSpace=K.sRGB;
      const geometry=new K.Geometry(),x=side*4.05,w=.65,z=4.5;
      geometry.setAttribute('position',new K.Attribute(new Float32Array([x-w/2,.008,-z,x-w/2,.008,z,x+w/2,.008,z,x-w/2,.008,-z,x+w/2,.008,z,x+w/2,.008,-z]),3));
      const uv=side<0?[0,0,1,0,1,1,0,0,1,1,0,1]:[1,1,0,1,0,0,1,1,0,0,1,0];
      geometry.setAttribute('uv',new K.Attribute(new Float32Array(uv),2));geometry.computeVertexNormals();
      const material=new K.Basic({map:texture,transparent:true,opacity:.8,depthWrite:false,toneMapped:false});
      const mesh=new K.Mesh(geometry,material);mesh.name=side<0?'sideline-opponents':'sideline-match-mode';venue.group.add(mesh);
      labels.push({canvas,texture,mesh});resources.push(geometry,material,texture);
    }
    const state=active={labels,key:''},dispose=venue.dispose.bind(venue);
    venue.dispose=function(){for(const r of resources)r.dispose();if(active===state)active=null;return dispose();};
    update(globalThis.RallyMods?.engine);
  }
  function update(engine){
    if(!active||!engine)return;
    const rivals=engine.players.filter(p=>p.team===1&&!p.human).map(p=>globalThis.RallyAI?.profiles[p.mind.personality]).filter(Boolean);
    const lan=engine.config.offlineMode==='lan',session=globalThis.RallyLan?.session;
    const names=lan?(session?.members??[]).map(p=>p.name).join('   /   '):rivals.map(p=>`${p.name} · ${p.title}`).join('   /   ');
    const mode=engine.practice?'Practice':`${engine.config.offlineMode==='rush'?'Blitz Rush':engine.config.offlineMode==='rush'?'Blitz Rush':engine.config.offlineMode==='rush'?'Blitz Rush':engine.config.offlineMode==='rush'?'Blitz Rush':engine.blitz?'Blitz':'Classic'}   ·   ${engine.config.format==='doubles'?'Doubles':'Singles'}   ·   ${engine.config.scoring==='rally'?'Rally scoring':'Traditional scoring'}`;
    const text=[names,lan?'LAN · '+mode:mode],key=JSON.stringify(text);if(active.key===key)return;active.key=key;
    active.labels.forEach(({canvas,texture,mesh},i)=>{
      const c=canvas.getContext('2d');c.clearRect(0,0,canvas.width,canvas.height);c.fillStyle=i===0?'#f5f7e9':'#d4f25a';c.textAlign='center';c.textBaseline='middle';
      c.font='800 72px sans-serif';const size=Math.min(72,72*1420/Math.max(1,c.measureText(text[i]).width));c.font=`800 ${size}px sans-serif`;
      c.fillText(text[i],768,96);mesh.visible=!!text[i];texture.needsUpdate=true;
    });
  }
  globalThis.RallyCourtLabels={attach,update};
})();
