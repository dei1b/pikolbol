import sys,pathlib,subprocess,json
sys.path.insert(0,'C:/Users/Dave/.cache/rally-audio-libs')
import imageio_ffmpeg,numpy as np
root=pathlib.Path(__file__).resolve().parent.parent;out=root/'site/rally/ambience';out.mkdir(parents=True,exist_ok=True)
report=[]
for id,name in [('rooftop','sunsetrooftop'),('night','nightforestrural'),('beach','beach')]:
    source=pathlib.Path('C:/Users/Dave/Downloads')/(name+'.mp3');target=out/(id+'.m4a')
    pcm=subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(),'-v','error','-i',str(source),'-af','loudnorm=I=-25:TP=-4:LRA=11','-f','f32le','-ac','2','-ar','32000','-'],check=True,capture_output=True).stdout
    samples=np.frombuffer(pcm,dtype='<f4').reshape(-1,2);fade=48000
    assert len(samples)>fade*3
    weight=np.linspace(0,1,fade,dtype=np.float32)[:,None]
    loop=np.concatenate([samples[fade:-fade],samples[-fade:]*(1-weight)+samples[:fade]*weight])
    subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(),'-y','-v','error','-f','f32le','-ac','2','-ar','32000','-i','-','-c:a','aac','-b:a','64k','-movflags','+faststart',str(target)],input=loop.astype('<f4').tobytes(),check=True)
    assert target.stat().st_size>100000
    report.append({'court':id,'source':source.name,'sourceBytes':source.stat().st_size,'bytes':target.stat().st_size,'loudnessTargetLUFS':-25,'codec':'AAC stereo 64kbps 32kHz','loopCrossfadeSeconds':1.5})
    print(id,source.stat().st_size,'->',target.stat().st_size,flush=True)
(out/'sources.json').write_text(json.dumps(report,indent=2))
