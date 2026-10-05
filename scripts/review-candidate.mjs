/** Optional visual/parity QA in a fresh headless browser, never a signed-in profile. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { ROOT } from './public-content.mjs';
import { createPreviewServer } from './preview.mjs';

if (!process.env.SITE_PLAYWRIGHT_MODULE || !process.env.SITE_BROWSER_EXECUTABLE)
  throw new Error('Set SITE_PLAYWRIGHT_MODULE and SITE_BROWSER_EXECUTABLE to existing local QA tools');
const { chromium } = await import(pathToFileURL(process.env.SITE_PLAYWRIGHT_MODULE).href);
const candidate=path.resolve(process.argv[2] || 'tmp/candidates/p01-p02-final');
const evidence=path.resolve('tmp/p02-review');fs.mkdirSync(evidence,{recursive:true});
const baselineServer=createPreviewServer(ROOT),candidateServer=createPreviewServer(candidate);
for (const server of [baselineServer,candidateServer]) await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const url=server=>`http://127.0.0.1:${server.address().port}/hao-yu-website/`;
const browser=await chromium.launch({executablePath:process.env.SITE_BROWSER_EXECUTABLE,headless:true});
try {
  const results=[];
  for(const width of [375,768,1440]) {
    const context=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'});
    const baseline=await context.newPage(),page=await context.newPage();
    for(const [tab,target] of [[baseline,url(baselineServer)],[page,url(candidateServer)]]) {
      await tab.goto(target);await tab.evaluate(()=>document.fonts.ready);
    }
    const snapshot=tab=>tab.evaluate(()=>({
      text:document.body.innerText.replace(/\s+/g,' ').trim(),
      links:[...document.querySelectorAll('a')].map(a=>[a.getAttribute('href'),a.textContent.replace(/\s+/g,' ').trim()]),
      meta:[...document.querySelectorAll('meta')].map(m=>[m.getAttribute('name')||m.getAttribute('property'),m.content]),
      ids:[...document.querySelectorAll('[id]')].map(el=>el.id),
      layout:[...document.querySelectorAll('section,article,.headshot,.site-nav')].map(el=>{
        const r=el.getBoundingClientRect();return [el.tagName,el.className,r.x,r.y,r.width,r.height];}),
      ld:JSON.parse(document.querySelector('script[type="application/ld+json"]').textContent),
      overflow:document.documentElement.scrollWidth>innerWidth,
      title:document.title,canonical:document.querySelector('link[rel="canonical"]').href
    }));
    const old=await snapshot(baseline),next=await snapshot(page);
    assert.deepEqual(next,old,`Baseline text/links/metadata/anchors differ at ${width}`);
    assert.equal(next.overflow,false);
    await page.screenshot({path:path.join(evidence,`candidate-${width}.png`),fullPage:true});
    for (const id of ['top','projects','publications','education']) await page.locator('#'+id).screenshot({path:path.join(evidence,`candidate-${width}-${id}.png`)});
    if(width<880) {
      await page.locator('.nav-toggle').click();assert.equal(await page.locator('.nav-toggle').getAttribute('aria-expanded'),'true');
      await page.keyboard.press('Escape');assert.equal(await page.locator('.nav-toggle').getAttribute('aria-expanded'),'false');
    }
    results.push({width,result:'PASS',parity:['visible text','all anchor links','metadata','JSON-LD','title','canonical URL','24 IDs'],overflow:false});
    await context.close();
  }
  const noJS=await browser.newContext({javaScriptEnabled:false,viewport:{width:375,height:1000}});
  const page=await noJS.newPage();await page.goto(url(candidateServer));
  assert.equal(await page.locator('.nav-toggle').isVisible(),false);
  assert.equal(await page.locator('#site-nav').isVisible(),true);
  await page.locator('#site-nav a[href="#projects"]').click();assert.ok(page.url().endsWith('#projects'));
  await noJS.close();
  fs.writeFileSync(path.join(evidence,'browser.json'),JSON.stringify({browser:browser.version(),results,no_js:'PASS',
    full_accessibility_audit:'NOT RUN',zoom_200_percent:'NOT RUN'},null,2)+'\n');
  console.log('PASS: baseline HTML parity at 375/768/1440, no overflow, menu/Escape and no-JS anchors; screenshots saved for visual inspection.');
} finally {
  await browser.close();
  for(const server of [baselineServer,candidateServer])await new Promise(resolve=>server.close(resolve));
}
