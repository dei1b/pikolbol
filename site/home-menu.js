(() => {
 const make=(tag,text,className)=>{const node=document.createElement(tag);if(text)node.textContent=text;if(className)node.className=className;return node;};
 const icons={
  'Quick match':'<rect x="4" y="3" width="12" height="14" rx="5" transform="rotate(25 10 10)"/><path d="m7 17-2 4"/><circle cx="20" cy="5" r="2"/><path d="m9 7 3 1m-4 2 3 1"/>',
  'LAN multiplayer':'<path d="M2 8a16 16 0 0 1 20 0M5 12a11 11 0 0 1 14 0m-11 4a6 6 0 0 1 8 0"/><circle cx="12" cy="20" r="1"/>',
  'Rival Ladder':'<path d="M4 21v-5h5v-5h5V6h6M16 3h5v5"/>',
  'Blitz Rush':'<path d="m13 2-9 12h7l-1 8 10-13h-7l1-7Z"/>',
  'Tournament':'<path d="M7 3h10v5a5 5 0 0 1-10 0V3Zm0 2H3v2a5 5 0 0 0 5 5m9-7h4v2a5 5 0 0 1-5 5m-4 1v5m-4 3h8m-6-3h4v3"/>',
  'Practice':'<circle cx="11" cy="13" r="8"/><circle cx="11" cy="13" r="4"/><path d="m11 13 9-9m-4 0h4v4"/>',
  'Career & rewards':'<path d="m7 3 5 8 5-8M4 3h5m6 0h5"/><circle cx="12" cy="16" r="6"/><path d="m12 13 .8 1.6 1.8.3-1.3 1.2.3 1.8-1.6-.8-1.6.8.3-1.8-1.3-1.2 1.8-.3Z"/>',
  'How to play':'<path d="M12 5C9 3 6 3 3 4v15c3-1 6-1 9 1 3-2 6-2 9-1V4c-3-1-6-1-9 1Zm0 0v15M6 8h3m-3 4h3m6-4h3m-3 4h3"/>',
  'Settings':'<path d="m9 3-.5 2.2-2 .9-2-.7-2 3.5L4 10.5v3l-1.5 1.6 2 3.5 2-.7 2 .9L9 21h6l.5-2.2 2-.9 2 .7 2-3.5-1.5-1.6v-3l1.5-1.6-2-3.5-2 .7-2-.9L15 3Z"/><circle cx="12" cy="12" r="3"/>'
 };
 function icon(title){const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('aria-hidden','true');svg.setAttribute('focusable','false');svg.setAttribute('class','rally-home-icon');svg.innerHTML=icons[title];return svg;}
 function action(title,detail,callback,kind='mode'){
  const b=make('button',null,'rally-home-action rally-home-'+kind);b.type='button';b.setAttribute('aria-label',title);const label=make('span',null,'rally-home-label'),copy=make('span',null,'rally-home-copy');copy.append(make('strong',title,'font-condensed'));if(detail){const description=make('span',detail,'rally-home-detail');description.id='home-detail-'+title.toLowerCase().replaceAll(' ','-');b.setAttribute('aria-describedby',description.id);copy.append(description);}label.append(icon(title),copy);b.append(label);b.onclick=callback;return b;
 }
 function mount(host,callbacks){if(!host||host.childElementCount)return;host.className='rally-home-actions';
  host.append(action('Quick match','Choose your court and AI rival',callbacks.quick,'quick'));
  host.append(action('LAN multiplayer',globalThis.RallyLan?.available()?'2–4 phones · Same Wi-Fi':'Play locally on Android',()=>RallyLanUI.open(),'lan'));
  host.append(action('Rival Ladder','Climb through ten rivals',()=>RallyLadderUI.open()));
  host.append(action('Blitz Rush','Three minutes · Fast rallies',()=>RallyRushUI.open()));
  host.append(action('Tournament',callbacks.runLabel??'Eight teams · Three rounds',callbacks.tournament));
  host.append(action('Practice',null,callbacks.practice,'secondary'),action('Career & rewards',null,()=>RallyCareerUI.openCareer(),'secondary'));
  const utility=make('div',null,'rally-home-utility');utility.append(action('How to play',null,callbacks.help,'utility-button'),action('Settings',null,callbacks.settings,'utility-button'));host.append(utility);
 }
 globalThis.RallyHome={mount};
})();
