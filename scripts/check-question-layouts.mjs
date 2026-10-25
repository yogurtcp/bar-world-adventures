import{chromium}from'@playwright/test';
import assert from'node:assert/strict';
import{emptySave,makeRound}from'../src/model.js';
import{modeKeys}from'../src/i18n.js';
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/usr/bin/google-chrome',headless:true,args:['--no-sandbox']});const results=[];
try{
 for(const locale of ['he','en'])for(const mode of modeKeys){
  const context=await browser.newContext({viewport:{width:1024,height:768},serviceWorkers:'block'}),page=await context.newPage();
  const fixture=emptySave();fixture.locale=locale;fixture.muted=true;fixture.gentle=true;fixture.view='question';fixture.round=makeRound(mode,()=>0);
  const target=mode==='animalGame'?140:180;fixture.round.deck[0]={target,options:[target,...[180,140,804,398].filter(id=>id!==target)]};
  await page.addInitScript(save=>localStorage.setItem('bar-world-v1',JSON.stringify(save)),fixture);await page.goto(process.env.BASE_URL||'http://127.0.0.1:4186');await page.locator('.question-page').waitFor();
  for(const[width,height]of[[1024,768],[768,1024]]){await page.setViewportSize({width,height});const dimensions=await page.evaluate(()=>({width:innerWidth,height:innerHeight,scrollWidth:document.documentElement.scrollWidth,scrollHeight:document.documentElement.scrollHeight}));results.push({locale,mode,...dimensions});if(width===1024)await page.screenshot({path:`artifacts/question-${locale}-${mode}.png`,fullPage:true});}
  await context.close();
 }
 console.log(JSON.stringify(results,null,2));assert.ok(results.every(r=>r.scrollWidth<=r.width&&r.scrollHeight<=r.height),'All long country/animal prompts fit tablet landscape and portrait');console.log('LONG QUESTION LAYOUTS PASSED');
}finally{await browser.close();}
