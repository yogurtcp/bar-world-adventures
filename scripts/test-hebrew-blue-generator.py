"""Test release atomicity and cache identity without loading the ML models."""
import importlib.util,json,tempfile,unittest
from copy import deepcopy
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch
spec=importlib.util.spec_from_file_location('blue',Path(__file__).with_name('generate-hebrew-blue.py'))
blue=importlib.util.module_from_spec(spec);spec.loader.exec_module(blue)

class ReleaseTests(unittest.TestCase):
 def fixture(self,folder,complete=True):
  roots=[folder/'words',folder/'world'];cache=folder/'cache';cache.mkdir()
  meta={'voice':'libri_female_6147','speed':.8}
  items={'first':{'ipa':'fˈirst','method':'reference','path':'audio/he/blue-first.mp3'},'second':{'ipa':'sˈekond','method':'reference','path':'audio/he/blue-second.mp3'}}
  blue.save_json(cache/'ready.json',{'settings':meta,'records':items})
  (cache/'audio').mkdir();(cache/'audio/blue-first.mp3').write_bytes(b'test data stays in temporary directory')
  if complete:(cache/'audio/blue-second.mp3').write_bytes(b'test data stays in temporary directory')
  states={}
  for index,root in enumerate(roots):
   path=root/'src/core/audio-manifest.js';path.parent.mkdir(parents=True);path.write_text('old usable manifest')
   states[root]=(path,{'he':{'previous':'audio/he/old.mp3'},'en':{'hello':'audio/en/hello.mp3'}})
  return roots,cache,meta,states
 def test_missing_clip_never_switches_any_app_manifest(self):
  with tempfile.TemporaryDirectory() as directory:
   roots,cache,meta,states=self.fixture(Path(directory),complete=False)
   with patch.object(blue,'catalog',side_effect=lambda root:['first'] if root==roots[0] else ['second']),patch.object(blue,'manifest',side_effect=lambda root:deepcopy(states[root])),patch.object(blue,'stats',return_value={'seconds':1,'peak':.5,'sampleRate':44100}):
    with self.assertRaises(FileNotFoundError):blue.activate(SimpleNamespace(cache_dir=cache),roots,meta)
   for root in roots:
    self.assertEqual(states[root][0].read_text(),'old usable manifest')
    self.assertFalse((root/'scripts/hebrew/blue-recordings.json').exists())
 def test_complete_release_preserves_other_languages_and_previous_urls(self):
  with tempfile.TemporaryDirectory() as directory:
   roots,cache,meta,states=self.fixture(Path(directory))
   with patch.object(blue,'catalog',return_value=['first','second']),patch.object(blue,'manifest',side_effect=lambda root:deepcopy(states[root])),patch.object(blue,'stats',return_value={'seconds':1,'peak':.5,'sampleRate':44100}):
    blue.activate(SimpleNamespace(cache_dir=cache),roots,meta)
   for root in roots:
    data=json.loads(states[root][0].read_text().split(' = ',1)[1].rstrip(';\n'))
    self.assertEqual(data['en'],{'hello':'audio/en/hello.mp3'})
    self.assertEqual(data['he'],{'first':'audio/he/blue-first.mp3','second':'audio/he/blue-second.mp3'})
    provenance=blue.read_json(root/'scripts/hebrew/blue-recordings.json')
    self.assertEqual(provenance['voice'],'libri_female_6147')
    self.assertEqual(provenance['previousPaths'],['audio/he/old.mp3'])
 def test_new_voice_or_pronunciation_cannot_reuse_old_cache_urls(self):
  base={'voice':'libri_female_6147','speed':.8}
  key=blue.identity(base,'שִׁין','ʃˈin')
  self.assertEqual(key,blue.identity(base,'שִׁין','ʃˈin'))
  self.assertNotEqual(key,blue.identity({**base,'voice':'another voice'},'שִׁין','ʃˈin'))
  self.assertNotEqual(key,blue.identity(base,'שִׁין','sˈin'))

if __name__=='__main__':unittest.main()
