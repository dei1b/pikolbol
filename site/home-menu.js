(() => {
 const make=(tag,text,className)=>{const node=document.createElement(tag);if(text)node.textContent=text;if(className)node.className=className;return node;};
 function action(title,detail,callback,kind='mode'){
  const b=make('button',null,'rally-home-action rally-home-'+kind);b.type='button';b.setAttribute('aria-label',title);b.append(make('strong',title,'font-condensed'));if(detail)b.append(make('span',detail,'rally-home-detail'));b.onclick=callback;return b;
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
