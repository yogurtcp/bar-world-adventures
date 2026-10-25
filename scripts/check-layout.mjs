import {chromium} from '@playwright/test';
const browser=await chromium.launch({executablePath:'/usr/bin/google-chrome',headless:true,args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:1366,height:900},serviceWorkers:'block'});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://127.0.0.1:4186');await page.locator('.country-scene').waitFor();await page.screenshot({path:'artifacts/explore-desktop.png',fullPage:true});
console.log('Page',await page.title(),'errors',errors);
for(const[width,height,label]of[[1024,768,'tablet-landscape'],[768,1024,'tablet-portrait'],[1280,800,'desktop'],[1180,820,'ipad-landscape'],[390,844,'phone'],[896,414,'phone-landscape']]){await page.setViewportSize({width,height});await page.screenshot({path:`artifacts/explore-${label}.png`,fullPage:true});console.log(label,await page.evaluate(()=>({width:innerWidth,height:innerHeight,scrollWidth:document.documentElement.scrollWidth,scrollHeight:document.documentElement.scrollHeight,card:document.querySelector('.country-panel').getBoundingClientRect().toJSON()})));}
await page.setViewportSize({width:1366,height:900});await page.locator('[data-action=games]').first().click();await page.screenshot({path:'artifacts/games-desktop.png',fullPage:true});
await page.locator('[data-mode=nameShape]').click();await page.screenshot({path:'artifacts/shape-quiz.png',fullPage:true});console.log('Shape path exists:',(await page.locator('.visual-prompt path').getAttribute('d')).length>50);
await browser.close();
