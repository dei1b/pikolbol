import sys,pathlib,re,subprocess,json
sys.path.insert(0,'C:/Users/Dave/.cache/rally-audio-libs')
import imageio_ffmpeg,numpy as np
ffmpeg=imageio_ffmpeg.get_ffmpeg_exe()
root=pathlib.Path(__file__).resolve().parent.parent
out=root/'site/rally/umpire-voice';out.mkdir(parents=True,exist_ok=True)
downloads=pathlib.Path('C:/Users/Dave/Downloads')
sources=[downloads/'ElevenLabs_2026-10-29T18_53_17_umpire_gen_sp100_s50_sb75_v4.mp3',downloads/'Voice 1.3 - Make this voice warmer, cal.mp3']
files={};report=[]
for source in sources:
    raw=subprocess.check_output([ffmpeg,'-v','error','-i',str(source),'-f','f32le','-ac','1','-ar','44100','-'])
    pcm=np.frombuffer(raw,dtype=np.float32);duration=len(pcm)/44100
    log=subprocess.run([ffmpeg,'-i',str(source),'-af','silencedetect=noise=-35dB:d=0.15','-f','null','-'],capture_output=True,text=True).stderr
    cursor=0;regions=[]
    for kind,value in re.findall(r'silence_(start|end): ([\d.]+)',log):
        t=float(value)
        if kind=='start' and t-cursor>.08:regions.append((cursor,t))
        if kind=='end':cursor=t
    if duration-cursor>.08:regions.append((cursor,duration))
    expected=100 if source==sources[0] else 11
    assert len(regions)==expected,(source,len(regions),regions)
    labels=[str(i) for i in range(100)] if expected==100 else ['0-0-2','1-0-2','7-5-1','10-9-2','Side out','Second server','Out','Net','Fault','Game point','Game']
    gain=min(2,.9/max(.01,float(np.max(np.abs(pcm)))))
    for label,(start,end) in zip(labels,regions):
        start=max(0,start-.035);end=min(duration,end+.055)
        audio=pcm[int(start*44100):int(end*44100)].copy()*gain
        n=min(220,len(audio)//2);audio[:n]*=np.linspace(0,1,n);audio[-n:]*=np.linspace(1,0,n)
        name='call-'+label.lower().replace(' ','-')+'.mp3'
        subprocess.run([ffmpeg,'-y','-v','error','-f','f32le','-ar','44100','-ac','1','-i','-','-c:a','libmp3lame','-b:a','96k',str(out/name)],input=audio.tobytes(),check=True)
        files[label]=name;report.append({'call':label,'source':source.name,'start':start,'end':end,'seconds':len(audio)/44100})
(out/'manifest.json').write_text(json.dumps({'voice':'ElevenLabs custom umpire','disclosure':'AI-generated umpire voice','files':files},indent=2))
(root/'backups/umpire-audio/import-report.json').write_text(json.dumps(report,indent=2))
print(f'Imported {len(files)} clips: 100 numbers, four complete scores and seven match calls')
