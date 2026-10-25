import {extraRows,extraLanguages} from './countries-extra.js';
// Geography: Natural Earth via world-atlas (public domain). Illustrations are playful travel scenes.
const rows = [
// id, iso, English, Hebrew, region, lon, lat, animal en/he, place en/he, language, hello, goodbye, transliterations
[376,'IL','Israel','ישראל','asia',35,31.5,'Gazelle','צבי','Jerusalem’s Old City walls','חומות העיר העתיקה בירושלים','he','שלום','להתראות','Shalom','Lehitraot'],
[250,'FR','France','צרפת','europe',2,47,'Red fox','שועל אדום','Eiffel Tower','מגדל אייפל','fr','Bonjour','Au revoir','Bonjour','Au revoir'],
[380,'IT','Italy','איטליה','europe',12.5,42.5,'Wolf','זאב','Colosseum','הקולוסיאום','it','Ciao','Arrivederci','Ciao','Arrivederci'],
[300,'GR','Greece','יוון','europe',23,39,'Sea turtle','צב ים','Parthenon','הפרתנון','el','Γεια σου','Αντίο','Yia sou','Adio'],
[724,'ES','Spain','ספרד','europe',-4,40,'Iberian lynx','שונר איברי','Sagrada Família','סגרדה פמיליה','es','Hola','Adiós','Hola','Adiós'],
[826,'GB','United Kingdom','בריטניה','europe',-2,54,'Hedgehog','קיפוד','Big Ben','ביג בן','en','Hello','Goodbye','Hello','Goodbye'],
[276,'DE','Germany','גרמניה','europe',10,51,'Red squirrel','סנאי אדום','Neuschwanstein Castle','טירת נוישוונשטיין','de','Hallo','Auf Wiedersehen','Hallo','Auf Wiedersehen'],
[528,'NL','Netherlands','הולנד','europe',5.5,52,'Rabbit','ארנב','Windmill','טחנת רוח','nl','Hallo','Tot ziens','Hallo','Tot ziens'],
[756,'CH','Switzerland','שווייץ','europe',8.3,47,'Alpine ibex','יעל אלפיני','Alpine chalet','בקתה אלפינית','de','Hallo','Auf Wiedersehen','Hallo','Auf Wiedersehen'],
[578,'NO','Norway','נורווגיה','europe',9,62,'Puffin','תוכי ים','Stave church','כנסיית עץ נורווגית','nb','Hei','Ha det','Hei','Ha det'],
[752,'SE','Sweden','שוודיה','europe',16,62,'Moose','אייל קורא','Stockholm City Hall','בית העירייה של סטוקהולם','sv','Hej','Hej då','Hej','Hej då'],
[643,'RU','Russia','רוסיה','asia',95,61,'Brown bear','דוב חום','Saint Basil’s Cathedral','קתדרלת וסילי הקדוש','ru','Привет','До свидания','Privet','Do svidaniya'],
[792,'TR','Turkey','טורקיה','asia',35,39,'Angora cat','חתול אנגורה','Galata Tower','מגדל גלאטה','tr','Merhaba','Hoşça kal','Merhaba','Hoşça kal'],
[818,'EG','Egypt','מצרים','africa',30,27,'Camel','גמל','Pyramids of Giza','הפירמידות בגיזה','ar','مرحباً','مع السلامة','Marhaban','Ma’a as-salama'],
[504,'MA','Morocco','מרוקו','africa',-7,32,'Fennec fox','פנק','Chefchaouen','שפשאוון','ar','مرحباً','مع السلامة','Marhaban','Ma’a as-salama'],
[404,'KE','Kenya','קניה','africa',38,0,'Giraffe','ג׳ירפה','Thatched house','בית עם גג קש','sw','Jambo','Kwaheri','Jambo','Kwaheri'],
[710,'ZA','South Africa','דרום אפריקה','africa',25,-29,'African penguin','פינגווין אפריקני','Bo-Kaap houses','בתי בו קאפ','en','Hello','Goodbye','Hello','Goodbye'],
[450,'MG','Madagascar','מדגסקר','africa',47,-19,'Ring-tailed lemur','למור זנב טבעת','Baobab tree','עץ באובב','fr','Bonjour','Au revoir','Bonjour','Au revoir'],
[356,'IN','India','הודו','asia',79,23,'Bengal tiger','טיגריס בנגלי','Taj Mahal','טאג׳ מהאל','hi','नमस्ते','अलविदा','Namaste','Alvida'],
[156,'CN','China','סין','asia',104,35,'Giant panda','פנדה ענקית','Great Wall of China','החומה הסינית','zh','你好','再见','Nǐ hǎo','Zàijiàn'],
[392,'JP','Japan','יפן','asia',138,37,'Red-crowned crane','עגור אדום כתר','Five-story pagoda','פגודה בת חמש קומות','ja','こんにちは','さようなら','Konnichiwa','Sayōnara'],
[410,'KR','South Korea','קוריאה הדרומית','asia',128,36,'Korean magpie','עקעק קוריאני','Gyeongbokgung Palace','ארמון גיונגבוק','ko','안녕하세요','안녕히 가세요','Annyeonghaseyo','Annyeonghi gaseyo'],
[764,'TH','Thailand','תאילנד','asia',101,15,'Asian elephant','פיל אסייתי','Thai temple','מקדש תאילנדי','th','สวัสดี','ลาก่อน','Sawasdee','La gon'],
[704,'VN','Vietnam','וייטנאם','asia',107,16,'Water buffalo','תאו מים','One Pillar Pagoda','פגודת העמוד האחד','vi','Xin chào','Tạm biệt','Xin chào','Tạm biệt'],
[360,'ID','Indonesia','אינדונזיה','asia',118,-3,'Orangutan','אורנגאוטן','Borobudur','בורובודור','id','Halo','Sampai jumpa','Halo','Sampai jumpa'],
[608,'PH','Philippines','הפיליפינים','asia',122,12,'Philippine tarsier','קופיף פיליפיני','Bahay kubo','בית במבוק פיליפיני','fil','Kumusta','Paalam','Kumusta','Paalam'],
[784,'AE','United Arab Emirates','איחוד האמירויות','asia',54,24,'Arabian oryx','ראם לבן','Burj Khalifa','בורג׳ ח׳ליפה','ar','مرحباً','مع السلامة','Marhaban','Ma’a as-salama'],
[36,'AU','Australia','אוסטרליה','oceania',134,-25,'Kangaroo','קנגורו','Sydney Opera House','בית האופרה של סידני','en','Hello','Goodbye','Hello','Goodbye'],
[554,'NZ','New Zealand','ניו זילנד','oceania',173,-41,'Kiwi','קיווי','New Zealand farmhouse','בית חווה בניו זילנד','en','Hello','Goodbye','Hello','Goodbye'],
[840,'US','United States','ארצות הברית','americas',-100,39,'Bald eagle','עיטם לבן ראש','Statue of Liberty','פסל החירות','en','Hello','Goodbye','Hello','Goodbye'],
[124,'CA','Canada','קנדה','americas',-105,57,'Beaver','בונה','CN Tower','מגדל סי אן','en','Hello','Goodbye','Hello','Goodbye'],
[484,'MX','Mexico','מקסיקו','americas',-102,24,'Axolotl','אקסולוטל','Chichén Itzá','צ׳יצ׳ן איצה','es','Hola','Adiós','Hola','Adiós'],
[76,'BR','Brazil','ברזיל','americas',-52,-12,'Toucan','טוקן','Christ the Redeemer','פסל ישו הגואל','pt','Olá','Tchau','Olá','Tchau'],
[32,'AR','Argentina','ארגנטינה','americas',-64,-35,'Capybara','קפיברה','Casa Rosada','הבית הוורוד','es','Hola','Adiós','Hola','Adiós'],
[604,'PE','Peru','פרו','americas',-75,-10,'Llama','לאמה','Machu Picchu','מאצ׳ו פיצ׳ו','es','Hola','Adiós','Hola','Adiós'],
[152,'CL','Chile','צ׳ילה','americas',-71,-33,'Andean condor','קונדור האנדים','Moai on Rapa Nui','מואי באי הפסחא','es','Hola','Adiós','Hola','Adiós']
];
const animals=['🦌','🦊','🐺','🐢','🐈','🦔','🐿️','🐇','🐐','🐧','🫎','🐻','🐈','🐪','🦊','🦒','🐧','🐒','🐅','🐼','🦩','🐦','🐘','🐃','🦧','🐒','🦌','🦘','🐤','🦅','🦫','🦎','🦜','🐹','🦙','🦅'];
export const countries=[...rows,...extraRows].map((r,i)=>{const[id,iso,en,he,region,lon,lat,animalEn,animalHe,placeEn,placeHe,language,hello,goodbye,helloLatin,goodbyeLatin,animalIcon,outfit]=r;return {id,iso,en,he,region,lon,lat,animalEn,animalHe,placeEn,placeHe,language,hello,goodbye,helloLatin,goodbyeLatin,animal:animalIcon||animals[i],outfit,art:`assets/countries/${iso.toLowerCase()}.webp`,index:i,flag:String.fromCodePoint(...iso.split('').map(x=>127397+x.charCodeAt(0)))};});
export const byId=Object.fromEntries(countries.map(c=>[c.id,c]));
export const languages={...extraLanguages,he:['Hebrew','עברית'],en:['English','אנגלית'],fr:['French','צרפתית'],it:['Italian','איטלקית'],el:['Greek','יוונית'],es:['Spanish','ספרדית'],de:['German','גרמנית'],nl:['Dutch','הולנדית'],nb:['Norwegian','נורווגית'],sv:['Swedish','שוודית'],ru:['Russian','רוסית'],tr:['Turkish','טורקית'],ar:['Arabic','ערבית'],sw:['Swahili','סווהילית'],hi:['Hindi','הינדי'],zh:['Mandarin Chinese','סינית מנדרינית'],ja:['Japanese','יפנית'],ko:['Korean','קוריאנית'],th:['Thai','תאית'],vi:['Vietnamese','וייטנאמית'],id:['Indonesian','אינדונזית'],fil:['Filipino','פיליפינית'],pt:['Portuguese','פורטוגזית']};
export const regions={all:['Everywhere','כל העולם'],europe:['Europe','אירופה'],asia:['Asia','אסיה'],africa:['Africa','אפריקה'],americas:['Americas','אמריקה'],oceania:['Oceania','אוקיאניה']};
