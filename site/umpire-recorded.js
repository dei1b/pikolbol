(() => {
  if(!document.documentElement.hasAttribute('data-recorded-umpire'))return;
  let files=null,current=null,version=0,busy=false,queue=[];
  const root='/rally/umpire-voice/';
  fetch(root+'manifest.json').then(r=>r.ok?r.json():null).then(m=>{if(m?.files)files=m.files;}).catch(()=>{});
  function cancel(){version++;queue=[];busy=false;if(current){current.pause();current=null;}}
  function speak(text,volume){
    if(!files)return true;
    const score=/^\d+-\d+(?:-[12])?$/.test(text)?text.split('-'):null;
    // Keep the opening zero-zero call; use "all" for positive tied scores.
    const parts=score&&Number(score[0])>0&&Number(score[0])===Number(score[1])
      ?[score[0],'All',...score.slice(2)]
      :files[text]?[text]:score??[];
    // Unsupported calls stay silent; never mix a device voice into recorded calls.
    if(!parts.length||parts.some(p=>!files[p]))return true;
    queue.push({parts,volume});if(queue.length>5)queue.shift();
    if(!busy)drain();
    return true;
  }
  async function drain(){
    busy=true;const token=version;
    while(queue.length&&token===version){
      const {parts,volume}=queue.shift();
      for(const part of parts){
        if(token!==version)return;
        const audio=current=new Audio(root+files[part]);audio.volume=Math.max(0,Math.min(1,volume));
        audio.playbackRate=globalThis.RallyMods?.engine?.blitz?1.08:1;
        await new Promise(resolve=>{audio.onended=resolve;audio.onerror=resolve;audio.onpause=resolve;audio.play().catch(resolve);});
      }
    }
    if(token===version){current=null;busy=false;}
  }
  globalThis.RallyUmpire={speak,cancel,get ready(){return !!files;}};
})();
