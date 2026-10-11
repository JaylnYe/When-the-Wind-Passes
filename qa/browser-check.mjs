import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const browser=await chromium.launch({headless:true,...(process.env.CHROME_EXECUTABLE_PATH?{executablePath:process.env.CHROME_EXECUTABLE_PATH}:{})});
try{
 const page=await browser.newPage({viewport:{width:1200,height:900}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8765');await page.waitForTimeout(300);
 assert.equal(await page.locator('body').innerText(),'');assert.equal(await page.locator('button').count(),3);
 const before=await page.locator('canvas').evaluate(el=>el.toDataURL());
 await page.getByRole('button',{name:'轻吹一下'}).click();await page.waitForTimeout(600);
 assert.equal((await page.locator('canvas').evaluate(el=>el.toDataURL()))===before,false,'breeze must change the tree');
 await page.getByRole('button',{name:'重新长满'}).click();await page.waitForTimeout(100);
 assert.equal((await page.locator('canvas').evaluate(el=>el.toDataURL()))===before,true,'reset restores original scene');
 await page.emulateMedia({reducedMotion:'reduce'});await page.getByRole('button',{name:'轻吹一下'}).click();await page.waitForTimeout(600);
 await page.getByRole('button',{name:'切换到银杏树'}).click();await page.waitForTimeout(100);
 assert.equal(await page.getByRole('button',{name:'切换到枫树'}).count(),1);
 await page.getByRole('button',{name:'轻吹一下'}).click();await page.waitForTimeout(600);
 await page.getByRole('button',{name:'重新长满'}).click();
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(100);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 assert.deepEqual(errors,[]);console.log('Passed: no visible text, three icon buttons, two trees, breeze, reset, system motion preference and mobile layout.');
}finally{await browser.close()}
