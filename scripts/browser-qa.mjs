/** Fresh headless Chromium keyboard, reflow and motion checks. No user profile. */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { createPreviewServer } from './preview.mjs';
export async function browserQA(options) {
  const bilingual=Boolean(options.data?.localisation||(options.visitor&&fs.existsSync(path.join(options.visitor,'zh/index.html'))));
  if(!bilingual)return browserQAPage({...options,locale:'en',bilingual:false});
  const locales={};
  for(const locale of ['en','zh'])locales[locale]=await browserQAPage({...options,locale,bilingual:true,evidence:path.join(options.evidence,locale)});
  const result={browser:locales.en.browser,locales,result:'PASS',full_accessibility_audit:'NOT RUN'};
  fs.writeFileSync(path.join(options.evidence,'browser.json'),JSON.stringify(result,null,2)+'\n');return result;
}
async function browserQAPage({visitor,target,evidence,locale,bilingual}) {
  if(!process.env.SITE_PLAYWRIGHT_MODULE||!process.env.SITE_BROWSER_EXECUTABLE)throw new Error('BROWSER_RUNTIME_REQUIRED');
  const {chromium}=await import(pathToFileURL(process.env.SITE_PLAYWRIGHT_MODULE).href);
  const server=visitor?createPreviewServer(visitor):null;
  if(server)await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  target=target||`http://127.0.0.1:${server.address().port}/hao-yu-website/`;
  if(locale==='zh')target=new URL('zh/',target).href;
  fs.mkdirSync(evidence,{recursive:true});const browser=await chromium.launch({executablePath:process.env.SITE_BROWSER_EXECUTABLE,headless:true});
  try {
    const checks=[];
    for(const width of [375,768,1440]){
      const context=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'}),page=await context.newPage();
      const errors=[];page.on('pageerror',e=>errors.push(e.message));
      await page.goto(target);await page.evaluate(()=>document.fonts.ready);
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'Horizontal overflow');
      if(bilingual) {
        assert.equal(await page.locator('html').getAttribute('lang'),locale==='zh'?'zh-Hans':'en-GB');
        const switcher=page.locator('.language-switch');assert.equal(await switcher.isVisible(),true,'Language selector hidden');
        const expected=new URL(locale==='zh'?'../assets/Hao_Yu_CV_CN.pdf':'assets/Hao_Yu_CV.pdf',target);
        const links=await page.locator('a[href]').evaluateAll(els=>els.map(el=>el.href).filter(href=>/\.pdf$/i.test(decodeURIComponent(new URL(href).pathname))));
        assert.ok(links.length&&links.every(href=>{const url=new URL(href);return url.origin===expected.origin&&decodeURIComponent(url.pathname)===expected.pathname;}),'Wrong-language CV download');
        const response=await page.request.get(links[0]);assert.equal(response.status(),200);assert.equal((await response.body()).subarray(0,5).toString(),'%PDF-');
      }
      assert.equal(await page.evaluate(()=>matchMedia('(prefers-reduced-motion: reduce)').matches),true);
      await page.keyboard.press('Tab');assert.equal(await page.locator(':focus').getAttribute('href'),'#main');
      await page.keyboard.press('Enter');assert.equal(await page.locator(':focus').getAttribute('id'),'main');
      if(width<880){const toggle=page.locator('.nav-toggle');await toggle.focus();await page.keyboard.press('Enter');
        assert.equal(await toggle.getAttribute('aria-expanded'),'true');await page.keyboard.press('Tab');
        assert.ok(await page.locator(':focus').evaluate(el=>el.closest('#site-nav')!==null));
        await page.keyboard.press('Escape');assert.equal(await toggle.getAttribute('aria-expanded'),'false');assert.ok(await toggle.evaluate(el=>el===document.activeElement));
        assert.equal(await page.locator('#site-nav').evaluate(el=>el.inert),true);
        await page.keyboard.press('Enter');await page.locator('#site-nav a[href="#projects"]').focus();await page.keyboard.press('Enter');
        assert.equal(await toggle.getAttribute('aria-expanded'),'false');assert.ok(page.url().endsWith('#projects'));}
      else{await page.locator('#site-nav a[href="#projects"]').focus();await page.keyboard.press('Enter');}
      const position=await page.locator('#projects').evaluate(el=>({top:el.getBoundingClientRect().top,header:document.querySelector('.site-header').getBoundingClientRect().bottom}));
      assert.ok(position.top>=position.header-1,'Sticky header hides anchor');
      await page.screenshot({path:path.join(evidence,`browser-${width}.png`),fullPage:true});
      if(bilingual) {
        const other=locale==='zh'?'en':'zh-Hans';
        const link=page.locator(`.language-switch a[hreflang="${other}"]`);
        await link.focus();
        const focus=await link.evaluate(el=>({style:getComputedStyle(el).outlineStyle,width:parseFloat(getComputedStyle(el).outlineWidth)}));
        assert.ok(focus.style!=='none'&&focus.width>=2,'Language switch lacks visible keyboard focus');
        await page.keyboard.press('Enter');await page.waitForLoadState();
        assert.equal(await page.locator('html').getAttribute('lang'),locale==='zh'?'en-GB':'zh-Hans');
        assert.ok(page.url().endsWith('#projects'),'Language switch lost section fragment');
        await page.reload();assert.equal(await page.locator('html').getAttribute('lang'),locale==='zh'?'en-GB':'zh-Hans');
        await page.goBack();assert.equal(await page.locator('html').getAttribute('lang'),locale==='zh'?'zh-Hans':'en-GB');
        await page.goForward();assert.equal(await page.locator('html').getAttribute('lang'),locale==='zh'?'en-GB':'zh-Hans');
      }
      assert.deepEqual(errors,[],'Browser JavaScript errors');
      checks.push({width,result:'PASS',keyboard:'PASS',reduced_motion:'PASS',...(bilingual?{language_switch:'PASS',cv_download:'PASS',refresh_history:'PASS'}:{})});
      await context.close();
    }
    const noJS=await browser.newContext({javaScriptEnabled:false,viewport:{width:375,height:1000}}),page=await noJS.newPage();await page.goto(target);
    assert.equal(await page.locator('.nav-toggle').isVisible(),false);assert.equal(await page.locator('#site-nav').isVisible(),true);
    await page.locator('#site-nav a[href="#projects"]').click();assert.ok(page.url().endsWith('#projects'));
    if(bilingual){await page.locator(`.language-switch a[hreflang="${locale==='zh'?'en':'zh-Hans'}"]`).click();
      assert.equal(await page.locator('html').getAttribute('lang'),locale==='zh'?'en-GB':'zh-Hans');}
    await noJS.close();
    // Native browser zoom, configured only in a new disposable profile. Chromium's
    // empty storage-partition key is "x"; CSS zoom stays 1 and devicePixelRatio is 2.
    const profile=fs.mkdtempSync(path.join(os.tmpdir(),'hao-zoom-'));
    let zoomContext;
    try {
      fs.mkdirSync(path.join(profile,'Default'));fs.writeFileSync(path.join(profile,'Default/Preferences'),JSON.stringify({partition:{default_zoom_level:{x:Math.log(2)/Math.log(1.2)}}}));
      zoomContext=await chromium.launchPersistentContext(profile,{executablePath:process.env.SITE_BROWSER_EXECUTABLE,headless:true,viewport:null,reducedMotion:'reduce',args:['--window-size=1440,1000']});
      const zoom=await zoomContext.newPage();await zoom.goto(target);await zoom.evaluate(()=>document.fonts.ready);
      const dimensions=await zoom.evaluate(()=>({inner:innerWidth,outer:outerWidth,dpr:devicePixelRatio,cssZoom:getComputedStyle(document.documentElement).zoom,overflow:document.documentElement.scrollWidth>innerWidth}));
      assert.equal(dimensions.dpr,2);assert.equal(dimensions.cssZoom,'1');assert.ok(dimensions.inner<750&&dimensions.outer===1440);assert.equal(dimensions.overflow,false);
      await zoom.keyboard.press('Tab');await zoom.keyboard.press('Enter');assert.equal(await zoom.locator(':focus').getAttribute('id'),'main');
      await zoom.locator('.nav-toggle').focus();await zoom.keyboard.press('Enter');assert.equal(await zoom.locator('.nav-toggle').getAttribute('aria-expanded'),'true');await zoom.keyboard.press('Escape');
      assert.equal(await zoom.locator('.nav-toggle').getAttribute('aria-expanded'),'false');
      // Playwright's CSS-sized screenshot clips native zoom. Capture the physical
      // viewport directly without changing the metrics or applying CSS zoom.
      const session=await zoomContext.newCDPSession(zoom);
      for(const id of ['top','projects','publications','education']){
        if(id==='top'){await zoom.locator('.site-header a[href="#top"]').focus();await zoom.keyboard.press('Enter');}
        else if(id==='education'){await zoom.evaluate(()=>{location.hash='education';});}
        else{await zoom.locator('.nav-toggle').focus();await zoom.keyboard.press('Enter');
          await zoom.locator(`#site-nav a[href="#${id}"]`).focus();await zoom.keyboard.press('Enter');}
        await zoom.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
        if(id!=='top'){const position=await zoom.locator('#'+id).evaluate(el=>({top:el.getBoundingClientRect().top,header:document.querySelector('.site-header').getBoundingClientRect().bottom}));
          assert.ok(position.top>=position.header-1,'Zoomed anchor hidden by header');}
        const capture=await session.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false,fromSurface:true});
        fs.writeFileSync(path.join(evidence,`browser-native-200-percent-${id}.png`),Buffer.from(capture.data,'base64'));
      }
      checks.push({width:1440,zoom_200_percent:'PASS',result:'PASS',keyboard:'PASS',reduced_motion:'PASS',anchors:'PASS',dimensions,capture_method:'Physical viewport via CDP after keyboard navigation and paint; CSS zoom remains 1'});
    } finally {if(zoomContext)await zoomContext.close();
      if(path.dirname(fs.realpathSync(profile))!==fs.realpathSync(os.tmpdir()))throw new Error('PROFILE_CLEANUP_LOCATION');
      fs.rmSync(profile,{recursive:true,force:true});}
    const result={browser:browser.version(),checks,no_js:'PASS',full_accessibility_audit:'NOT RUN'};
    fs.writeFileSync(path.join(evidence,'browser.json'),JSON.stringify(result,null,2)+'\n');return result;
  } finally {await browser.close();if(server)await new Promise(resolve=>server.close(resolve));}
}
