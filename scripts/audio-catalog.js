import {naturePlaces,natureCategories,naturePrompt} from '../src/nature.js';
import {countries,languages} from '../src/countries.js';
import {strings} from '../src/i18n.js';
const catalog={he:new Set(),en:new Set()};
for(const lang of ['he','en']){for(const c of countries){catalog[lang].add(c[lang]);catalog[lang].add(c[lang==='he'?'animalHe':'animalEn']);catalog[lang].add(c[lang==='he'?'placeHe':'placeEn']);}for(const s of Object.values(languages))catalog[lang].add(s[lang==='he'?1:0]);for(const k of ['great','again','done','welcome','findNameSub','findShapeSub','nameShapeSub','shapeNameSub','animalGameSub','thisShape','whoseShape','hintShown','stamp','sayHello','sayGoodbye'])catalog[lang].add(strings[lang][k]);for(const c of countries){catalog[lang].add(`${strings[lang].find} ${c[lang]}?`);catalog[lang].add(`${strings[lang].chooseShape} ${c[lang]}`);catalog[lang].add(`${strings[lang].whoseAnimal} ${c[lang==='he'?'animalHe':'animalEn']}?`);}}
for(const c of countries){catalog[c.language]??=new Set();catalog[c.language].add(c.hello);catalog[c.language].add(c.goodbye);}
for(const lang of ['he','en']){
 for(const place of naturePlaces){catalog[lang].add(place[lang]);catalog[lang].add(place[lang==='he'?'factHe':'factEn']);catalog[lang].add(naturePrompt(place,lang));}
 for(const category of Object.values(natureCategories))catalog[lang].add(category[lang]);
 for(const key of ['natureGameSub','natureWelcome','natureHint'])catalog[lang].add(strings[lang][key]);
}
console.log(JSON.stringify(Object.fromEntries(Object.entries(catalog).map(([k,s])=>[k,[...s]]))));
