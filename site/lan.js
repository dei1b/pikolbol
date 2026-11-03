/* LAN control plane and authoritative-engine adapter. Native TCP never loads remote code. */
(() => {
 const P=RallyLanProtocol;let session=null,returning=false,identity={name:'Player',character:0};
 const bridge=()=>globalThis.RallyLanNative,ui=()=>globalThis.RallyLanUI,now=()=>performance.now();
 const send=(peer,message)=>bridge()?.send(peer,JSON.stringify(message));
 const self=()=>session?.role==='host'?'host':session?.self;
 function create(role){stop(false);session={role,self:role==='host'?'host':null,identity:{...identity},room:role==='host'?P.room({},identity):null,info:null,state:null,active:false,result:false,engine:null,queues:new Map(),lastInputs:new Map(),paused:new Set(),loaded:new Set(),seq:0,packet:0,received:-1,frames:[],events:[],elapsed:0,sendAt:0,lastPacket:now(),pending:new Map()};return session;}
 function reject(id,message){const s=session;send(id,{type:'error',message});setTimeout(()=>{if(session===s)bridge()?.disconnect(id);},100);}
 function stop(home=true){const old=session;session=null;if(old){for(const timer of old.pending.values())clearTimeout(timer);old.pending.clear();}bridge()?.stop();document.getElementById('rally-lan-status')?.remove();if(home){returning=true;RallyCareerUI.actions?.home();RallyCareerUI.close();returning=false;}}
 function host(profile,settings){identity={name:P.name(profile.name),character:P.character(profile.character)};const s=create('host');s.room.settings(settings);bridge().host();ui()?.busy('Starting host…');}
 function join(profile,hostAddress,code){const target=P.address(hostAddress);if(!/^\d{6}$/.test(code))throw Error('Enter the six-digit room code.');identity={name:P.name(profile.name),character:P.character(profile.character)};create('guest');bridge().join(target.host,target.port,code);ui()?.busy('Connecting to host…');}
 function roomState(){const s=session;return{...s.room.snapshot(),phase:s.active?'playing':s.result?'results':'lobby'};}
 function publishRoom(){const s=session;if(!s||s.role!=='host')return;s.state=roomState();send('*',{type:'room',state:s.state});if(!s.active&&!s.result)ui()?.lobby(s);}
 function backToLobby(reason=''){const s=session;if(!s)return;s.active=false;s.result=false;s.engine=null;s.frames=[];s.events=[];s.queues.clear();s.loaded.clear();s.paused.clear();returning=true;RallyCareerUI.actions?.home();RallyCareerUI.close();returning=false;s.notice=reason;if(s.role==='host'){s.room.unready();send('*',{type:'lobby',reason});publishRoom();}else ui()?.lobby(s);status();}
 function fail(reason){stop();ui()?.open(reason);}
 function receive(e){const s=session;if(!s)return;try{
  if(e.kind==='hosting'){s.info=JSON.parse(e.data);publishRoom();return;}
  if(e.kind==='connected'){
   if(s.role==='guest'){s.self=e.data;send('host',{type:'profile',build:P.build,...s.identity});}
   else{if(s.active||s.result){reject(e.peer,'Match in progress. Join after the host returns to lobby.');return;}s.pending.set(e.peer,setTimeout(()=>{s.pending.delete(e.peer);bridge()?.disconnect(e.peer);},5000));}return;
  }
  if(e.kind==='error'){fail(friendly(e.data));return;}
  if(e.kind==='disconnected'){if(s.role==='guest'){fail('The host disconnected. The room has ended.');return;}clearTimeout(s.pending.get(e.peer));s.pending.delete(e.peer);const member=s.room.members.find(m=>m.id===e.peer);s.room.remove(e.peer);if(member&&(s.active||s.result))backToLobby(member.name+' disconnected. Start a new match when everyone is ready.');else publishRoom();return;}
  if(e.kind!=='message')return;const message=JSON.parse(e.data);if(!message||typeof message.type!=='string')throw Error('Bad message');
  if(s.role==='host')hostMessage(e.peer==='self'?'host':e.peer,message);else guestMessage(message);
 }catch(error){if(session?.role==='host'&&e.peer&&e.peer!=='self')bridge()?.disconnect(e.peer);else fail(error.message||'Invalid LAN message.');}}
 function friendly(reason){return({'wrong-code':'Wrong room code. Check the six digits on the host phone.','version-mismatch':'Game versions do not match. Install the same APK on every phone.','room-full':'This room is full.','connection-failed':'Could not connect. Check the address and that both phones use the same Wi-Fi or hotspot.','invalid-address-or-code':'Enter a private host address and six-digit room code.'})[reason]??reason;}
 function hostMessage(id,m){const s=session;
  if(m.type==='profile'){
   if(s.active||s.result)return;if(m.build!==P.build){reject(id,'Game versions do not match.');return;}
   clearTimeout(s.pending.get(id));s.pending.delete(id);if(s.room.members.some(p=>p.id===id))s.room.profile(id,m);else try{s.room.add(id,m);}catch(error){reject(id,error.message);return;}publishRoom();return;
  }
  if(!s.room.members.some(p=>p.id===id))throw Error('Not a room member');
  if(m.type==='ready'&&!s.active){s.room.ready(id,m.ready);publishRoom();}
  else if(m.type==='loaded'&&s.active&&m.match===s.match)markLoaded(id);
  else if(m.type==='input'&&s.active&&m.match===s.match&&!s.paused.size){if(!Number.isFinite(m.at)||Math.abs((s.engine?.t??0)-m.at)>1)return;if(s.queues.get(id)?.push(m.seq,m.input))s.lastInputs.set(id,now());}
  else if(m.type==='pause'&&s.active){setPause(id,m.paused===true);}
  else if(m.type==='lobby'&&(s.active||s.result)){backToLobby('A player returned to the lobby.');}
 }
 function guestMessage(m){const s=session;
  if(m.type==='room'){s.state=m.state;if(!s.active&&!s.result)ui()?.lobby(s);}
  else if(m.type==='start'){if(!m.match||!m.config||!Array.isArray(m.members))throw Error('Invalid match');s.match=m.match;s.world=m.config;s.teams=m.teams;s.members=m.members;begin();}
  else if(m.type==='frame'&&s.active&&m.match===s.match&&Number.isSafeInteger(m.seq)&&m.seq>s.received){s.received=m.seq;s.lastPacket=now();s.frames.push({at:now(),...m});if(s.frames.length>6)s.frames.shift();s.events.push(...m.events);if(s.events.length>512)throw Error('Event queue overflow');if(s.engine){s.engine.t=m.snapshot.t;s.engine.phase=m.snapshot.phase;s.engine.score=m.score;}}
  else if(m.type==='paused'){s.paused=new Set(m.members);s.lastPacket=now();if(s.paused.size)s.events=[];status();}
  else if(m.type==='hostPause'){s.paused.add('host');status();}
  else if(m.type==='finish'&&m.match===s.match){finish(m.result,false);}
  else if(m.type==='lobby'){s.notice=m.reason;backToLobby(m.reason);}
  else if(m.type==='error')fail(m.message);
 }
 function configure(p){if(session?.role!=='host'||session.active)return;session.room.settings(p);publishRoom();}
 function move(id,seat){if(session?.role!=='host')return;session.room.move(id,seat);publishRoom();}
 function ready(value){const s=session;if(s?.role==='guest')send('host',{type:'ready',ready:value===true});}
 function start(){const s=session;if(s?.role!=='host'||!s.room.canStart())throw Error('At least two phones must join and be ready.');const c=s.room.config,characters=[0,4,6,7];s.room.members.forEach(m=>characters[m.seat]=m.character);
  s.world={format:c.format,scoring:c.scoring,toScore:c.target,level:'normal',characters,seed:Math.floor(Math.random()*4294967296),autoRun:true,autoSwing:false,powerUps:false,offlineMode:'lan',offlinePace:c.pace,offlineCourt:c.court,aiProfiles:characters.map(n=>RallyAI.roster[n].id)};
  s.members=JSON.parse(JSON.stringify(s.room.members));s.teams=[0,1].map(team=>{const names=s.members.filter(m=>(m.seat>>1)===team).map(m=>m.name);return{name:names.join(' & ')||'CPU team',short:names[0]?.split(/\s+/)[0].slice(0,8).toUpperCase()||'CPU',characters:characters.slice(team*2,team*2+2),color:team===0?'#d4f25a':'#ff8b6e'};});s.match=crypto.randomUUID();send('*',{type:'start',match:s.match,config:s.world,teams:s.teams,members:s.members});begin();}
 function begin(){const s=session;s.active=true;s.result=false;s.engine=null;s.received=-1;s.frames=[];s.events=[];s.queues=new Map(s.members.map(m=>[m.id,P.inputQueue()]));s.lastInputs=new Map(s.members.map(m=>[m.id,now()]));s.startedAt=now();s.loaded.clear();s.paused.clear();s.elapsed=0;s.packet=0;s.local=s.members.find(m=>m.id===self());if(!s.local)throw Error('Missing player seat');s.view=RallyLanKit.seatView(s.local.seat);
  const config={...s.view.config(s.world),offlineMode:'lan',lanMatch:s.match,lanSeat:s.local.seat,lanWorld:s.world,aiProfiles:s.world.aiProfiles.map((_,i)=>s.world.aiProfiles[i^s.local.seat])};RallyMods.activeBlitz=config.offlinePace==='blitz';RallyScenery.setSession(config.offlineCourt);RallyCareerUI.close();RallyCareerUI.actions.launch({mode:'lan',config,teams:s.view.teams(s.teams)});}
 function mapSnapshot(world,s=session){if(!s?.view)return world;const local=s.view.snapshot(world);if(world.ball){const v=world.ball.v,mirrored=s.local.seat>=2,spin3=v.spin3&&{x:mirrored?-v.spin3.x:v.spin3.x,y:v.spin3.y,z:mirrored?-v.spin3.z:v.spin3.z};local.ball={...local.ball,v:{...v,...local.ball.v,...(spin3?{spin3}:{})}};}return local;}
 function attach(e){if(e.config.offlineMode!=='lan')return;const s=session;if(!s||s.match!==e.config.lanMatch)throw Error('LAN room ended.');s.engine=e;e._lan=true;e._lanAutoRun=e.config.autoRun!==false;e._worldSnapshot=e.snapshot.bind(e);e._worldStats=e.stats.bind(e);e._worldStep=e.stepPlayers.bind(e);
  if(s.role==='host')for(const p of e.players){e.setHuman(p.id,s.members.some(m=>m.seat===p.id));p.lanRemote=p.id!==s.local.seat;}
  e.snapshot=()=>{if(s.role==='host')return mapSnapshot(e._worldSnapshot(s.local.seat),s);const frame=displayFrame();return frame?mapSnapshot(frame.snapshot,s):mapSnapshot(e._worldSnapshot(s.local.seat),s);};
  e.stats=()=>{if(s.role==='host')return e._worldStats(s.local.seat);const f=s.frames.at(-1);return f?s.view.result({winner:f.snapshot.winner??0,points:f.snapshot.score.points,stats:f.stats}).stats:e._worldStats(0);};
 }
 function markLoaded(id){const s=session;s.loaded.add(id);s.lastInputs.set(id,now());if(s.loaded.size===s.members.length)for(const m of s.members)s.lastInputs.set(m.id,now());status();}
 function loaded(e){if(!e._lan||!session)return;markLoaded(self());if(session.role==='guest')send('host',{type:'loaded',match:session.match});}
 function displayFrame(){const s=session;if(!s?.frames.length)return null;const time=now()-60;let a=s.frames[0],b=a;for(const frame of s.frames){if(frame.at<=time)a=frame;if(frame.at>=time){b=frame;break;}b=frame;}if(a===b)return b;const f=Math.max(0,Math.min(1,(time-a.at)/Math.max(1,b.at-a.at))),mix=(x,y)=>x+(y-x)*f;
  const snap={...b.snapshot,players:b.snapshot.players.map(p=>{const old=a.snapshot.players.find(o=>o.id===p.id);return old?{...p,p:{x:mix(old.p.x,p.p.x),z:mix(old.p.z,p.p.z)},v:{x:mix(old.v.x,p.v.x),z:mix(old.v.z,p.v.z)}}:p;})};if(a.flight===b.flight&&a.bounces===b.bounces&&a.snapshot.ball&&b.snapshot.ball){const x=a.snapshot.ball,y=b.snapshot.ball;snap.ball={p:{x:mix(x.p.x,y.p.x),y:mix(x.p.y,y.p.y),z:mix(x.p.z,y.p.z)},v:{...y.v}};}return{...b,snapshot:snap};}
 function publishFrame(events=[]){const s=session,e=s?.engine;if(s?.role!=='host'||!e)return;const seq=++s.packet;for(const m of s.members){if(m.id==='host')continue;send(m.id,{type:'frame',match:s.match,seq,snapshot:e._worldSnapshot(m.seat),score:e.score,stats:e._worldStats(m.seat),flight:e.lastHitT,bounces:e.bounces,events});}}
 function step(e,dt,raw){if(!e._lan)return globalThis.RallyRush?RallyRush.step(e,dt,raw):e.step(dt,raw);const s=session;if(!s||!s.active)return[];const input=P.cleanInput({...raw,spin:RallySpin.selected,autoRun:e._lanAutoRun});s.sendAt+=dt;
  if(s.role==='guest'){if(!s.paused.size&&(raw.shot||raw.tap||raw.swipe||s.sendAt>=1/30)){send('host',{type:'input',match:s.match,seq:++s.seq,at:e.t,input});s.sendAt=0;}if(!s.paused.size&&now()-s.lastPacket>8000&&s.frames.length){fail('The host stopped responding.');return[];}return s.paused.size?[]:s.view.events(s.events.splice(0));}
  if(s.paused.size||s.loaded.size<s.members.length){if(!s.paused.size&&now()-s.startedAt>20000){backToLobby('A phone did not finish loading. Try again.');return[];}if(s.sendAt>.1){publishFrame();s.sendAt=0;}return[];}
  s.queues.get('host').push(++s.seq,input);const inputs={};for(const m of s.members){const data=s.queues.get(m.id).take(),p=e.players.find(p=>p.id===m.seat);if(!p)continue;if(m.id!=='host'){const age=now()-(s.lastInputs.get(m.id)??now());if(age>5000){bridge()?.disconnect(m.id);return[];}if(age>350)data.move=null;}inputs[m.seat]=data;p.lanSpin=data.spin;e.setAssists(m.seat,{autoRun:data.autoRun,autoSwing:false});}
  const events=e._worldStep(dt,inputs);if(s.sendAt>=.05||events.length){publishFrame(events);s.sendAt=0;}return s.view.events(events);
 }
 function clearInputs(){const s=session;if(!s)return;for(const q of s.queues.values())q.clear();for(const p of s.engine?.players??[]){p.ctl.press=null;p.ctl.tap=false;p.ctl.stick=null;}s.events=[];}
 function setPause(id,value){const s=session;if(value)s.paused.add(id);else s.paused.delete(id);if(!s.paused.size){s.startedAt=now();for(const m of s.members)s.lastInputs.set(m.id,now());}clearInputs();send('*',{type:'paused',members:[...s.paused]});status();}
 function pause(value){const s=session;if(!s?.active)return;if(s.role==='host')setPause('host',value);else{if(value)s.paused.add(s.self);else s.paused.delete(s.self);send('host',{type:'pause',paused:value});status();}}
 function status(){const s=session;let host=document.getElementById('rally-lan-status');if(!s?.active){host?.remove();return;}if(!host){host=document.createElement('div');host.id='rally-lan-status';host.className='rally-lan-status';host.setAttribute('role','status');document.body.append(host);}const names=[...s.paused].map(id=>s.members?.find(m=>m.id===id)?.name??'Host');host.textContent=names.length?'LAN paused · '+names.join(', '):'';host.hidden=!names.length;}
 function finish(result,broadcast=true){const s=session;if(!s||s.result)return;const world=result??{winner:s.engine.score.winner,points:s.engine.score.points,stats:s.engine._worldStats(0)};if(s.role==='host'&&broadcast)send('*',{type:'finish',match:s.match,result:world});s.active=false;s.result=true;returning=true;RallyCareerUI.actions.home();returning=false;status();ui()?.results(s,s.view.result(world));}
 function complete(e){if(!e._lan)return false;if(session?.role==='host')finish({winner:e.score.winner,points:[...e.score.points],stats:e._worldStats(0)});return true;}
 function detach(e){if(e._lan&&session?.engine===e){session.engine=null;if(!returning&&session.active)stop(false);}}
 const api={host,join,receive,start,configure,move,ready,attach,loaded,step,pause,complete,detach,stop,backToLobby,requestLobby(){if(session?.role==='host')backToLobby();else send('host',{type:'lobby'});},profile(p){if(session?.role==='guest')send('host',{type:'profile',build:P.build,...p});},assists(value){if(session?.engine)session.engine._lanAutoRun=value!==false;},get session(){return session;},available:()=>!!bridge(),setIdentity(p){identity=p;}};globalThis.RallyLan=api;
 document.addEventListener('visibilitychange',()=>{if(document.hidden)pause(true);});
})();
