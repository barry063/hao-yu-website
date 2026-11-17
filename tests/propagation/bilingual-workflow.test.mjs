import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { ROOT, VISITOR_FILES, ALL_VISITOR_FILES, visitorFiles, loadPublic } from '../../scripts/public-content.mjs';
import { captureRelease, restoreRelease, promote, rollback } from '../../scripts/release-workflow.mjs';
import { sha, digest, inputHashes, writeJSON, readSources, readState, runtimeInfo, privateRecordHash } from '../../scripts/workflow-core.mjs';
import { packageFor, PACKAGES, approve, gate } from '../../scripts/review-workflow.mjs';
import { derivePublic } from '../../scripts/canonical-adapters.mjs';
import { calibrate } from '../../scripts/prepare-update.mjs';
import { fixture } from './workflow-fixture.mjs';

function releaseFixture() {
  const base=fs.mkdtempSync(path.join(os.tmpdir(),'hao-bilingual-rollback-'));
  const destination=path.join(base,'public'),backup=path.join(base,'backup');
  fs.mkdirSync(destination);fs.mkdirSync(backup);
  const put=(root,file,value)=>{fs.mkdirSync(path.dirname(path.join(root,file)),{recursive:true});fs.writeFileSync(path.join(root,file),value);};
  for(const file of [...VISITOR_FILES,'content/site.json'])put(destination,file,'previous release: '+file);
  const files=captureRelease(destination,[...ALL_VISITOR_FILES,'content/site.json']);
  for(const [file,hash] of Object.entries(files))if(hash!==null)put(backup,file,fs.readFileSync(path.join(destination,file)));
  const manifest={version:2,files};
  const clean=()=>{
    if(path.dirname(fs.realpathSync(base))!==fs.realpathSync(os.tmpdir()))throw new Error('FIXTURE_LOCATION');
    fs.rmSync(base,{recursive:true,force:true});
  };
  return {base,destination,backup,manifest,put,clean};
}

test('first bilingual rollback restores English and removes only newly introduced Chinese release files',()=>{
  const f=releaseFixture();try {
    for(const file of ['zh/index.html','assets/Hao_Yu_CV_CN.pdf','assets/og-image-zh.png'])assert.equal(f.manifest.files[file],null);
    for(const file of ALL_VISITOR_FILES)f.put(f.destination,file,'bilingual candidate: '+file);
    f.put(f.destination,'content/site.json','bilingual dataset');
    f.put(f.destination,'zh/unrelated-note.txt','Keep user file');
    const next=captureRelease(f.destination,Object.keys(f.manifest.files));
    restoreRelease(f.backup,f.destination,f.manifest,{dryRun:true});
    assert.deepEqual(captureRelease(f.destination,Object.keys(f.manifest.files)),next);
    restoreRelease(f.backup,f.destination,f.manifest);
    assert.deepEqual(captureRelease(f.destination,Object.keys(f.manifest.files)),f.manifest.files);
    assert.equal(fs.readFileSync(path.join(f.destination,'zh/unrelated-note.txt'),'utf8'),'Keep user file');
    assert.ok(fs.statSync(path.join(f.destination,'zh')).isDirectory());
  } finally { f.clean(); }
});

test('rollback validates every backup before writing and rejects non-release paths',()=>{
  const f=releaseFixture();try {
    f.put(f.destination,'index.html','New candidate remains until valid restoration');
    const before=fs.readFileSync(path.join(f.destination,'index.html'));
    f.put(f.backup,'assets/Hao_Yu_CV.pdf','damaged backup');
    assert.throws(()=>restoreRelease(f.backup,f.destination,f.manifest),/ROLLBACK_HASH/);
    assert.deepEqual(fs.readFileSync(path.join(f.destination,'index.html')),before);
    assert.throws(()=>captureRelease(f.destination,['../outside.txt']),/RELEASE_LOCATION/);
    assert.throws(()=>restoreRelease(f.backup,f.destination,{version:2,files:{...f.manifest.files,'unrelated.txt':null}}),/ROLLBACK_MANIFEST/);
  } finally { f.clean(); }
});

