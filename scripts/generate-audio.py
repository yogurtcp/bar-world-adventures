"""Build-only recorded narration. No network TTS in the installed app."""
import asyncio,hashlib,json,pathlib,subprocess,shutil
import edge_tts
ROOT=pathlib.Path(__file__).resolve().parents[1]
VOICES={'he':'he-IL-HilaNeural','en':'en-US-AriaNeural','fr':'fr-FR-DeniseNeural','it':'it-IT-ElsaNeural','el':'el-GR-AthinaNeural','es':'es-ES-ElviraNeural','de':'de-DE-KatjaNeural','nl':'nl-NL-ColetteNeural','nb':'nb-NO-PernilleNeural','sv':'sv-SE-SofieNeural','ru':'ru-RU-SvetlanaNeural','tr':'tr-TR-EmelNeural','ar':'ar-SA-ZariyahNeural','sw':'sw-KE-ZuriNeural','hi':'hi-IN-SwaraNeural','zh':'zh-CN-XiaoxiaoNeural','ja':'ja-JP-NanamiNeural','ko':'ko-KR-SunHiNeural','th':'th-TH-PremwadeeNeural','vi':'vi-VN-HoaiMyNeural','id':'id-ID-GadisNeural','fil':'fil-PH-BlessicaNeural','pt':'pt-BR-FranciscaNeural'}
catalog=json.loads(subprocess.check_output(['node','scripts/audio-catalog.js'],cwd=ROOT))
manifest={k:{} for k in catalog}; sem=asyncio.Semaphore(5); count=0
old=ROOT.parent/'bar-word-adventures'
existing=json.loads(subprocess.check_output(['node','--input-type=module','-e',"import {audioManifest} from './src/core/audio-manifest.js';console.log(JSON.stringify(audioManifest))"],cwd=old)) if old.exists() else {}
async def generate(locale,text):
 global count
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
     await edge_tts.Communicate(text if locale in ('he','en') else text+'.',VOICES[locale],rate='+0%' if locale=='he' else '-10%',volume='-8%').save(str(tmp))
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
