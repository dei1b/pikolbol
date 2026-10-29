(() => {
  if(!document.documentElement.hasAttribute('data-cedar-voice'))return;
  let files=null,current=null,version=0;
  const root='/rally/umpire-cedar/';
  fetch(root+'manifest.json').then(r=>r.ok?r.json():null).then(m=>{if(m?.voice==='cedar')files=m.files;}).catch(()=>{});
  function cancel(){version++;if(current){current.pause();current=null;}}
  function speak(text,volume){
    if(!files)return false;
    cancel();const token=version;
    const parts=files[text]?[text]:/^\d+-\d+(?:-[12])?$/.test(text)?text.split('-'):[];
    // Unsupported calls stay silent; never mix a device voice into Cedar calls.
    if(!parts.length||parts.some(p=>!files[p]))return true;
    (async()=>{for(const part of parts){
      if(token!==version)return;
      const audio=current=new Audio(root+files[part]);audio.volume=Math.max(0,Math.min(1,volume));
      audio.playbackRate=globalThis.RallyMods?.engine?.blitz?1.08:1;
      await new Promise(resolve=>{audio.onended=resolve;audio.onerror=resolve;audio.onpause=resolve;audio.play().catch(resolve);});
    }if(token===version)current=null;})();
    return true;
  }
  globalThis.RallyCedar={speak,cancel,get ready(){return !!files;}};
})();
