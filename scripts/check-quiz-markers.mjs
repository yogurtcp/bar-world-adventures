import{chromium}from'@playwright/test';
import assert from'node:assert/strict';
import{emptySave,makeRound}from'../src/model.js';
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/usr/bin/google-chrome',headless:true,args:['--no-sandbox']});
const nearby=[440,428,233,112];let tested=0;
try{for(const mode of ['findName','findShape'])for(const target of nearby){
 const context=await browser.newContext({viewport:{width:1024,height:768},serviceWorkers:'block'}),page=await context.newPage();const save=emptySave();save.gentle=true;save.muted=true;save.view='question';save.round=makeRound(mode,()=>0);save.round.deck[0]={target,options:nearby};
 await page.addInitScript(s=>localStorage.setItem('bar-world-v1',JSON.stringify(s)),save);await page.goto(process.env.BASE_URL||'http://127.0.0.1:4186');await page.locator('.question-page').waitFor();await page.locator(`[data-focus="${target}"]`).click({noWaitAfter:true});
 const boxes=await page.locator('[data-pin]').evaluateAll(nodes=>nodes.map(n=>{const b=n.getBoundingClientRect();return{x:b.x,y:b.y,width:b.width,height:b.height};}));
 for(let a=0;a<boxes.length;a++)for(let b=a+1;b<boxes.length;b++){const x=boxes[a],y=boxes[b];assert.ok(x.x+x.width<=y.x||y.x+y.width<=x.x||x.y+x.height<=y.y||y.y+y.height<=x.y,'Nearby country marker hit targets must not overlap');}
 await page.locator(`[data-pin="${target}"]`).click({noWaitAfter:true});await page.locator('.feedback.success').waitFor();const updated=await page.evaluate(()=>JSON.parse(localStorage.getItem('bar-world-v1')));assert.equal(updated.stars,1);assert.equal(updated.round.answered,true);tested++;
 if(target===112&&mode==='findName')await page.screenshot({path:'artifacts/nearby-country-markers.png',fullPage:true});await context.close();
}console.log(`NEARBY QUIZ MARKERS PASSED: ${tested} real pointer answers across both globe activities`);}finally{await browser.close();}
