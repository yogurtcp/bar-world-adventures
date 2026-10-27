// Major physical features. Marker locations are teaching anchors, not surveyed boundaries.
export const natureCategories={
 all:{en:'All nature',he:'כל הטבע',icon:'🌍'},ocean:{en:'Oceans',he:'אוקיינוסים',icon:'🌊'},polar:{en:'Polar regions',he:'אזורי הקטבים',icon:'🧊'},sea:{en:'Seas and lakes',he:'ימים ואגמים',icon:'⛵'},mountain:{en:'Mountains',he:'הרים',icon:'⛰️'},desert:{en:'Deserts',he:'מדבריות',icon:'🏜️'},river:{en:'Rivers',he:'נהרות',icon:'🏞️'},forest:{en:'Forests',he:'יערות',icon:'🌳'},wonder:{en:'Natural wonders',he:'פלאי טבע',icon:'✨'},
};
// key, category, English, Hebrew, longitude, latitude, English fact, Hebrew fact, optional geometry name.
const rows=[
 ['pacific','ocean','Pacific Ocean','האוקיינוס השקט',-150,0,'The Pacific is the largest ocean. It stretches between the Americas and Asia and Australia.','האוקיינוס השקט הוא הגדול באוקיינוסים. הוא משתרע בין אמריקה לבין אסיה ואוסטרליה.','Pacific Ocean'],
 ['atlantic','ocean','Atlantic Ocean','האוקיינוס האטלנטי',-35,15,'The Atlantic Ocean lies between the Americas and Europe and Africa.','האוקיינוס האטלנטי נמצא בין אמריקה לבין אירופה ואפריקה.','Atlantic Ocean'],
 ['indian','ocean','Indian Ocean','האוקיינוס ההודי',78,-25,'The Indian Ocean lies between Africa, Asia and Australia.','האוקיינוס ההודי נמצא בין אפריקה, אסיה ואוסטרליה.','INDIAN OCEAN'],
 ['southern','ocean','Southern Ocean','האוקיינוס הדרומי',20,-62,'The Southern Ocean surrounds the icy continent of Antarctica.','האוקיינוס הדרומי מקיף את יבשת אנטרקטיקה הקפואה.','SOUTHERN OCEAN'],
 ['arctic-ocean','ocean','Arctic Ocean','אוקיינוס הקרח הצפוני',-130,79,'The Arctic Ocean is the smallest ocean. It lies around the North Pole.','אוקיינוס הקרח הצפוני הוא הקטן באוקיינוסים. הוא נמצא סביב הקוטב הצפוני.','Arctic Ocean'],
 ['arctic','polar','Arctic','האזור הארקטי',0,88,'The Arctic is the polar region around the North Pole, with ocean, islands and northern lands.','האזור הארקטי מקיף את הקוטב הצפוני, ויש בו ים, איים ויבשה צפונית.','Arctic'],
 ['antarctica','polar','Antarctica','אנטרקטיקה',0,-83,'Antarctica is an ice-covered continent around the South Pole. The Southern Ocean surrounds it.','אנטרקטיקה היא יבשת מכוסה קרח סביב הקוטב הדרומי. האוקיינוס הדרומי מקיף אותה.','ANTARCTICA'],
 ['mediterranean','sea','Mediterranean Sea','הים התיכון',18,35,'The Mediterranean Sea lies between Europe, Africa and Asia. Israel has a coast on this sea.','הים התיכון נמצא בין אירופה, אפריקה ואסיה. לישראל יש חוף בים הזה.','Mediterranean Sea'],
 ['black-sea','sea','Black Sea','הים השחור',35,43,'The Black Sea lies between southeastern Europe and western Asia.','הים השחור נמצא בין דרום מזרח אירופה למערב אסיה.','Black Sea'],
 ['red-sea','sea','Red Sea','הים האדום',38,21,'The Red Sea is a long, narrow sea between Africa and the Arabian Peninsula.','הים האדום הוא ים ארוך וצר בין אפריקה לחצי האי ערב.','Red Sea'],
 ['arabian-sea','sea','Arabian Sea','הים הערבי',64,16,'The Arabian Sea is part of the Indian Ocean, beside the Arabian Peninsula and India.','הים הערבי הוא חלק מהאוקיינוס ההודי, ליד חצי האי ערב והודו.','Arabian Sea'],
 ['caribbean','sea','Caribbean Sea','הים הקריבי',-75,15,'The Caribbean Sea lies between Central America, South America and the Caribbean islands.','הים הקריבי נמצא בין אמריקה המרכזית, אמריקה הדרומית והאיים הקריביים.','Caribbean Sea'],
 ['south-china-sea','sea','South China Sea','ים סין הדרומי',114,13,'The South China Sea lies beside southern China and Southeast Asia.','ים סין הדרומי נמצא ליד דרום סין ודרום מזרח אסיה.','South China Sea'],
 ['bering','sea','Bering Sea','ים ברינג',-175,58,'The Bering Sea lies between Alaska and eastern Russia, near the Arctic.','ים ברינג נמצא בין אלסקה למזרח רוסיה, ליד האזור הארקטי.'],
 ['baltic','sea','Baltic Sea','הים הבלטי',20,57,'The Baltic Sea lies in northern Europe, beside Sweden, Finland and the Baltic countries.','הים הבלטי נמצא בצפון אירופה, ליד שוודיה, פינלנד והמדינות הבלטיות.'],
 ['north-sea','sea','North Sea','הים הצפוני',3,56,'The North Sea lies between Great Britain and mainland northern Europe.','הים הצפוני נמצא בין בריטניה ליבשת אירופה הצפונית.'],
 ['caspian','sea','Caspian Sea','הים הכספי',51,41,'Despite its name, the Caspian Sea is an enclosed lake between Europe and Asia.','למרות שמו, הים הכספי הוא אגם סגור בין אירופה לאסיה.','Caspian Sea'],
 ['dead-sea','sea','Dead Sea','ים המלח',35.47,31.5,'The Dead Sea is a very salty lake in the Jordan Rift Valley.','ים המלח הוא אגם מלוח מאוד בבקעת הירדן.'],
 ['galilee','sea','Sea of Galilee','הכינרת',35.58,32.83,'The Sea of Galilee is a freshwater lake in northern Israel.','הכינרת היא אגם של מים מתוקים בצפון ישראל.'],
 ['victoria-lake','sea','Lake Victoria','אגם ויקטוריה',33,-1,'Lake Victoria is a large freshwater lake in East Africa.','אגם ויקטוריה הוא אגם גדול של מים מתוקים במזרח אפריקה.'],
 ['baikal','sea','Lake Baikal','ימת באיקל',108,53,'Lake Baikal is a very deep freshwater lake in Siberia, Russia.','ימת באיקל היא אגם עמוק מאוד של מים מתוקים בסיביר שברוסיה.'],
 ['great-lakes','sea','Great Lakes','הימות הגדולות',-85,45,'The Great Lakes are five large lakes in the United States and Canada.','הימות הגדולות הן חמישה אגמים גדולים בארצות הברית ובקנדה.'],
 ['himalayas','mountain','Himalayas','הרי ההימלאיה',86,29,'The Himalayas are a high mountain range in Asia. Mount Everest is part of this range.','הרי ההימלאיה הם רכס הרים גבוה באסיה. הר האוורסט נמצא ברכס הזה.','HIMALAYAS'],
 ['everest','mountain','Mount Everest','הר האוורסט',86.925,27.988,'Mount Everest rises in the Himalayas, on the border between Nepal and China.','הר האוורסט מתנשא בהרי ההימלאיה, על הגבול בין נפאל לסין.'],
 ['andes','mountain','Andes','הרי האנדים',-71,-20,'The Andes stretch along the western side of South America.','הרי האנדים נמשכים לאורך הצד המערבי של אמריקה הדרומית.','ANDES'],
 ['rockies','mountain','Rocky Mountains','הרי הרוקי',-111,45,'The Rocky Mountains stretch through western Canada and the United States.','הרי הרוקי משתרעים במערב קנדה וארצות הברית.','ROCKY MOUNTAINS'],
 ['alps','mountain','Alps','הרי האלפים',10,46,'The Alps are a mountain range in Europe, with snowy peaks and green valleys.','הרי האלפים הם רכס הרים באירופה, עם פסגות מושלגות ועמקים ירוקים.','ALPS'],
 ['atlas','mountain','Atlas Mountains','הרי האטלס',-5,31,'The Atlas Mountains lie in northwestern Africa, near the Sahara.','הרי האטלס נמצאים בצפון מערב אפריקה, ליד מדבר סהרה.'],
 ['urals','mountain','Ural Mountains','הרי אורל',60,59,'The Ural Mountains form part of the usual boundary between Europe and Asia.','הרי אורל הם חלק מהגבול הגאוגרפי המקובל בין אירופה לאסיה.','URAL MOUNTAINS'],
 ['sahara','desert','Sahara Desert','מדבר סהרה',13,24,'The Sahara is a huge desert in northern Africa. It has sand, rocks and mountains.','סהרה הוא מדבר ענק בצפון אפריקה. יש בו חול, סלעים והרים.','SAHARA'],
 ['arabian-desert','desert','Arabian Desert','המדבר הערבי',46,24,'The Arabian Desert covers much of the Arabian Peninsula in western Asia.','המדבר הערבי מכסה חלק גדול מחצי האי ערב שבמערב אסיה.'],
 ['gobi','desert','Gobi Desert','מדבר גובי',103,42,'The Gobi is a desert in Mongolia and northern China. Its winters can be very cold.','גובי הוא מדבר במונגוליה ובצפון סין. החורף בו יכול להיות קר מאוד.','GOBI DESERT'],
 ['kalahari','desert','Kalahari Desert','מדבר קלהרי',23,-23,'The Kalahari is a broad, dry region in southern Africa. Plants and animals live there.','קלהרי הוא אזור יבש ורחב בדרום אפריקה. חיים בו צמחים ובעלי חיים.'],
 ['namib','desert','Namib Desert','מדבר נמיב',15,-24,'The Namib Desert lies along the Atlantic coast of southwestern Africa.','מדבר נמיב נמצא לאורך חוף האוקיינוס האטלנטי בדרום מערב אפריקה.'],
 ['atacama','desert','Atacama Desert','מדבר אטקמה',-69,-24,'The Atacama is a very dry desert in northern Chile, beside the Pacific Ocean.','אטקמה הוא מדבר יבש מאוד בצפון צ׳ילה, ליד האוקיינוס השקט.'],
 ['great-victoria','desert','Great Victoria Desert','מדבר ויקטוריה הגדול',129,-29,'The Great Victoria Desert lies in southern Australia. It is far from Lake Victoria in Africa.','מדבר ויקטוריה הגדול נמצא בדרום אוסטרליה. הוא רחוק מאגם ויקטוריה שבאפריקה.'],
 ['nile','river','Nile River','נהר הנילוס',31,24,'The Nile flows through northeastern Africa and reaches the Mediterranean Sea.','נהר הנילוס זורם בצפון מזרח אפריקה ונשפך לים התיכון.','Nile'],
 ['amazon-river','river','Amazon River','נהר האמזונס',-60,-3,'The Amazon is a great river flowing across northern South America to the Atlantic Ocean.','האמזונס הוא נהר גדול הזורם בצפון אמריקה הדרומית אל האוקיינוס האטלנטי.','Amazonas'],
 ['mississippi','river','Mississippi River','נהר המיסיסיפי',-91,35,'The Mississippi flows south through the middle of the United States.','המיסיסיפי זורם דרומה במרכז ארצות הברית.','Mississippi'],
 ['yangtze','river','Yangtze River','נהר היאנגצה',111,30,'The Yangtze flows across China from western mountains toward the sea in the east.','נהר היאנגצה זורם בסין, מההרים במערב אל הים במזרח.','Yangtze'],
 ['ganges','river','Ganges River','נהר הגנגס',84,26,'The Ganges flows from the Himalayas through India and Bangladesh.','נהר הגנגס זורם מהרי ההימלאיה דרך הודו ובנגלדש.'],
 ['danube','river','Danube River','נהר הדנובה',21,45,'The Danube crosses several European countries before reaching the Black Sea.','הדנובה חוצה כמה מדינות באירופה ונשפכת לים השחור.','Donau'],
 ['congo-river','river','Congo River','נהר הקונגו',20,-2,'The Congo River winds through central Africa and reaches the Atlantic Ocean.','נהר הקונגו מתפתל במרכז אפריקה ונשפך לאוקיינוס האטלנטי.','Congo'],
 ['mekong','river','Mekong River','נהר המקונג',104,18,'The Mekong flows through mainland Southeast Asia toward the sea.','נהר המקונג זורם ביבשת דרום מזרח אסיה אל הים.','Mekong'],
 ['volga','river','Volga River','נהר הוולגה',46,49,'The Volga flows through western Russia and reaches the Caspian Sea.','נהר הוולגה זורם במערב רוסיה ונשפך לים הכספי.'],
 ['amazon-forest','forest','Amazon Rainforest','יער האמזונס',-62,-7,'The Amazon rainforest is a huge tropical forest in South America, around the Amazon River.','יער האמזונס הוא יער גשם טרופי ענק באמריקה הדרומית, סביב נהר האמזונס.'],
 ['congo-forest','forest','Congo Rainforest','יער הקונגו',23,0,'The Congo rainforest is a tropical forest in central Africa, around the Congo River.','יער הקונגו הוא יער גשם טרופי במרכז אפריקה, סביב נהר הקונגו.'],
 ['taiga','forest','Taiga','יער הטייגה',100,62,'The taiga is a belt of northern forest stretching across parts of Europe, Asia and North America.','הטייגה היא חגורה של יערות צפוניים בחלקים מאירופה, אסיה ואמריקה הצפונית.'],
 ['barrier-reef','wonder','Great Barrier Reef','שונית המחסום הגדולה',148,-19,'The Great Barrier Reef is a huge coral reef system off northeastern Australia. Many sea animals live there.','שונית המחסום הגדולה היא מערכת גדולה של שוניות אלמוגים ליד צפון מזרח אוסטרליה. חיים בה בעלי חיים ימיים רבים.'],
 ['grand-canyon','wonder','Grand Canyon','הגרנד קניון',-112,36,'The Grand Canyon is a deep canyon in Arizona in the United States. The Colorado River flows through it.','הגרנד קניון הוא קניון עמוק באריזונה שבארצות הברית. נהר הקולורדו זורם בו.'],
 ['victoria-falls','wonder','Victoria Falls','מפלי ויקטוריה',25.86,-17.92,'Victoria Falls are waterfalls on the Zambezi River, between Zambia and Zimbabwe.','מפלי ויקטוריה הם מפלים על נהר הזמבזי, בין זמביה לזימבבואה.'],
];
const noArticle=new Set(['antarctica','everest','victoria-lake','baikal','victoria-falls']);
export const naturePlaces=rows.map(([key,category,en,he,lon,lat,factEn,factHe,geometryKey])=>({id:`geo-${key}`,category,en,he,lon,lat,factEn,factHe,geometryKey,icon:natureCategories[category].icon,article:!noArticle.has(key),aliases:key==='arctic'?'Arctica ארקטיקה':key==='antarctica'?'Antarctic אנטרקטיקה':key==='himalayas'?'Himalaya Himmalaya הימליה':key==='sahara'?'Sahara סהרה':key==='mediterranean'?'Mediterranean Middeteranean ים תיכון':''}));
export const natureById=Object.fromEntries(naturePlaces.map(place=>[place.id,place]));
const plurals=new Set(['geo-great-lakes','geo-himalayas','geo-andes','geo-rockies','geo-alps','geo-atlas','geo-urals','geo-victoria-falls']);
export const naturePrompt=(place,locale)=>locale==='he'?`איפה ${place.he}?`:`Where ${plurals.has(place.id)?'are':'is'} ${place.article?'the ':''}${place.en}?`;
export function filterNature(category='all',query='') {const needle=query.trim().toLocaleLowerCase();return naturePlaces.filter(p=>(category==='all'||p.category===category)&&`${p.en} ${p.he} ${p.aliases}`.toLocaleLowerCase().includes(needle));}
