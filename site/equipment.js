(() => {
  const owned=new WeakMap();
  function dispose(actor){const old=owned.get(actor);if(!old)return;actor.paddle.geometry=old.originalGeometry;actor.paddle.material=old.originalMaterial;old.geometry.dispose();old.material.dispose();owned.delete(actor);}
  function apply(actor,playerId,config,human=playerId===0){
    if(!actor.paddle)return;
    const id=human?globalThis.RallyCareer.equipment().paddle:'paddle-default',old=owned.get(actor);
    if(old?.id===id)return;if(old)dispose(actor);
    const item=globalThis.RallyCareer.items.find(i=>i.id===id);if(!item?.color)return;
    const geometry=actor.paddle.geometry.clone(),material=actor.paddle.material.clone(),colors=geometry.getAttribute('color');
    const rgb=item.color.slice(1).match(/../g).map(x=>parseInt(x,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);
    if(colors){for(let i=0;i<colors.count;i++)if(Math.max(colors.getX(i),colors.getY(i),colors.getZ(i))>.04)colors.setXYZ(i,...rgb);colors.needsUpdate=true;}
    owned.set(actor,{id,geometry,material,originalGeometry:actor.paddle.geometry,originalMaterial:actor.paddle.material});actor.paddle.geometry=geometry;actor.paddle.material=material;
  }
  let cached=null,stamp='';
  function frame(view,snapshot){
    const id=globalThis.RallyCareer.equipment().paddle,key=id+':'+snapshot.players.filter(p=>p.human).map(p=>p.id).join(',');
    if(view===cached&&key===stamp)return;cached=view;stamp=key;
    for(const p of snapshot.players){const actor=view.players.get(p.id);if(actor)apply(actor,p.id,{},p.human);}
  }
  globalThis.RallyEquipment={apply,dispose,frame};
})();
