"""Extract exact atlas cells; no generative editing. Keep source illustrations intact."""
import json,pathlib,subprocess
from PIL import Image,ImageDraw
ROOT=pathlib.Path(__file__).resolve().parents[1]
source=ROOT/'art-source/atlases'
catalog=json.loads((ROOT/'art-source/atlas-catalog.json').read_text())
countries=json.loads(subprocess.check_output(['node','--input-type=module','-e',"import {countries} from './src/countries.js';console.log(JSON.stringify(countries))"],cwd=ROOT))
by_iso={c['iso']:c for c in countries}
for group in catalog:
 im=Image.open(source/group['file']).convert('RGB');w,h=im.size
 for cell,iso in enumerate(group['isos']):
  c=by_iso[iso]
  x,y=cell%3,cell//3
  tile=im.crop((round(x*w/3),round(y*h/3),round((x+1)*w/3),round((y+1)*h/3)))
  output=ROOT/'public'/c['art'];output.parent.mkdir(parents=True,exist_ok=True);tile.save(output,'WEBP',quality=88)
traveler=Image.open(ROOT/'public/assets/countries/il.webp');traveler.crop((0,0,240,330)).resize((320,440)).save(ROOT/'public/assets/bar-traveler.webp','WEBP',quality=90)
# Deterministic install icon: Bar portrait inset in a blue/green toy globe. No text is rasterized.
base=Image.new('RGB',(1024,1024),'#edf7e8');d=ImageDraw.Draw(base)
d.ellipse((110,110,914,914),fill='#66c9d2',outline='#ffffff',width=24)
d.ellipse((225,135,800,890),outline='#d0f2d3',width=18);d.arc((120,240,905,780),0,360,fill='#d0f2d3',width=16)
portrait=traveler.crop((0,0,215,290)).resize((500,674));mask=Image.new('L',portrait.size,0);md=ImageDraw.Draw(mask);md.rounded_rectangle((0,0,500,674),radius=160,fill=255)
base.paste(portrait,(262,166),mask)
d=ImageDraw.Draw(base);d.ellipse((720,710,886,876),fill='#ffd775',outline='#fff7dd',width=12)
d.polygon([(803,738),(817,775),(854,778),(826,802),(834,840),(803,820),(773,840),(780,802),(752,778),(790,775)],fill='#fff9db')
icons=ROOT/'public/icons';icons.mkdir(exist_ok=True)
for name,size in [('icon-192.png',192),('icon-512.png',512),('maskable-512.png',512),('apple-touch-icon.png',180)]:base.resize((size,size),Image.Resampling.LANCZOS).save(icons/name)
base.resize((512,512)).save(ROOT/'art-source/icon-v1.png')
print(f'Prepared {len(countries)} scenes, a Bar traveler portrait and 4 install icons')