test('rollback refuses an actual junction that redirects a Chinese destination outside the release directory',()=>{
  const f=releaseFixture();try {
    const external=path.join(f.base,'external');fs.mkdirSync(external);
    fs.symlinkSync(fs.realpathSync(external),path.join(fs.realpathSync(f.destination),'zh'),process.platform==='win32'?'junction':'dir');
    assert.throws(()=>restoreRelease(f.backup,f.destination,f.manifest),/RELEASE_LOCATION/);
    assert.deepEqual(fs.readdirSync(external),[]);
  } finally { f.clean(); }
});

test('rollback rejects a resolved destination outside its selected root before any restoration write',t=>{
  const f=releaseFixture();try {
    f.put(f.destination,'zh/index.html','Candidate page');
    f.put(f.destination,'index.html','Candidate English page');
    const original=fs.realpathSync.bind(fs),target=path.join(original(f.destination),'zh/index.html');
    const outside=path.join(original(f.base),'outside.html');fs.writeFileSync(outside,'Untouched external file');
    t.mock.method(fs,'realpathSync',(file,...args)=>path.resolve(String(file))===target?outside:original(file,...args));
    assert.throws(()=>restoreRelease(f.backup,f.destination,f.manifest),/RELEASE_LOCATION/);
    assert.equal(fs.readFileSync(outside,'utf8'),'Untouched external file');
    assert.equal(fs.readFileSync(path.join(f.destination,'index.html'),'utf8'),'Candidate English page');
  } finally { f.clean(); }
});

test('historical version-one rollback manifests remain usable',()=>{
  const f=releaseFixture();try {
    const manifest={version:1,files:Object.fromEntries(Object.entries(f.manifest.files).filter(([,hash])=>hash!==null))};
    f.put(f.destination,'index.html','Changed English page');
    restoreRelease(f.backup,f.destination,manifest);
    assert.equal(sha(fs.readFileSync(path.join(f.destination,'index.html'))),manifest.files['index.html']);
  } finally { f.clean(); }
});

test('Chinese source or selection-policy edits require editorial reconciliation',()=>{
  const f=fixture();try {
    const policy=structuredClone(f.data);
    policy.sources.push({id:'CN_CV',path:'9 Chinese CV/hao_CN_CV/resume.tex',sha256:'0'.repeat(64)},
      {id:'CN_WORDING',path:'9 Chinese CV/Chinese_Application_Evidence_Wording.md',sha256:'0'.repeat(64)});
    const texts={...f.texts,CN_CV:'Reviewed Chinese source',CN_WORDING:'Reviewed Chinese wording'};
    assert.deepEqual(derivePublic(policy,texts,texts),policy);
    for(const [id,code] of [['CN_CV','EDITORIAL_CHINESE_CV_CHANGE'],['CN_WORDING','EDITORIAL_CHINESE_WORDING_CHANGE']]) {
      assert.throws(()=>derivePublic(policy,{...texts,[id]:'Changed derivative'},texts),error=>error.message===code&&error.locator.source===id);
    }
    assert.throws(()=>derivePublic(policy,{...texts,CN_CV:undefined},texts),/CHINESE_SOURCE_REQUIRED/);
    const eb=f.texts.EB.replace('## 2.1 Qualification','## 1.4 CV selection preference\nChanged selection needs review\n## 2.1 Qualification');
    assert.throws(()=>derivePublic(f.data,{...f.texts,EB:eb},f.texts),error=>error.message==='EDITORIAL_EB_CHANGE'&&error.locator.sections.includes('1.4'));
  } finally { f.clean(); }
});

test('candidate input bindings include new dated Chinese public PDFs and detect replacements',()=>{
  const folder=path.join(ROOT,'build-resources/public-cv/2098-12-31');
  assert.equal(fs.existsSync(folder),false,'Synthetic date must not contain real public files');
  fs.mkdirSync(folder);
  try {
    const en=path.join(folder,'Hao_Yu_CV.pdf'),cn=path.join(folder,'Hao_Yu_CV_CN.pdf');
    fs.writeFileSync(en,'Synthetic public English bytes');fs.writeFileSync(cn,'Synthetic public Chinese bytes');
    const before=inputHashes(),key='build-resources/public-cv/2098-12-31/Hao_Yu_CV_CN.pdf';
    assert.equal(before[key],sha(fs.readFileSync(cn)));
    assert.ok(before['scripts/localisation.mjs']);
    fs.writeFileSync(cn,'Changed synthetic public Chinese bytes');
    assert.notEqual(inputHashes()[key],before[key]);
  } finally {
    for(const name of ['Hao_Yu_CV.pdf','Hao_Yu_CV_CN.pdf'])fs.unlinkSync(path.join(folder,name));
    fs.rmdirSync(folder);
  }
});

