import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { ROOT, loadPublic, normalise, validatePublic } from '../../scripts/public-content.mjs';
import { renderSite } from '../../scripts/render-site.mjs';
import { buildSite, outputDirectory, hash } from '../../scripts/build-site.mjs';

test('status is shared by project wording, output grouping and normalised CV data', () => {
  const data=loadPublic(); data.outputs.find(o=>o.id==='S1').status='ACCEPTED';
  data.outputs.find(o=>o.id==='P1').status='UNDER_REVIEW';
  const n=normalise(data), html=renderSite(data);
  assert.ok(html.includes('The co-authored manuscript is accepted.'));
  assert.ok(html.includes('a first-author manuscript is under review.'));
  assert.ok(html.includes('>Accepted</h3>')); assert.ok(html.includes('>Under review</h3>'));
  assert.equal(n.records.find(r=>r.id==='S1').dates,'Accepted');
  assert.equal(n.records.find(r=>r.id==='P1').dates,'Under review');
  assert.ok(n.records.find(r=>r.id==='PROJECT-MOS2').text.join(' ').includes('accepted'));
  assert.ok(n.records.find(r=>r.id==='P1').text.join(' ').includes('under review'));
});
test('links follow output IDs and shared contact fields reach real dependent outputs', () => {
  const data=loadPublic();data.profile.email='example@example.org';
  data.links.find(l=>l.id==='ORCID').url='https://orcid.org/0000-0000-0000-0000';
  data.outputs.find(o=>o.id==='J1').links[0].url='https://doi.org/10.0000/synthetic';
  const n=normalise(data),html=renderSite(data);
  assert.equal((html.match(/mailto:example@example.org/g)||[]).length,3);
  assert.ok(n.profiles.some(l=>l.url==='https://orcid.org/0000-0000-0000-0000'));
  assert.ok(n.records.find(r=>r.id==='PROJECT-CSS').links[0].url.endsWith('/synthetic'));
});
test('output additions change count and deletion preserves remaining stable IDs', () => {
  const data=loadPublic(), copy=structuredClone(data.outputs[0]);copy.id='J5';data.outputs.push(copy);
  assert.ok(renderSite(data).includes('Published journal articles <span>5</span>'));
  data.outputs=data.outputs.filter(o=>o.id!=='J2');
  assert.ok(renderSite(data).includes('Published journal articles <span>4</span>'));
  assert.ok(!renderSite(data).includes('data-record="J2"'));
});
test('unsafe URLs, duplicates, missing required records, references and clearance are refused', () => {
  for(const change of [d=>d.links[0].url='javascript:alert(1)',d=>d.outputs.push(structuredClone(d.outputs[0])),
    d=>d.narratives.find(r=>r.id==='PROJECT-CSS').output_id='MISSING',
    d=>d.outputs.find(r=>r.id==='J1').selected=false]) {
    const data=loadPublic();change(data);assert.throws(()=>validatePublic(data));
  }
  const data=loadPublic();data.narratives=data.narratives.filter(r=>r.id!=='PROFILE');assert.throws(()=>renderSite(data));
});
test('authored text, attributes and JSON-LD are escaped without executing injected markup', () => {
  const data=loadPublic();data.profile.name='Example </script><script>alert(1)</script> & "name"';
  data.outputs[0].title='<img src=x onerror=alert(1)> & text';
  const html=renderSite(data);
  assert.ok(html.includes('&lt;img src=x onerror=alert(1)&gt; &amp; text'));
  const ld=JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  assert.equal(ld.name,data.profile.name);assert.equal((html.match(/<script\b/g)||[]).length,2);
});
test('root files and nonempty/symlink output are protected', () => {
  assert.throws(()=>outputDirectory(ROOT));assert.throws(()=>outputDirectory(path.join(ROOT,'assets')));
  assert.throws(()=>outputDirectory(path.join(ROOT,'tmp/candidates')));
  const directory=fs.mkdtempSync(path.join(ROOT,'tmp/candidates/symlink-test-'));
  const link=path.join(directory,'linked');
  try {
    fs.symlinkSync(path.join(ROOT,'assets'),link,'junction');
    assert.throws(()=>outputDirectory(path.join(link,'candidate')));
  } finally {
    if(fs.existsSync(link)) fs.unlinkSync(link);
    fs.rmdirSync(directory);
  }
});
test('two complete builds, including regenerated social cards and PDFs, have identical hashes', () => {
  if (!process.env.SITE_PYTHON) throw new Error('Set SITE_PYTHON to the pinned build runtime; determinism must not be skipped');
  const work=fs.mkdtempSync(path.join(ROOT,'tmp/candidates/test-'));
  const before=Object.fromEntries(['index.html','assets/Hao_Yu_CV.pdf','assets/og-image.png'].map(f=>[f,hash(fs.readFileSync(path.join(ROOT,f)))]));
  try {
    const a=buildSite({out:path.join(work,'a')}),b=buildSite({out:path.join(work,'b')});
    assert.deepEqual(a.hashes,b.hashes);assert.equal(a.social_card,'REUSED');
    assert.throws(()=>buildSite({out:path.join(work,'a')}));
    const data=loadPublic();data.presentation.social.topic='Synthetic spectroscopy test';
    data.outputs.find(o=>o.id==='S1').status='ACCEPTED';
    data.outputs.find(o=>o.id==='P1').status='UNDER_REVIEW';
    data.profile.email='example@example.org';
    const input=path.join(work,'fixture.json');fs.writeFileSync(input,JSON.stringify(data));
    const c=buildSite({out:path.join(work,'c'),input}),d=buildSite({out:path.join(work,'d'),input});
    assert.deepEqual(c.hashes,d.hashes);assert.equal(c.social_card,'GENERATED');
    assert.notEqual(c.hashes['assets/og-image.png'],a.hashes['assets/og-image.png']);
    const pdfCheck=spawnSync(process.env.SITE_PYTHON,['-c',
      "import pdfplumber,sys; p=pdfplumber.open(sys.argv[1]); t=' '.join(' '.join(x.extract_text().split()) for x in p.pages); assert 'Accepted: Closed-loop' in t; assert 'example@example.org' in t; assert 'a first-author manuscript is under review.' in t; assert 'Under review: Salt-assisted' in t; assert 'In preparation:' not in t",
      path.join(work,'c/assets/Hao_Yu_CV.pdf')],{encoding:'utf8'});
    assert.equal(pdfCheck.status,0,'Actual PDF status/contact propagation failed');
    assert.deepEqual(before,Object.fromEntries(Object.keys(before).map(f=>[f,hash(fs.readFileSync(path.join(ROOT,f)))])));
  } finally {
    assert.ok(path.relative(path.join(ROOT,'tmp/candidates'),work).startsWith('test-'));
    fs.rmSync(work,{recursive:true,force:true});
  }
});
