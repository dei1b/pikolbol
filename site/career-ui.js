(() => {
  const el=(tag,text,cls)=>{const e=document.createElement(tag);if(text!==undefined&&text!==null)e.textContent=text;if(cls)e.className=cls;return e;};
  const button=(text,fn,primary=false)=>{const b=el('button',text,'career-button'+(primary?' primary':''));b.type='button';b.onclick=fn;return b;};
  let actions=null,overlay=null,previousFocus=null;
  function close(){overlay?.remove();overlay=null;previousFocus?.focus?.();}
  function screen(title,back=close){
    if(!overlay)previousFocus=document.activeElement;overlay?.remove();
    overlay=el('div',null,'career-overlay');overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-label',title);
    const body=el('div',null,'career-screen'),head=el('header',null,'career-header'),backButton=button('← Back',back);
    head.append(backButton,el('h1',title));body.append(head);overlay.append(body);document.body.append(overlay);backButton.focus();return body;
  }
  function select(label,options,value){const wrap=el('label',null,'career-field'),s=el('select');s.setAttribute('aria-label',label);for(const [id,text]of options){const o=el('option',text);o.value=id;s.append(o);}s.value=String(value);wrap.append(el('span',label),s);return{wrap,input:s};}
  function panel(title,text){const p=el('section',null,'career-panel');if(title)p.append(el('h2',title));if(text)p.append(el('p',text));return p;}
  const itemName=id=>RallyCareer.items.find(i=>i.id===id)?.name??id.replaceAll('-',' ');
  function medalProgress(m,s){if(s.medals[m.id])return'Earned';if(m.id==='finding-form')return`${Math.min(5,s.totals.wins)}/5 wins`;if(m.id==='rival-collector')return`${Math.min(3,Object.keys(s.rivalWins).length)}/3 rivals`;return'Not earned';}
  function openCareer(){
    const s=RallyCareer.load(),body=screen('Career'),stats=panel('Your progress',`${s.totals.wins} wins · ${s.totals.matches} completed matches · ${Object.keys(s.medals).length}/8 medals`);body.append(stats);
    body.append(el('p','Rewards count in completed CPU matches with target 7 or higher, power-ups off and auto-swing off. Movement assist is allowed.','career-muted'));
    if(RallyCareer.error)body.append(el('p',RallyCareer.error,'career-error'));
    const medalList=el('div',null,'career-grid');for(const m of RallyCareer.medals){const p=panel(m.name,m.description);p.dataset.medal=m.id;p.append(el('strong',medalProgress(m,s),s.medals[m.id]?'career-earned':'career-muted'),el('p','Reward: '+itemName(m.reward)));medalList.append(p);}body.append(medalList);
    body.append(el('h2','Paddle collection'));const collection=el('div',null,'career-grid');
    for(const item of RallyCareer.items.filter(i=>i.id.startsWith('paddle-'))){
      const p=panel(item.name),swatch=el('div',null,'career-paddle');swatch.style.backgroundColor=item.color??'#d4f25a';swatch.dataset.finish=item.id;if(item.color){swatch.style.backgroundImage=globalThis.RallyPaddlePatterns?.image(item.id)??'none';swatch.style.backgroundSize='70% 65%';swatch.style.backgroundPosition='center 40%';swatch.style.backgroundRepeat='no-repeat';}swatch.setAttribute('aria-hidden','true');p.append(swatch);
      const unlocked=s.unlocked.includes(item.id),equipped=s.equipped.paddle===item.id,b=button(equipped?'Equipped':unlocked?'Equip':'Locked',()=>{const r=RallyCareer.equip('paddle',item.id);if(r.saved)openCareer();else p.append(el('p',r.error,'career-error'));},unlocked&&!equipped);b.disabled=!unlocked||equipped;b.setAttribute('aria-label',`${equipped?'Equipped':unlocked?'Equip':'Locked'} ${item.name} paddle`);p.append(b);
      if(!unlocked)p.append(el('p',RallyCareer.medals.find(m=>m.reward===item.id)?.description??'Earn this reward.'));collection.append(p);
    }body.append(collection,el('h2','Badges'));
    const badges=panel(null);badges.append(button('No badge',()=>{RallyCareer.clearBadge();openCareer();}));
    for(const id of s.unlocked.filter(i=>!i.startsWith('paddle-'))){const b=button((id===s.equipped.badge?'★ ':'')+itemName(id),()=>{const r=RallyCareer.equip('badge',id);if(r.saved)openCareer();else badges.append(el('p',r.error,'career-error'));});badges.append(b);}body.append(badges);
  }
  function mountHome(host){if(!host||host.childElementCount)return;host.className='career-home';host.append(button('Career & rewards',openCareer));if(globalThis.RallyLadderUI)host.append(button('Rival Ladder',()=>RallyLadderUI.open()));if(globalThis.RallyRushUI)host.append(button('Blitz Rush',()=>RallyRushUI.open()));}
  function mountResults(host,award,record){
    if(!host||!record)return;host.replaceChildren();
    const p=panel('Career rewards');host.append(p);
    if(!record.eligible)p.append(el('p','This match does not count toward Career. Use CPU matches, target 7+, power-ups off and auto-swing off.'));
    else if(!award?.saved)p.append(el('p',award?.error??'Progress was not saved.','career-error'));
    else if(award.newMedalIds.length||award.newItemIds.length){for(const id of award.newMedalIds)p.append(el('strong','★ '+RallyCareer.medals.find(m=>m.id===id)?.name,'career-earned'));for(const id of award.newItemIds)p.append(el('p','Unlocked: '+itemName(id)));}
    else p.append(el('p','Progress saved. Keep working toward your next medal.'));
    const badge=RallyCareer.load().equipped.badge;if(badge)p.append(el('p','Your badge: '+itemName(badge)));
    p.append(button('View Career',openCareer));
    if(record.mode==='ladder')globalThis.RallyLadderUI?.mountResults(p,record);
    if(record.mode==='rush')globalThis.RallyRushUI?.mountResults(p,record);
  }
  document.addEventListener('keydown',e=>{if(overlay&&e.code==='Escape'){e.preventDefault();e.stopImmediatePropagation();close();}},true);
  globalThis.RallyCareerUI={bind(a){actions=a;},get actions(){return actions;},openCareer,mountHome,mountResults,close,screen,el,button,panel,select};
})();
