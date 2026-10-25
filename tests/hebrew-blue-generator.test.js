import test from 'node:test';
import {execFileSync} from 'node:child_process';
test('local Hebrew generation switches only complete releases and preserves other voices',()=>{
 execFileSync('python3',['scripts/test-hebrew-blue-generator.py'],{cwd:new URL('../',import.meta.url),stdio:'pipe'});
});
