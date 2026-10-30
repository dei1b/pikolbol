(() => {
  const owned=new WeakMap();
  function dispose(actor){const old=owned.get(actor);if(!old)return;if(old.graphic){old.graphic.removeFromParent();old.graphic.geometry.dispose();old.graphic.material.dispose();}actor.paddle.geometry=old.originalGeometry;actor.paddle.material=old.originalMaterial;old.geometry.dispose();old.material.dispose();owned.delete(actor);}
  function apply(actor,playerId,config,human=playerId===0){
    if(!actor.paddle)return;
    const id=human?globalThis.RallyCareer.equipment().paddle:'paddle-default',old=owned.get(actor);
    if(old?.id===id)return;if(old)dispose(actor);
    const item=globalThis.RallyCareer.items.find(i=>i.id===id);if(!item?.color)return;
    const geometry=actor.paddle.geometry.clone(),material=actor.paddle.material.clone(),colors=geometry.getAttribute('color');
    const rgb=item.color.slice(1).match(/../g).map(x=>parseInt(x,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);
    if(colors){for(let i=0;i<colors.count;i++)if(Math.max(colors.getX(i),colors.getY(i),colors.getZ(i))>.04)colors.setXYZ(i,...rgb);colors.needsUpdate=true;}
    let graphic=null;
    const shapes=globalThis.RallyPaddlePatterns?.get(id)??[];
    if(shapes.length){
      geometry.computeBoundingBox();const b=geometry.boundingBox,w=b.max.x-b.min.x,h=b.max.y,positions=[],paint=[];
      for(const side of [-1,1])for(const shape of shapes){
        const c=shape.color.slice(1).match(/../g).map(x=>parseInt(x,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);
        const polygon=shape.points.map(([x,y])=>[(x/100-.5)*w*.70,h*(.87-y/100*.49),side>0?b.max.z+.0003:b.min.z-.0003]);
        for(let i=1;i<polygon.length-1;i++){const tri=side>0?[polygon[0],polygon[i+1],polygon[i]]:[polygon[0],polygon[i],polygon[i+1]];for(const p of tri){positions.push(...p);paint.push(...c);}}
      }
      const g=new geometry.constructor();g.setAttribute('position',new colors.constructor(new Float32Array(positions),3));g.setAttribute('color',new colors.constructor(new Float32Array(paint),3));g.computeVertexNormals();
      const m=material.clone();m.vertexColors=true;m.side=2;graphic=new actor.paddle.constructor(g,m);graphic.name='paddle-pattern-'+id;actor.paddle.add(graphic);
    }
    owned.set(actor,{id,geometry,material,graphic,originalGeometry:actor.paddle.geometry,originalMaterial:actor.paddle.material});actor.paddle.geometry=geometry;actor.paddle.material=material;
  }
  let cached=null,stamp='';
  function frame(view,snapshot){
    const id=globalThis.RallyCareer.equipment().paddle,key=id+':'+snapshot.players.filter(p=>p.human).map(p=>p.id).join(',');
    if(view===cached&&key===stamp)return;cached=view;stamp=key;
    for(const p of snapshot.players){const actor=view.players.get(p.id);if(actor)apply(actor,p.id,{},p.human);}
  }
  globalThis.RallyEquipment={apply,dispose,frame};
})();
