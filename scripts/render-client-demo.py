"""Render the captured app walkthrough to a shareable, narrated H.264/AAC MP4."""
import json, math, subprocess, sys, wave, textwrap
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
ROOT=Path(__file__).resolve().parents[1]
sys.stdout.reconfigure(encoding='utf-8',errors='replace')
sys.path.insert(0,str(ROOT/'build/demo-deps'))
import imageio_ffmpeg
FFMPEG=imageio_ffmpeg.get_ffmpeg_exe()
WORK=ROOT/'build/client-demo'; DIST=ROOT/'dist'; DIST.mkdir(exist_ok=True)
STORY=json.loads((WORK/'story.json').read_text(encoding='utf-8'))
FRAMES=WORK/'frames'; CLIPS=WORK/'clips'
FRAMES.mkdir(exist_ok=True); CLIPS.mkdir(exist_ok=True)
W,H=1920,1080
def font(size,bold=False):return ImageFont.truetype('C:/Windows/Fonts/segoeuib.ttf' if bold else 'C:/Windows/Fonts/segoeui.ttf',size)
def wrap(text,f,max_width):
    lines=[]
    for paragraph in text.split('\n'):
        current=''
        for word in paragraph.split():
            trial=(current+' '+word).strip()
            if f.getlength(trial)>max_width and current:lines.append(current);current=word
            else:current=trial
        lines.append(current)
    return lines
def write(draw,xy,text,size,color,max_width,bold=False,leading=1.35):
    f=font(size,bold); lines=wrap(text,f,max_width); x,y=xy
    for line in lines:draw.text((x,y),line,font=f,fill=color);y+=size*leading
    return y,lines
def frame(scene,beat,chapter,total,idx):
    im=Image.new('RGB',(W,H),'#f6f3fa');d=ImageDraw.Draw(im)
    d.rectangle((0,0,20,H),fill='#6d49aa')
    d.rounded_rectangle((100,72,166,138),radius=20,fill='#29213e')
    d.line((142,88,142,119),fill='white',width=4)
    d.line((142,88,152,92),fill='white',width=4)
    d.ellipse((126,111,144,124),fill='white')
    write(d,(190,74),'RAMASHREE GURUKUL',31,'#29213e',1080,True)
    write(d,(190,117),'MUSIC INSTITUTE  /  OWNER’S APP WALKTHROUGH',17,'#716b7d',1080)
    write(d,(104,210),scene['menu'].upper(),20,'#6d49aa',1150,True)
    title_end,_=write(d,(100,263),scene['title'],64,'#29213e',1140,True,1.12)
    d.rounded_rectangle((100,475,1230,655),radius=23,fill='#e6f1ec')
    write(d,(126,493),'BUSINESS BENEFIT',17,'#147a67',1060,True)
    _,benefit_lines=write(d,(126,532),scene['benefit'],31,'#245249',1060,False,1.26)
    assert len(benefit_lines)<=3,scene['title']
    write(d,(104,708),'NARRATION',17,'#716b7d',1110,True)
    _,caption_lines=write(d,(100,749),beat['voice'],27,'#443b54',1120,False,1.38)
    assert len(caption_lines)<=6,(scene['menu'],caption_lines)
    # Phone framing keeps the actual captured viewport unobscured.
    d.rounded_rectangle((1365,70,1845,984),radius=43,fill='#dfd9e7')
    d.rounded_rectangle((1353,58,1833,972),radius=43,fill='#29213e')
    screen=Image.open(WORK/beat['screen']).convert('RGB').resize((450,879),Image.Resampling.LANCZOS)
    mask=Image.new('L',screen.size,0);ImageDraw.Draw(mask).rounded_rectangle((0,0,449,878),radius=27,fill=255)
    im.paste(screen,(1368,75),mask)
    d.text((1370,996),'ACTUAL APP UI  •  FICTIONAL DATA',font=font(17,True),fill='#716b7d')
    d.text((100,1000),'Browser interface recording · Android phone features explained',font=font(20),fill='#716b7d')
    d.text((1110,1000),f'{chapter:02d} / {total:02d}',font=font(20,True),fill='#6d49aa')
    d.rectangle((0,1068,W,1079),fill='#e4deeb')
    d.rectangle((0,1068,int(W*((idx%100)+1)/49),1079),fill='#6d49aa')
    # Subtle callout outline, only when the targeted element is fully visible.
    box=beat.get('highlight')
    if box and box['y']>=0 and box['y']+box['height']<=840:
        k=450/430
        rect=(1368+box['x']*k,75+box['y']*k,1368+(box['x']+box['width'])*k,75+(box['y']+box['height'])*k)
        d.rounded_rectangle(rect,radius=12,outline='#16a085',width=3)
    dest=FRAMES/f'{idx:03d}.png';im.save(dest)
    return dest
def run(args):
    proc=subprocess.run([FFMPEG,'-hide_banner','-loglevel','error','-y',*map(str,args)],capture_output=True,text=True)
    if proc.returncode:raise RuntimeError(proc.stderr)
def stamp(t):
    ms=round(t*1000);h,ms=divmod(ms,3600000);m,ms=divmod(ms,60000);s,ms=divmod(ms,1000)
    return f'{h:02d}:{m:02d}:{s:02d},{ms:03d}'
