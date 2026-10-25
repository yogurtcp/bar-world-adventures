"""Generate the approved free female Hebrew voice locally, with resumable shared caching.

Dependencies: numpy, soundfile, onnxruntime, num2words, renikud-plus; BlueTTS checkout.
ML phases run separately to keep memory bounded. No cloud API or API key is used.
"""
import argparse,hashlib,json,os,re,shutil,subprocess,sys,tempfile,unicodedata
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
VOICE='libri_female_6147'
SEED=20261025

def read_json(path):return json.loads(path.read_text())
def atomic(path,data):
 path.parent.mkdir(parents=True,exist_ok=True)
 handle,name=tempfile.mkstemp(prefix=path.name+'.',suffix='.tmp',dir=path.parent)
 try:
  os.fchmod(handle,0o644)
  with os.fdopen(handle,'wb') as out:out.write(data)
  os.replace(name,path)
 finally:Path(name).unlink(missing_ok=True)
def save_json(path,value):atomic(path,(json.dumps(value,ensure_ascii=False,indent=2)+'\n').encode())
def catalog(root):return json.loads(subprocess.check_output(['node','scripts/audio-catalog.js'],cwd=root))['he']
def manifest(root):
 path=root/'src/core/audio-manifest.js'
 if not path.exists():path=root/'src/audio-manifest.js'
 code='import {audioManifest} from '+json.dumps('./'+path.relative_to(root).as_posix())+';console.log(JSON.stringify(audioManifest));'
 return path,json.loads(subprocess.check_output(['node','--input-type=module','-e',code],cwd=root))
def metadata(args):
 return {'engine':'BlueTTS 2.5','voice':VOICE,'engineCommit':subprocess.check_output(['git','rev-parse','HEAD'],cwd=args.engine_path,text=True).strip(),
  'modelRevision':(args.model_dir/'revision.txt').read_text().strip(),'g2pRevision':(args.g2p_model.parent/'revision.txt').read_text().strip(),
  'steps':16,'cfgScale':4.0,'speed':.8,'sampleRate':44100,'seed':SEED,'recipe':'blue-hebrew-female-v1'}
def identity(meta,text,ipa):
 recipe=json.dumps({'settings':meta,'text':text,'ipa':ipa},ensure_ascii=False,sort_keys=True)
 return hashlib.sha256(recipe.encode()).hexdigest()[:20]
def phonemes(args,projects,meta):
 import onnxruntime as ort
 from renikud_onnx import G2P
 path=args.cache_dir/'phonemes.json'
 previous=read_json(path) if path.exists() else {}
 plan=previous.get('records',{}) if previous.get('settings')==meta else {}
 reference=read_json(ROOT/'scripts/hebrew/blue-pronunciations.json')
 reference={unicodedata.normalize('NFC',k):v for k,v in reference.items()}
 plain={}
 for word,ipa in reference.items():
  key=''.join(c for c in unicodedata.normalize('NFD',word) if not unicodedata.combining(c))
  plain.setdefault(key,set()).add(ipa)
 def known(text):
  missing=False
  def replace(match):
   nonlocal missing
   word=unicodedata.normalize('NFC',match.group())
   if word in reference:return reference[word]
   choices=plain.get(word,set())
   if len(choices)==1:return next(iter(choices))
   missing=True;return word
  value=re.sub(r'[\u0590-\u05ff]+',replace,text)
  return None if missing else value
 options=ort.SessionOptions();options.intra_op_num_threads=2;options.inter_op_num_threads=1;options.enable_cpu_mem_arena=False
 g2p=None
 texts=sorted({unicodedata.normalize('NFC',text) for root in projects for text in catalog(root)})
 for index,text in enumerate(texts,1):
  if text not in plan:
   ipa=known(text);method='reviewed-game-lexicon'
   if ipa is None:
    if g2p is None:g2p=G2P(str(args.g2p_model),niqqud='use',session_options=options,datastore=None)
    ipa=g2p.phonemize(text,niqqud='use');method='RenikudPlus-int8-niqqud'
   if not ipa.strip() or re.search(r'[\u0590-\u05ff]',ipa):raise ValueError(f'Unpronounced Hebrew remains: {text}')
   plan[text]={'ipa':ipa,'method':method}
  if index%25==0:
   save_json(path,{'settings':meta,'records':plan});print(f'Pronunciation {index}/{len(texts)}',flush=True)
 save_json(path,{'settings':meta,'records':plan})
 print(f'Pronunciation plan complete: {len(texts)} texts',flush=True)
def stats(path):
 import numpy as np
 import soundfile as sf
 audio,rate=sf.read(path)
 duration=len(audio)/rate;peak=float(np.max(np.abs(audio)))
 if not (np.isfinite(audio).all() and .15<duration<20 and .02<peak<=1 and np.count_nonzero(np.abs(audio)>.004)/rate>.06):
  raise ValueError(f'Invalid recording: {path.name}, duration={duration}, peak={peak}')
 return {'seconds':duration,'peak':peak,'sampleRate':rate}