test('immutable bilingual packages require both PDF reviews and the exact locale output set',()=>{
  const data=loadPublic(path.join(ROOT,'content/proposals/2026-11-17.json'));
  assert.ok(data.localisation,'Use the reviewed bilingual proposal as the contract fixture');
  const created=[];
  function makePackage({missingChineseCheck=false,missingChineseFile=false}={}) {
    const dataset=Buffer.from(JSON.stringify(data)+'\n');
    const checks=['HTML_CONTENT_NAVIGATION_HTTP','PUBLIC_PDF','BROWSER_KEYBOARD_ZOOM_MOTION',...(missingChineseCheck?[]:['PUBLIC_PDF_ZH'])]
      .map(id=>({id,result:'PASS',evidence:'Synthetic package integrity fixture; no browser/content validation claimed'}));
    const review=Buffer.from(JSON.stringify({state:'READY_FOR_REVIEW',checks})+'\n');
    const outputs=Object.fromEntries(visitorFiles(data).filter(file=>!missingChineseFile||file!=='zh/index.html')
      .map(file=>[file,sha(Buffer.from('Synthetic integrity fixture: '+file))]));
    const manifest={version:1,dataset:sha(dataset),outputs,review:sha(review)},id=digest(manifest),dir=path.join(PACKAGES,id);
    assert.equal(fs.existsSync(dir),false);fs.mkdirSync(path.join(dir,'visitor'),{recursive:true});created.push(dir);
    fs.writeFileSync(path.join(dir,'data.json'),dataset);fs.writeFileSync(path.join(dir,'review.json'),review);writeJSON(path.join(dir,'manifest.json'),manifest);
    for(const file of Object.keys(outputs)){const target=path.join(dir,'visitor',file);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,'Synthetic integrity fixture: '+file);}
    return {id,dir};
  }
  try {
    assert.throws(()=>packageFor(makePackage({missingChineseCheck:true}).id),/FAILED_REVIEW/);
    assert.throws(()=>packageFor(makePackage({missingChineseFile:true}).id),/STALE_OUTPUT_SET/);
    const p=makePackage();assert.equal(packageFor(p.id).data.localisation!==undefined,true);
    const cn=path.join(p.dir,'visitor/assets/Hao_Yu_CV_CN.pdf');fs.appendFileSync(cn,'Changed CV');
    assert.throws(()=>packageFor(p.id),/STALE_OUTPUT/);
    fs.writeFileSync(cn,'Synthetic integrity fixture: assets/Hao_Yu_CV_CN.pdf');
    fs.appendFileSync(path.join(p.dir,'visitor/zh/index.html'),'Changed Chinese page');
    assert.throws(()=>packageFor(p.id),/STALE_OUTPUT/);
  } finally {
    for(const dir of created){if(path.dirname(dir)!==PACKAGES||fs.realpathSync(dir)!==dir)throw new Error('FIXTURE_LOCATION');fs.rmSync(dir,{recursive:true,force:true});}
  }
});