def main():
    idx=0;timeline=0;subtitles=[];chapters=[];clips=[];chapter_times=[]
    for chapter,scene in enumerate(STORY,1):
        start=timeline;chapter_times.append((timeline,scene['menu']))
        for beat in scene['beats']:
            audio=WORK/'audio'/f'{idx:03d}.wav'
            with wave.open(str(audio),'rb') as wav:
                audio_len=wav.getnframes()/wav.getframerate();assert audio_len>2
            duration=math.ceil((audio_len+.65)*15)/15
            png=frame(scene,beat,chapter,len(STORY),idx);clip=CLIPS/f'{idx:03d}.mp4'
            video_input=['-loop','1','-framerate','15','-i',png]
            if beat.get('alternateScreen'):
                alt_beat=dict(beat,screen=beat['alternateScreen'],highlight=None)
                alternate=frame(scene,alt_beat,chapter,len(STORY),idx+100)
                still_list=WORK/f'images-{idx:03d}.txt'
                still_list.write_text(f"file '{png.as_posix()}'\nduration {duration/2}\nfile '{alternate.as_posix()}'\nduration {duration/2}\nfile '{alternate.as_posix()}'\n",encoding='utf-8')
                video_input=['-f','concat','-safe','0','-i',still_list]
            run([*video_input,'-i',audio,'-t',f'{duration:.6f}',
                 '-vf','fps=15,fade=t=in:st=0:d=0.18,format=yuv420p',
                 '-af','apad,alimiter=limit=0.95','-c:v','libx264','-preset','veryfast','-crf','23',
                 '-c:a','aac','-b:a','96k','-ar','48000','-ac','1','-movflags','+faststart',clip])
            clips.append(clip)
            # Short caption cues for normal subtitle players; baked narration stays visible too.
            words=beat['voice'].split();parts=[words[i:i+17] for i in range(0,len(words),17)];elapsed=timeline
            for part in parts:
                portion=audio_len*len(part)/len(words)
                subtitles.append(f'{len(subtitles)+1}\n{stamp(elapsed)} --> {stamp(elapsed+portion)}\n'+ '\n'.join(textwrap.wrap(' '.join(part),68))+'\n')
                elapsed+=portion
            timeline+=duration
            print(f'Encoded {idx+1:02d}/49: {scene["menu"]}',flush=True);idx+=1
        chapters.append({'start':round(start,3),'end':round(timeline,3),'menu':scene['menu']})
    concat=WORK/'concat.txt';concat.write_text('\n'.join("file '"+p.as_posix()+"'" for p in clips),encoding='utf-8')
    meta=WORK/'chapters.ffmeta';meta.write_text(';FFMETADATA1\ntitle=Ramashree Gurukul Music Institute — Owner App Demo\n'+''.join(f'[CHAPTER]\nTIMEBASE=1/1000\nSTART={round(c["start"]*1000)}\nEND={round(c["end"]*1000)}\ntitle={c["menu"]}\n' for c in chapters),encoding='utf-8')
    target=DIST/'Ramashree-Gurukul-App-Demo.mp4'
    run(['-f','concat','-safe','0','-i',concat,'-f','ffmetadata','-i',meta,'-map','0','-map_metadata','1','-map_chapters','1','-c','copy','-movflags','+faststart',target])
    (DIST/'Ramashree-Gurukul-App-Demo.srt').write_text('\n'.join(subtitles),encoding='utf-8')
    # A clean poster and client handout with a timestamped menu index.
    Image.open(FRAMES/'000.png').save(DIST/'Ramashree-Gurukul-App-Demo-Poster.jpg',quality=92)
    notes=['# Ramashree Gurukul Music Institute — App demo','',f'Duration: {int(timeline//60)} minutes {round(timeline%60)} seconds. English synthetic narration.','',
      'The video uses real app interface captures in an isolated browser preview with fictional records. It is not an Android device recording. The institute name is set only in this demonstration; the released APK is unchanged.','',
      'Every main menu, both People tabs, all seven reports and each Settings section are covered. A fictional ₹500 UPI payment is saved in the demonstration dataset. The sample artist payout form is shown without saving it.','',
      'Android PIN access, role permissions, encryption, backup/restore and local alerts are explained from the implementation. Native device actions were not executed in this browser capture. Records are local to one device; no cloud sync, payment gateway or automatic message delivery is presented.','',
      '## Menu index','']
    for start,title in chapter_times:notes.append(f'- {int(start//60):02d}:{int(start%60):02d} — {title}')
    notes+=['','## Sharing','','Share the MP4 as an email attachment if your email provider’s size limit allows it, or upload it to your file-sharing service and send a viewing link. The MP4 uses H.264 video and AAC audio. The optional SRT has matching subtitles; narration text is also embedded visibly in the video.','',
            '## Rebuild','','Capture: `node scripts/capture-client-demo.js`. Narrate: run `scripts/narrate-client-demo.ps1` in Windows PowerShell with an installed English desktop voice. Render: run `scripts/render-client-demo.py` with Pillow and imageio-ffmpeg available.']
    (DIST/'Ramashree-Gurukul-Demo-Guide.md').write_text('\n'.join(notes),encoding='utf-8')
    (WORK/'render-summary.json').write_text(json.dumps({'seconds':timeline,'chapters':chapters,'screens':idx,'bytes':target.stat().st_size},indent=2),encoding='utf-8')
    print(json.dumps({'file':str(target),'seconds':round(timeline,2),'megabytes':round(target.stat().st_size/1024**2,2)}),flush=True)
if __name__=='__main__':main()
