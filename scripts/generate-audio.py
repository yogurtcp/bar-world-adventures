"""Build-only recorded narration. No network TTS in the installed app."""
import asyncio,hashlib,json,pathlib,subprocess,shutil
import edge_tts
ROOT=pathlib.Path(__file__).resolve().parents[1]
VOICES={'en':'en-US-AriaNeural','fr':'fr-FR-DeniseNeural','it':'it-IT-ElsaNeural','el':'el-GR-AthinaNeural','es':'es-ES-ElviraNeural','de':'de-DE-KatjaNeural','nl':'nl-NL-ColetteNeural','nb':'nb-NO-PernilleNeural','sv':'sv-SE-SofieNeural','ru':'ru-RU-SvetlanaNeural','tr':'tr-TR-EmelNeural','ar':'ar-SA-ZariyahNeural','sw':'sw-KE-ZuriNeural','hi':'hi-IN-SwaraNeural','zh':'zh-CN-XiaoxiaoNeural','ja':'ja-JP-NanamiNeural','ko':'ko-KR-SunHiNeural','th':'th-TH-PremwadeeNeural','vi':'vi-VN-HoaiMyNeural','id':'id-ID-GadisNeural','fil':'fil-PH-BlessicaNeural','pt':'pt-BR-FranciscaNeural'}
VOICES.update({'so':'so-SO-UbaxNeural','am':'am-ET-MekdesNeural','pt-PT':'pt-PT-RaquelNeural','uk':'uk-UA-PolinaNeural','pl':'pl-PL-ZofiaNeural','cs':'cs-CZ-VlastaNeural','sk':'sk-SK-ViktoriaNeural','hu':'hu-HU-NoemiNeural','ro':'ro-RO-AlinaNeural','bg':'bg-BG-KalinaNeural','sr':'sr-RS-SophieNeural','hr':'hr-HR-GabrijelaNeural','fi':'fi-FI-NooraNeural','lt':'lt-LT-OnaNeural','lv':'lv-LV-EveritaNeural','et':'et-EE-AnuNeural','da':'da-DK-ChristelNeural','kk':'kk-KZ-AigulNeural','mn':'mn-MN-YesuiNeural','fa':'fa-IR-DilaraNeural','ur':'ur-PK-UzmaNeural','bn':'bn-BD-NabanitaNeural','ne':'ne-NP-HemkalaNeural','ms':'ms-MY-YasminNeural','si':'si-LK-ThiliniNeural','ka':'ka-GE-EkaNeural'})
catalog=json.loads(subprocess.check_output(['node','scripts/audio-catalog.js'],cwd=ROOT))
current=json.loads(subprocess.check_output(['node','--input-type=module','-e',"import {audioManifest} from './src/audio-manifest.js';console.log(JSON.stringify(audioManifest))"],cwd=ROOT))
manifest={k:{} for k in catalog}; sem=asyncio.Semaphore(5); count=0
old=ROOT.parent/'bar-word-adventures'
existing=json.loads(subprocess.check_output(['node','--input-type=module','-e',"import {audioManifest} from './src/core/audio-manifest.js';console.log(JSON.stringify(audioManifest))"],cwd=old)) if old.exists() else {}
async def generate(locale,text):
 global count
 if locale=='he':
  relative=current.get('he',{}).get(text)
  if not relative or '/blue-' not in relative or not (ROOT/'public'/relative).is_file():
   raise ValueError('Generate the local female Hebrew recordings with scripts/generate-hebrew-blue.py first')
  manifest[locale][text]=relative
  count+=1
  return
 digest=hashlib.sha256((locale+'\n'+text).encode()).hexdigest()[:16]
 relative=f'audio/{locale}/{digest}.mp3'; manifest[locale][text]=relative
 path=ROOT/'public'/relative;path.parent.mkdir(parents=True,exist_ok=True)
 async with sem:
  reuse=existing.get(locale,{}).get(text)
  if not path.exists() and reuse and (old/reuse).exists():shutil.copy2(old/reuse,path)
  if not path.exists() or path.stat().st_size<1000:
   for attempt in range(5):
    try:
     tmp=path.with_suffix('.tmp')
     await edge_tts.Communicate(text if locale=='en' else text+'.',VOICES[locale],rate='-10%',volume='-8%').save(str(tmp))
     if tmp.stat().st_size<1000:raise ValueError('Empty clip')
     tmp.replace(path);break
    except Exception as error:
     if attempt==4:raise RuntimeError(f'{locale}: {text}: {error}')
     await asyncio.sleep(2**attempt)
  count+=1
  if count%75==0:print(f'{count} clips ready',flush=True)
async def main():
 await asyncio.gather(*(generate(locale,text) for locale,texts in catalog.items() for text in texts))
 (ROOT/'src/audio-manifest.js').write_text('// Generated build-time recordings.\nexport const audioManifest='+json.dumps(manifest,ensure_ascii=False)+';\n')
 print(f'Done: {count} clips',flush=True)
asyncio.run(main())