test('approved synthetic bilingual promotion adds new files, invalidates changed locale inputs and rolls back the first release',()=>{
  const f=fixture();let packageDir;
  try {
    const data=loadPublic(path.join(ROOT,'content/proposals/2026-11-17.json'));
    for(const source of data.sources)if(!f.data.sources.some(s=>s.id===source.id)){
      const file=path.join(f.sourceRoot,source.path);fs.mkdirSync(path.dirname(file),{recursive:true});
      fs.writeFileSync(file,'Reviewed synthetic '+source.id+' source');
    }
    data.sources=readSources(f.sourceRoot,data.sources).fingerprints;
    const input=path.join(f.base,'reviewed-bilingual.json');writeJSON(input,data);
    calibrate({sourceRoot:f.sourceRoot,stateRoot:f.stateRoot,input,refresh:true});
    const state=readState(f.stateRoot,f.sourceRoot),dataset=Buffer.from(JSON.stringify(data)+'\n');
    const review=Buffer.from(JSON.stringify({state:'READY_FOR_REVIEW',checks:
      ['HTML_CONTENT_NAVIGATION_HTTP','PUBLIC_PDF','PUBLIC_PDF_ZH','BROWSER_KEYBOARD_ZOOM_MOTION'].map(id=>({id,result:'PASS',
        evidence:'Synthetic release-API fixture; browser and PDF content checks are not claimed'}))})+'\n');
    const outputs=Object.fromEntries(visitorFiles(data).map(file=>[file,sha(Buffer.from('Synthetic bilingual release: '+file))]));
    const manifest={version:1,sources:data.sources,dataset:sha(dataset),inputs:inputHashes(),runtime:runtimeInfo(),
      release_date:data.release_date,target:data.presentation.url,outputs,review:sha(review),
      policy:privateRecordHash(state.policyFile),published:privateRecordHash(state.publishedFile),
      repository_dataset:sha(fs.readFileSync(path.join(ROOT,'content/site.json')))};
    const id=digest(manifest);packageDir=path.join(PACKAGES,id);assert.equal(fs.existsSync(packageDir),false);
    fs.mkdirSync(path.join(packageDir,'visitor'),{recursive:true});
    fs.writeFileSync(path.join(packageDir,'data.json'),dataset);fs.writeFileSync(path.join(packageDir,'review.json'),review);
    writeJSON(path.join(packageDir,'manifest.json'),manifest);
    for(const file of visitorFiles(data)){const target=path.join(packageDir,'visitor',file);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,'Synthetic bilingual release: '+file);}
    const options={sourceRoot:f.sourceRoot,stateRoot:f.stateRoot,id,target:data.presentation.url};
    approve({...options,decision:'APPROVE',actor:'Synthetic fixture operator',statement:'Synthetic release-API fixture only'});
    assert.ok(gate(options));
    const source=path.join(f.sourceRoot,data.sources.find(s=>s.id==='CN_CV').path),originalSource=fs.readFileSync(source);
    fs.appendFileSync(source,'changed source');assert.throws(()=>gate(options),/STALE_SOURCES/);fs.writeFileSync(source,originalSource);
    const translated=structuredClone(data);translated.localisation.presentation.title+=' — revised';
    writeJSON(state.policyFile,translated);assert.throws(()=>gate(options),/STALE_POLICY/);writeJSON(state.policyFile,data);
    const cv=path.join(packageDir,'visitor/assets/Hao_Yu_CV_CN.pdf'),originalCV=fs.readFileSync(cv);
    fs.appendFileSync(cv,'changed CV');assert.throws(()=>gate(options),/STALE_OUTPUT/);fs.writeFileSync(cv,originalCV);
    const destination=path.join(f.base,'public-destination');fs.mkdirSync(destination);
    for(const file of [...VISITOR_FILES,'content/site.json']){const target=path.join(destination,file);fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(path.join(ROOT,file),target);}
    const before=captureRelease(destination,[...ALL_VISITOR_FILES,'content/site.json']);
    const promoted=promote({...options,destination,authorisePublication:true});
    for(const file of visitorFiles(data))assert.equal(sha(fs.readFileSync(path.join(destination,file))),manifest.outputs[file]);
    const restore={sourceRoot:f.sourceRoot,stateRoot:f.stateRoot,id:promoted.rollback,destination};
    assert.equal(rollback(restore).operation,'ROLLBACK_CHECKED');
    assert.equal(rollback({...restore,dryRun:false,authoriseRestoration:true}).operation,'RESTORED_LOCALLY');
    assert.deepEqual(captureRelease(destination,Object.keys(before)),before);
  } finally {
    if(packageDir&&fs.existsSync(packageDir)){if(path.dirname(packageDir)!==PACKAGES||fs.realpathSync(packageDir)!==packageDir)throw new Error('FIXTURE_LOCATION');fs.rmSync(packageDir,{recursive:true,force:true});}
    f.clean();
  }
});