def audio(args,projects,meta):
 os.environ['ORT_NUM_THREADS']='2'
 sys.path.insert(0,str(args.engine_path/'src'))
 import numpy as np
 import soundfile as sf
 from blue_onnx import load_text_to_speech,load_voice_style,limit_peak
 plan=read_json(args.cache_dir/'phonemes.json');assert plan['settings']==meta
 records=plan['records']
 previous=read_json(args.cache_dir/'ready.json') if (args.cache_dir/'ready.json').exists() else {}
 if previous.get('settings')==meta:
  for text,entry in previous['records'].items():
   if text in records and 'seed' in entry:records[text]['seed']=entry['seed']
 texts=sorted({unicodedata.normalize('NFC',text) for root in projects for text in catalog(root)})
 tts=None;style=None
 for index,text in enumerate(texts,1):
  entry=records[text];digest=identity(meta,text,entry['ipa']);path=args.cache_dir/'audio'/f'blue-{digest}.mp3'
  if not path.exists():
   if tts is None:
    tts=load_text_to_speech(str(args.model_dir));style=load_voice_style([str(args.model_dir/'voices'/f'{VOICE}.json')])
   path.parent.mkdir(parents=True,exist_ok=True)
   temporary=path.with_suffix('.tmp')
   for attempt in range(5):
    np.random.seed(SEED+attempt)
    samples,_=tts(entry['ipa'],lang='he',style=style,total_step=16,cfg_scale=4.0,speed=.8,text_is_phonemes=True,normalize_text=False)
    samples=limit_peak(samples).reshape(-1)
    sf.write(temporary,samples,tts.sample_rate,format='MP3',subtype='MPEG_LAYER_III')
    try:stats(temporary)
    except ValueError:
     if attempt==4:raise
     print(f'Retrying silent or invalid clip: {text}',flush=True)
     continue
    entry['seed']=SEED+attempt
    temporary.replace(path);break
  entry.setdefault('seed',SEED)
  entry['audio']=stats(path);entry['path']=f'audio/he/{path.name}'
  if index%10==0:
   save_json(args.cache_dir/'ready.json',{'settings':meta,'records':records});print(f'Recordings {index}/{len(texts)}',flush=True)
 save_json(args.cache_dir/'ready.json',{'settings':meta,'records':records})
 print(f'Audio complete: {len(texts)} recordings',flush=True)
def activate(args,projects,meta):
 ready=read_json(args.cache_dir/'ready.json');assert ready['settings']==meta
 updates=[]
 for root in projects:
  texts=catalog(root);path,existing=manifest(root)
  asset_root=root/'public' if path.parent==root/'src' else root
  records={}
  for text in texts:
   key=unicodedata.normalize('NFC',text);entry=ready['records'][key]
   source=args.cache_dir/'audio'/Path(entry['path']).name
   checked=stats(source)
   target=asset_root/entry['path'];atomic(target,source.read_bytes())
   records[text]={'input':key,'ipa':entry['ipa'],'method':entry['method'],'path':entry['path'],'seed':entry.get('seed',SEED),**checked}
  existing['he']={text:entry['path'] for text,entry in records.items()}
  prior_meta=root/'scripts/hebrew/blue-recordings.json'
  previous=set(read_json(prior_meta).get('previousPaths',[])) if prior_meta.exists() else set()
  _,prior_manifest=manifest(root)
  previous.update(path for path in prior_manifest['he'].values() if path not in existing['he'].values())
  updates.append((root,path,existing,records,sorted(previous)))
 # All three sets are complete and decoded before any live manifest is changed.
 for root,path,existing,records,previous in updates:
  save_json(root/'scripts/hebrew/blue-recordings.json',{**meta,'records':records,'previousPaths':previous})
  atomic(path,('// Generated recordings; Hebrew uses the approved local female BlueTTS voice.\nexport const audioManifest = '+json.dumps(existing,ensure_ascii=False,indent=2)+';\n').encode())
  print(f'{root.name}: activated {len(records)} complete Hebrew recordings',flush=True)
def main():
 parser=argparse.ArgumentParser(description=__doc__)
 parser.add_argument('--engine-path',type=Path,required=True);parser.add_argument('--model-dir',type=Path,required=True)
 parser.add_argument('--g2p-model',type=Path,required=True)
 parser.add_argument('--cache-dir',type=Path,default=Path.home()/'.cache/bar-hebrew-blue-female-v1')
 parser.add_argument('--project',type=Path,action='append');parser.add_argument('--phase',choices=['all','phonemes','audio','activate'],default='all')
 args=parser.parse_args();projects=args.project or [ROOT];args.cache_dir.mkdir(parents=True,exist_ok=True)
 meta=metadata(args)
 if args.phase=='all':
  # Separate interpreters release each ML model before loading the next.
  base=[sys.executable,str(Path(__file__).resolve()),*sys.argv[1:]]
  for phase in ['phonemes','audio','activate']:subprocess.run(base+['--phase',phase],check=True)
 elif args.phase=='phonemes':phonemes(args,projects,meta)
 elif args.phase=='audio':audio(args,projects,meta)
 else:activate(args,projects,meta)
if __name__=='__main__':main()
