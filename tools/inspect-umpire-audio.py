import sys,json,pathlib,subprocess
sys.path.insert(0,'C:/Users/Dave/.cache/rally-audio-libs')
from faster_whisper import WhisperModel
import imageio_ffmpeg,numpy as np
model=WhisperModel('base.en',device='cpu',compute_type='int8',download_root='C:/Users/Dave/.cache/rally-whisper')
out=pathlib.Path(__file__).resolve().parent.parent/'backups'/'umpire-audio'
out.mkdir(parents=True,exist_ok=True)
for name in sys.argv[1:]:
    pcm=subprocess.check_output([imageio_ffmpeg.get_ffmpeg_exe(),'-v','error','-i',name,'-f','f32le','-ac','1','-ar','16000','-'])
    segments,info=model.transcribe(np.frombuffer(pcm,dtype=np.float32),language='en',word_timestamps=True,beam_size=5)
    result={'source':name,'duration':info.duration,'segments':[]}
    for s in segments:
        row={'start':s.start,'end':s.end,'text':s.text,'words':[{'start':w.start,'end':w.end,'word':w.word} for w in (s.words or [])]}
        result['segments'].append(row)
        print(f'{s.start:.2f}-{s.end:.2f}: {s.text}',flush=True)
    (out/(pathlib.Path(name).stem+'.json')).write_text(json.dumps(result,indent=2))
