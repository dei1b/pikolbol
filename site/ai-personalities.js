/* CPU styles use the existing physics, legal-contact checks and seeded match RNG. */
(() => {
  const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
  const roster=[
    {id:'bea',name:'Bea',title:'Kitchen queen',character:0,partner:'migo',style:'kitchen',net:2.4,singles:2.85,speed:1,accuracy:.9,pace:1.05,
      description:'Builds points with soft dinks and drops, then holds the kitchen line. Pull her deep to break her rhythm.'},
    {id:'migo',name:'Migo',title:'Big hitter',character:1,partner:'bea',style:'power',net:3.1,singles:4.1,speed:.97,accuracy:1.12,pace:.9,
      description:'Favors fast drives and deep serves. His extra pace comes with wider placement errors; use soft, low returns.'},
    {id:'tala',name:'Tala',title:'Lob artist',character:2,partner:'paco',style:'lob',net:3.6,singles:4.5,speed:.98,accuracy:1,pace:1.04,
      description:'Uses high, deep lobs, especially when you crowd the net. Stay back and punish a short lob.'},
    {id:'paco',name:'Paco',title:'Speedster',character:3,partner:'tala',style:'runner',net:2.9,singles:3.6,speed:1.14,accuracy:1.08,pace:1,
      description:'Runs faster to cover open court and mixes drives with drops. His placement is less precise; make him change direction.'},
    {id:'isay',name:'Isay',title:'Steady hands',character:4,partner:'jojo',style:'steady',net:3,singles:4.2,speed:1,accuracy:.68,pace:1.12,
      description:'Makes fewer timing and placement errors, using safe drops and measured drives. Her drives are slower; take the initiative.'},
    {id:'jojo',name:'Jojo',title:'Smash happy',character:5,partner:'isay',style:'smash',net:2.45,singles:2.95,speed:1.02,accuracy:1.08,pace:.96,
      description:'Moves forward and prioritizes overhead smashes on high balls. Keep the ball low or lob over him.'},
    {id:'rafi',name:'Rafi',title:'Baseline sniper',character:1,partner:'isay',style:'sniper',net:5.4,singles:5.6,speed:.96,accuracy:.78,pace:.92,isNew:true,
      description:'Stays deep and drives toward the open corner. Short drops force him to cover the long run to the net.'},
    {id:'nika',name:'Nika',title:'Counterpuncher',character:4,partner:'paco',style:'counter',net:4.6,singles:5,speed:1.06,accuracy:.8,pace:1.1,isNew:true,
      description:'Defends from deep court and returns toward open space with controlled drives. Use a drop to draw her forward.'},
    {id:'enzo',name:'Enzo',title:'Net rusher',character:3,partner:'tala',style:'rusher',net:2.28,singles:2.7,speed:1.07,accuracy:1.06,pace:.98,isNew:true,
      description:'Uses third-shot drops to approach the kitchen, then looks for early volleys and drives. A deep lob can pass him.'},
    {id:'maya',name:'Maya',title:'Mix-up master',character:2,partner:'bea',style:'mix',net:3,singles:3.9,speed:1,accuracy:1.05,pace:1,isNew:true,
      description:'Alternates drives, drops and lobs during regular exchanges, while still attacking high balls. Her variety costs some accuracy.'}
  ];
  const profiles=Object.fromEntries(roster.map(p=>[p.id,Object.freeze(p)]));
  const originals=roster.slice(0,6);
  let selected='auto';
  try{const saved=localStorage.getItem('rally.offline.opponent.v1');if(saved==='auto'||profiles[saved])selected=saved;}catch{}
  const profileFor=(engine,player)=>profiles[engine.config.aiProfiles?.[player.id]]||originals[engine.config.characters?.[player.id]]||originals[0];
  function preparePlan(plan){
    if(plan.mode!=='quick')return plan;
    const config={...plan.config,characters:[...plan.config.characters]};
    const chosen=profiles[selected];
    config.aiProfiles=config.characters.map(c=>(originals[c]||originals[0]).id);
    if(chosen){
      const partner=profiles[chosen.partner];
      config.characters[2]=chosen.character;config.characters[3]=config.format==='singles'?chosen.character:partner.character;
      config.aiProfiles[2]=chosen.id;config.aiProfiles[3]=config.format==='singles'?chosen.id:partner.id;
    }
    const opponent=[profiles[config.aiProfiles[2]],...(config.format==='doubles'?[profiles[config.aiProfiles[3]]]:[])];
    const team={...plan.teams[1],characters:config.characters.slice(2),name:opponent.map(p=>p.name).join(' & '),short:opponent[0].name.toUpperCase()};
    return{...plan,config,teams:[plan.teams[0],team]};
  }
  function configure(engine){
    if(engine.practice||engine._rallyAIReady)return;
    engine._rallyAIReady=true;
    for(const player of engine.players){
      if(player.human)continue;
      const p=profileFor(engine,player),base=player.mind.tune;
      // Never modify shared difficulty presets or another character's tuning.
      const tune={...base,timing:[...base.timing],netDepth:p.net,singlesNet:p.singles,aimError:base.aimError*p.accuracy,pace:base.pace*p.pace};
      tune.speed=clamp(base.speed*p.speed,2.8,5.5);
      if(p.style==='steady'){
        tune.whiff*=.6;tune.blunder*=.6;tune.timing=[Math.min(.94,base.timing[0]+.05),base.timing[1]];
      }
      if(p.style==='kitchen'||p.style==='rusher')tune.thirdDrop=clamp(base.thirdDrop+.3,0,.95);
      if(p.style==='power'||p.style==='sniper'){tune.thirdDrop*=.35;tune.deepServe=clamp(base.deepServe+.35,0,.85);}
      if(p.style==='rusher'||p.style==='smash')tune.netVolley=clamp(base.netVolley+.15,0,.98);
      if(p.style==='counter')tune.deepVolley=base.deepVolley*.4;
      player.mind.personality=p.id;player.mind.tune=tune;player.mind.lastStyleShot=null;player.speed=tune.speed;
    }
  }
  function weighted(choices,rnd){const total=choices.reduce((n,c)=>n+c[1],0);let roll=rnd()*total;for(const [shot,weight]of choices){roll-=weight;if(roll<0)return shot;}return choices[choices.length-1][0];}
  function chooseShot(engine,player,tune,rnd,contact,base){
    if(engine.practice||player.human||!player.mind.personality)return base;
    const p=profiles[player.mind.personality],opponents=engine.players.filter(o=>o.team!==player.team),depth=Math.abs(contact.z),near=depth<3.5;
    const atNet=opponents.length>0&&opponents.every(o=>Math.abs(o.p.z)<3.3);
    let type=base.type;
    // The first return and third shot retain the engine's bounce-aware selection.
    if(engine.hits>=3){
      if(contact.y>=1.5&&depth<6.2&&(p.style==='smash'||p.style==='power'||rnd()<.7))type='smash';
      else{
        let choices;
        switch(p.style){
          case 'kitchen':choices=near?[['dink',82],['drive',12],['lob',6]]:[['drop',78],['drive',16],['lob',6]];break;
          case 'power':choices=near?[['drive',72],['dink',23],['lob',5]]:[['drive',83],['drop',14],['lob',3]];break;
          case 'lob':choices=near?[['lob',atNet?68:43],['dink',38],['drive',12]]:[['lob',atNet?72:53],['drop',29],['drive',18]];break;
          case 'runner':choices=near?[['dink',40],['drive',50],['lob',10]]:[['drive',54],['drop',38],['lob',8]];break;
          case 'steady':choices=near?[['dink',78],['drive',18],['lob',4]]:[['drop',64],['drive',32],['lob',4]];break;
          case 'smash':choices=near?[['drive',65],['dink',25],['lob',10]]:[['drive',56],['drop',32],['lob',12]];break;
          case 'sniper':choices=near?[['drive',55],['dink',40],['lob',5]]:[['drive',90],['drop',8],['lob',2]];break;
          case 'counter':choices=near?[['dink',64],['drive',30],['lob',6]]:[['drive',68],['drop',27],['lob',5]];break;
          case 'rusher':choices=near?[['drive',58],['dink',38],['lob',4]]:[['drop',78],['drive',18],['lob',4]];break;
          default:choices=near?[['dink',34],['drive',36],['lob',30]]:[['drop',36],['drive',34],['lob',30]];
        }
        // A low contact is safer as a soft shot than as a flat drive.
        if(contact.y<.55)choices=choices.map(([s,w])=>[s,s==='drive'?w*.35:w]);
        if(p.style==='mix'&&player.mind.lastStyleShot){const alternatives=choices.filter(([s])=>s!==player.mind.lastStyleShot);if(alternatives.length)choices=alternatives;}
        type=weighted(choices,rnd);
      }
    }
    player.mind.lastStyleShot=type;
    let aim={...base.aim};
    if((p.style==='sniper'||p.style==='counter')&&opponents.length&&rnd()<tune.smart){
      const width=p.style==='sniper'?.9:.7;
      const gap=x=>Math.min(...opponents.map(o=>Math.abs(o.p.x-x)));
      aim.x=(gap(-2.1)>gap(2.1)?-1:1)*width;
      aim.depth=type==='drive'?.65:base.aim.depth;
    }
    if(type==='lob')aim.depth=.3+.25*rnd();
    const pace=type==='drive'&&contact.y<.65?Math.max(base.pace,1.12):base.pace;
    return{...base,type,aim,pace};
  }
  function afterHit(engine,hitter){
    if(engine.practice||engine.hits<3)return;
    for(const p of engine.players){if(p.human||p.team!==hitter.team||!p.mind.personality)continue;p.depth=engine.config.format==='singles'?p.mind.tune.singlesNet:p.mind.tune.netDepth;}
  }
  function mountPicker(host){
    if(!host||host.childElementCount)return;
    const panel=document.createElement('section');panel.className='rally-mod-panel rally-ai-picker';
    const title=document.createElement('h2');title.textContent='AI opponent';
    const select=document.createElement('select');select.setAttribute('aria-label','AI opponent');select.className='rally-ai-select';
    const auto=document.createElement('option');auto.value='auto';auto.textContent='Random character personalities';select.append(auto);
    for(const p of roster){const o=document.createElement('option');o.value=p.id;o.textContent=`${p.isNew?'New · ':''}${p.name} — ${p.title}`;select.append(o);}
    select.value=selected;
    const name=document.createElement('div');name.className='rally-ai-name';
    const description=document.createElement('p');description.className='rally-ai-description';description.setAttribute('aria-live','polite');
    const partner=document.createElement('p');partner.className='rally-ai-partner';
    const note=document.createElement('p');note.textContent='Difficulty below controls reactions and accuracy. Every CPU, including your partner, follows its own character style.';
    const update=()=>{const p=profiles[selected];name.textContent=p?`${p.name} · ${p.title}`:'A random pairing each match';description.textContent=p?p.description:'The six original characters now play to their titles: kitchen control, power, lobs, speed, consistency, or overhead attacks.';partner.textContent=p?`In doubles: teams up with ${profiles[p.partner].name} (${profiles[p.partner].title}).`:'';};
    select.onchange=()=>{selected=select.value;try{localStorage.setItem('rally.offline.opponent.v1',selected);}catch{}update();};update();panel.append(title,select,name,description,partner,note);host.append(panel);
  }
  function refreshMatchInfo(){
    const host=document.querySelector('[data-match-overlay]'),engine=globalThis.RallyMods?.engine;
    let badge=document.getElementById('rally-ai-badge');
    if(!host||!engine?._rallyAIReady){badge?.remove();return;}
    const opponents=engine.players.filter(p=>p.team===1&&!p.human).map(p=>profiles[p.mind.personality]).filter(Boolean);
    if(!opponents.length){badge?.remove();return;}
    if(!badge){badge=document.createElement('div');badge.id='rally-ai-badge';badge.className='rally-ai-badge';host.append(badge);}
    const text=opponents.map(p=>`${p.name} · ${p.title}`).join(' / ');
    if(badge.textContent!==text)badge.textContent=text;
    badge.style.top=engine.blitz?'115px':'88px';
  }
  globalThis.RallyAI={roster,profiles,preparePlan,configure,chooseShot,afterHit,mountPicker,refreshMatchInfo};
})();
