import {countries,languages} from '../src/countries.js';
import {strings} from '../src/i18n.js';
const catalog={he:new Set(),en:new Set()};
for(const lang of ['he','en']){for(const c of countries){catalog[lang].add(c[lang]);catalog[lang].add(c[lang==='he'?'animalHe':'animalEn']);catalog[lang].add(c[lang==='he'?'placeHe':'placeEn']);}for(const s of Object.values(languages))catalog[lang].add(s[lang==='he'?1:0]);for(const k of ['great','again','done','welcome','findNameSub','findShapeSub','nameShapeSub','shapeNameSub','animalGameSub','thisShape','whoseShape','hintShown','stamp','sayHello','sayGoodbye'])catalog[lang].add(strings[lang][k]);for(const c of countries){catalog[lang].add(`${strings[lang].find} ${c[lang]}?`);catalog[lang].add(`${strings[lang].chooseShape} ${c[lang]}`);catalog[lang].add(`${strings[lang].whoseAnimal} ${c[lang==='he'?'animalHe':'animalEn']}?`);}}
for(const c of countries){catalog[c.language]??=new Set();catalog[c.language].add(c.hello);catalog[c.language].add(c.goodbye);}
console.log(JSON.stringify(Object.fromEntries(Object.entries(catalog).map(([k,s])=>[k,[...s]]))));
