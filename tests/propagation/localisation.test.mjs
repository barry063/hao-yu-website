import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {ROOT,validatePublic,normalise,visitorFiles,VISITOR_FILES} from '../../scripts/public-content.mjs';
import {renderSite} from '../../scripts/render-site.mjs';
import {translationRecords,translationSourceHash,presentationSourceHash} from '../../scripts/localisation.mjs';

function fixture(){
  const data=JSON.parse(fs.readFileSync(path.join(ROOT,'content/proposals/2026-11-17.json')));
  // Pure rendering fixtures do not claim PDF clearance; real PDF checks run separately.
  if(!data.presentation.cv_document_zh)data.presentation.cv_document_zh={...data.presentation.cv_document,
    file:'build-resources/public-cv/2026-11-17/Hao_Yu_CV_CN.pdf',selected_output_ids:['J1'],selected_link_ids:['GITHUB']};
  return data;
}
const ld=html=>JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
function renew(data){
  for(const r of translationRecords(data))data.localisation.records.find(t=>t.id===r.id).source_sha256=translationSourceHash(r,data);
  data.localisation.presentation.source_sha256=presentationSourceHash(data);
}
test('bilingual pages have distinct canonical URLs and one shared Person identity',()=>{
  const d=fixture(),en=renderSite(d),zh=renderSite(d,'zh');
  assert.match(en,/<html lang="en-GB">/);assert.match(zh,/<html lang="zh-Hans">/);
  assert.equal(ld(en).url,d.presentation.url);assert.equal(ld(zh).url,d.presentation.url+'zh/');
  assert.equal(ld(en).mainEntity['@id'],ld(zh).mainEntity['@id']);
  assert.equal(ld(zh).mainEntity.url,d.presentation.url);
  assert.equal(ld(zh).mainEntity.name,'余豪 Hao Yu');assert.equal(ld(zh).inLanguage,'zh-Hans');
  for(const html of [en,zh]){
    assert.ok(html.includes(`hreflang="en" href="${d.presentation.url}"`));
    assert.ok(html.includes(`hreflang="zh-Hans" href="${d.presentation.url}zh/"`));
    assert.ok(html.includes(`hreflang="x-default" href="${d.presentation.url}"`));
    assert.equal((html.match(/aria-current="page"/g)||[]).length,1);
  }
});
test('every PDF action offers only its page language and nested assets resolve correctly',()=>{
  const d=fixture();
  for(const locale of ['en','zh']){
    const html=renderSite(d,locale),n=normalise(d,locale);
    const pdfs=[...html.matchAll(/href="([^"]+\.pdf)"/g)].map(m=>m[1]);
    assert.equal(pdfs.length,2);
    assert.deepEqual([...new Set(pdfs)],[locale==='zh'?'../assets/Hao_Yu_CV_CN.pdf':'assets/Hao_Yu_CV.pdf']);
    for(const rel of pdfs)assert.equal(new URL(rel,n.site.url).pathname,'/hao-yu-website/'+n.site.cv);
    assert.ok(html.includes(`download="${locale==='zh'?'Hao_Yu_CV_CN.pdf':'Hao_Yu_CV.pdf'}"`));
  }
  const zh=renderSite(d,'zh');assert.match(zh,/href="\.\.\/styles\.css"/);assert.match(zh,/src="\.\.\/script\.js"/);
  assert.ok(zh.includes(d.presentation.url+'assets/og-image-zh.png'));
  assert.deepEqual(visitorFiles({}),VISITOR_FILES);
  assert.ok(visitorFiles(d).includes('zh/index.html'));assert.ok(visitorFiles(d).includes('assets/Hao_Yu_CV_CN.pdf'));
});
test('all required Chinese content is reviewed and authoritative bibliographic names remain intact',()=>{
  const d=fixture(),zh=renderSite(d,'zh');validatePublic(d);
  assert.match(zh,/<strong>Hao Yu<\/strong>/);
  assert.ok(zh.includes(d.outputs[0].title));assert.ok(zh.includes('学位待授予'));
  for(const label of ['已发表期刊论文','已投稿','审稿中','准备中','科研软件','下载中文简历','跳至正文','主导航','电子邮箱'])assert.ok(zh.includes(label));
  for(const label of ['Download English CV','Last content review:','Selected poster presentations','Portrait of'])assert.ok(!zh.includes(label));
});
test('missing, duplicate, incomplete or unknown translated fields are rejected',()=>{
  const changes=[d=>d.localisation.records.pop(),d=>d.localisation.records[1]=d.localisation.records[0],
    d=>delete d.localisation.records.find(r=>r.id==='ABOUT').fields.text,
    d=>d.localisation.records.find(r=>r.id==='ABOUT').fields.text.pop(),
    d=>d.localisation.records.find(r=>r.id==='PERSON').fields.email='unreviewed@example.org'];
  for(const change of changes){const d=fixture();change(d);assert.throws(()=>validatePublic(d));}
});
test('shared fact, status, contact, clearance and presentation changes invalidate translation review',()=>{
  for(const change of [d=>d.outputs.find(r=>r.id==='S1').status='ACCEPTED',d=>d.profile.email='changed@example.org',
    d=>d.qualification_events[0].date='2026-10-01',d=>d.outputs.find(r=>r.id==='J2').selected=false,
    d=>d.presentation.description+=' A new claim.']){
    const d=fixture();change(d);assert.throws(()=>renderSite(d,'zh'),/LOCALISATION/);
    assert.throws(()=>renderSite(d,'en'),/LOCALISATION/);
  }
});
test('reviewed status changes propagate into Chinese groups and linked narrative tokens',()=>{
  const d=fixture();d.outputs.find(r=>r.id==='S1').status='ACCEPTED';renew(d);
  const html=renderSite(d,'zh');assert.ok(html.includes('已接收</h3>'));
  const project=html.match(/<article class="project-card" data-record="PROJECT-MOS2">([\s\S]*?)<\/article>/)[1];
  assert.match(project,/已接收/);assert.doesNotMatch(project,/审稿中|\{\{/);
});
test('translations cannot discard milestone/status references or inject private fields/markup',()=>{
  const d=fixture();d.localisation.records.find(r=>r.id==='P1').fields.contribution='已发表。';
  assert.throws(()=>validatePublic(d),/LOCALISATION_REFERENCES/);
  const e=fixture();e.localisation.records.find(r=>r.id==='PROFILE').fields.title='<img src=x onerror=alert(1)>';
  assert.ok(renderSite(e,'zh').includes('&lt;img src=x onerror=alert(1)&gt;'));
  e.localisation.records.find(r=>r.id==='PROFILE').fields.title='[VERIFY]';assert.throws(()=>validatePublic(e));
});
test('plain language choices remain outside the collapsible menu with native fallback URLs',()=>{
  const d=fixture();for(const locale of ['en','zh']){
    const html=renderSite(d,locale),switchAt=html.indexOf('class="language-switch"'),menuAt=html.indexOf('id="site-nav"');
    assert.ok(switchAt>0&&switchAt<menuAt);
    const switchHTML=html.slice(switchAt,html.indexOf('</nav>',switchAt));
    assert.ok(switchHTML.includes(`href="${locale==='zh'?'../':'./'}" lang="en"`));
    assert.ok(switchHTML.includes(`href="${locale==='zh'?'./':'zh/'}" lang="zh-Hans"`));
  }
});
test('language links retain valid fragments across navigation and history without forced redirection',()=>{
  const listeners={}, attrs={href:'zh/','data-language-link':''};
  const link={getAttribute:k=>attrs[k],setAttribute:(k,v)=>attrs[k]=v,hasAttribute:k=>Object.hasOwn(attrs,k)};
  const window={location:{hash:'#projects'},matchMedia:()=>({matches:false}),addEventListener:(k,f)=>listeners[k]=f};
  const document={querySelector:()=>null,querySelectorAll:q=>q==='a[data-language-link]'?[link]:[],getElementById:id=>id==='projects'?{}:null};
  vm.runInNewContext(fs.readFileSync(path.join(ROOT,'script.js'),'utf8'),{window,document,Date});
  assert.equal(attrs.href,'zh/#projects');
  window.location.hash='#unknown';listeners.hashchange();assert.equal(attrs.href,'zh/');
  window.location.hash='#projects';listeners.popstate();assert.equal(attrs.href,'zh/#projects');
  assert.deepEqual(Object.keys(window.location),['hash']);
});
