(() => {
  let audio=null,sound=null,court=null,timer=null,serial=0,paused=false,duckUntil=0;
  const tracks={beach:'/rally/ambience/beach.m4a',rooftop:'/rally/ambience/rooftop.m4a',night:'/rally/ambience/night.m4a'};
  function pause(){paused=true;audio?.pause();}
  function update(){
    if(!audio||!sound)return;
    const quiet=performance.now()<duckUntil,level=(!paused&&!document.hidden&&sound.crowdOn)?sound.volume*.65*(quiet?.32:1):0;
    audio.volume=Math.max(0,Math.min(1,audio.volume+(level-audio.volume)*.18));
    if(paused||document.hidden||!sound.crowdOn||sound.volume<=0){audio.pause();return;}
    if(audio.paused&&sound.unlocked)audio.play().catch(()=>{});
  }
  function stop(){clearInterval(timer);timer=null;if(audio){audio.pause();audio.removeAttribute('src');audio.load();}audio=null;sound=null;court=null;}
  function begin(next,id){stop();const token=++serial;court=tracks[id]?id:null;sound=next;paused=false;duckUntil=0;
    if(court){audio=new Audio(tracks[court]);audio.loop=true;audio.preload='auto';audio.volume=0;timer=setInterval(update,80);next.setCrowd(next.crowdOn);}
    return()=>{if(serial===token)stop();};
  }
  function sync(){paused=false;update();}
  document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();else update();});
  document.addEventListener('pointerdown',update,{passive:true});
  globalThis.RallyAmbience={begin,pause,sync,stop,duck(){duckUntil=performance.now()+1700;},get custom(){return !!court;},get audio(){return audio;},get court(){return court;}};
})();
