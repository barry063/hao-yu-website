import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {spawn,spawnSync} from 'node:child_process';
import {WatcherEngine,londonDate} from '../../scripts/watcher-core.mjs';
import {acquireLock,withWorkflowLock} from '../../scripts/workflow-lock.mjs';
import {currentSnapshot,validateReady} from '../../scripts/watch-workflow.mjs';
import {migrate,inventory} from '../../scripts/migrate-watcher-state.mjs';
import {ROOT} from '../../scripts/public-content.mjs';
import {writeJSON,json,digest,readSources} from '../../scripts/workflow-core.mjs';
import {prepare} from '../../scripts/prepare-update.mjs';
import {PACKAGES} from '../../scripts/review-workflow.mjs';
import {fixture,SENTINEL} from './workflow-fixture.mjs';
function harness({state={},result={state:'NO_CHANGE'},prepare:prepareOverride,notify:notifyOverride}={}) {
  let time=Date.parse('2026-10-06T12:00:00Z'),snapshot={sources:'A',bindings:'code-A',approvedBindings:'code-A'},saved,calls=[];
  const notices=[];
  const engine=new WatcherEngine({state,now:()=>time,read:()=>{if(snapshot instanceof Error)throw snapshot;return snapshot;},
    prepare:async date=>{calls.push(date);return prepareOverride?prepareOverride():result;},validateReady:()=>{},
    notify:async notice=>{notices.push(structuredClone(notice));return notifyOverride?notifyOverride():{state:'DELIVERED'};},save:value=>{saved=structuredClone(value);}});
  return {engine,calls,notices,get saved(){return saved;},set(value){snapshot=value;},snapshot:()=>snapshot,advance(ms){time+=ms;},async stable(){await engine.tick();time+=10000;await engine.tick();}};
}
test('bursts, partial writes and atomic replacement settle the whole set before one preparation',async()=>{
  const h=harness();await h.engine.tick();h.advance(9000);h.set({...h.snapshot(),sources:'partial'});await h.engine.tick();
  h.advance(5000);h.set({...h.snapshot(),sources:'final-atomic'});await h.engine.tick();h.advance(9999);await h.engine.tick();assert.equal(h.calls.length,0);
  h.advance(1);await h.engine.tick();assert.equal(h.calls.length,1);for(let i=0;i<5;i++){h.advance(120000);await h.engine.tick();}assert.equal(h.calls.length,1);assert.equal(h.notices.length,0);
});
test('NO_CHANGE is quiet across restart and midnight; London date observes DST',async()=>{
  const h=harness();await h.stable();const restarted=harness({state:h.saved});restarted.advance(86400000);await restarted.engine.tick();
  assert.equal(restarted.calls.length,0);assert.equal(restarted.notices.length,0);
  assert.equal(londonDate(Date.parse('2026-10-06T23:30:00Z')),'2026-10-07');assert.equal(londonDate(Date.parse('2026-12-06T23:30:00Z')),'2026-12-06');
});
test('ready notice is saved once; source drift supersedes exact pending candidate and old approval',async()=>{
  const h=harness({result:{state:'READY_FOR_REVIEW',candidate:'candidate-A',target:'https://example.org/'}});await h.stable();assert.equal(h.notices.length,1);
  const restarted=harness({state:h.saved});await restarted.engine.tick();assert.equal(restarted.notices.length,0);
  h.set({...h.snapshot(),sources:'private-edit'});await h.engine.tick();assert.equal(h.saved.pending,null);assert.equal(h.saved.superseded.candidate,'candidate-A');assert.equal(h.notices.length,2);
});
test('package tampering cannot retain a ready status',async()=>{
  const h=harness({result:{state:'READY_FOR_REVIEW',candidate:'A'}});await h.stable();h.engine.validateReady=()=>{throw new Error('STALE');};await h.engine.tick();
  assert.equal(h.saved.pending,null);assert.equal(h.saved.status,'REVALIDATION_REQUIRED');
});
test('code, policy, configuration and published baseline drift pause without forcing a candidate',async()=>{
  for(const binding of ['code','policy','configuration','published']){
    const h=harness();await h.stable();h.set({...h.snapshot(),bindings:binding});await h.engine.tick();await h.engine.tick();
    assert.equal(h.calls.length,1);assert.equal(h.notices.length,1);assert.equal(h.saved.status,'REVALIDATION_REQUIRED');
  }
});
test('changes during preparation discard ready notice and queue the newest stable inputs',async()=>{
  let h;h=harness({prepare:()=>{h.set({...h.snapshot(),sources:'new-inputs'});return {state:'READY_FOR_REVIEW',candidate:'stale'};}});
  await h.stable();assert.equal(h.notices.length,0);assert.equal(h.saved.pending,null);assert.equal(h.saved.status,'INPUTS_CHANGED_DURING_PREPARATION');
  h.engine.prepare=async()=>({state:'NO_CHANGE'});await h.stable();assert.equal(h.saved.status,'NO_CHANGE');
});
test('missing and locked reads retry, notify once after persistent failure and recover quietly',async()=>{
  const h=harness();await h.stable();h.set(new Error('EACCES '+SENTINEL));await h.engine.tick();await h.engine.tick();assert.equal(h.notices.length,0);
  await h.engine.tick();await h.engine.tick();assert.equal(h.notices.length,1);assert.ok(!JSON.stringify(h.saved).includes(SENTINEL));
  h.set({sources:'A',bindings:'code-A',approvedBindings:'code-A'});await h.engine.tick();assert.equal(h.saved.status,'NO_CHANGE');assert.equal(h.calls.length,1);
});
test('reconciliation persists across restart without repeated proposals or notifications',async()=>{
  const h=harness({result:{state:'NEEDS_RECONCILIATION'}});await h.stable();assert.equal(h.notices.length,1);
  const restart=harness({state:h.saved});await restart.engine.tick();assert.equal(restart.calls.length,0);assert.equal(restart.notices.length,0);
});
test('ready candidate is settled and validated again after a transient read failure',async()=>{
  const h=harness({result:{state:'READY_FOR_REVIEW',candidate:'candidate-A',target:'https://example.org/'}});
  let validations=0;h.engine.validateReady=()=>{validations++;};await h.stable();
  h.set(new Error('EACCES'));await h.engine.tick();assert.equal(h.saved.pending,null);
  h.set({sources:'A',bindings:'code-A',approvedBindings:'code-A'});await h.engine.tick();
  assert.equal(h.saved.status,'SETTLING');assert.equal(h.saved.pending,null);
  h.advance(10000);await h.engine.tick();assert.equal(h.saved.status,'READY_FOR_REVIEW');
  assert.equal(h.saved.pending.candidate,'candidate-A');assert.equal(h.calls.length,2);
  assert.equal(validations,2);assert.equal(h.notices.length,1);
});
test('transient failures use bounded backoff and keep one preparation date across restart',async()=>{
  const h=harness({result:{state:'FAILED'}});await h.stable();h.advance(120000);await h.engine.tick();h.advance(240000);await h.engine.tick();
  h.advance(1000000);await h.engine.tick();assert.equal(h.calls.length,3);assert.equal(h.notices.length,1);assert.equal(new Set(h.calls).size,1);
  const restart=harness({state:h.saved,result:{state:'FAILED'}});await restart.engine.tick();assert.equal(restart.calls.length,0);
});
test('manual operation contention waits without consuming failure budget or issuing a notice',async()=>{
  const h=harness({result:{state:'FAILED',code:'WORKFLOW_BUSY'}});await h.stable();h.advance(120000);await h.engine.tick();
  assert.equal(h.saved.attempt.count,0);assert.equal(h.notices.length,0);assert.equal(h.calls.length,2);
});
test('interruption during preparation persists its London date for retries after midnight',async()=>{
 let release;const h=harness({prepare:()=>new Promise(resolve=>{release=()=>resolve({state:'NO_CHANGE'});})});
 await h.engine.tick();h.advance(10000);const active=h.engine.tick();assert.equal(h.saved.status,'PREPARING');assert.equal(h.saved.attempt.date,'2026-10-06');
 const restart=harness({state:h.saved});restart.advance(86400000);await restart.stable();assert.deepEqual(restart.calls,['2026-10-06']);release();await active;
});
test('delivery failures retain inspectable status and retry at most three times',async()=>{
  const h=harness({result:{state:'NEEDS_RECONCILIATION'},notify:()=>{throw new Error(SENTINEL);}});await h.stable();for(let i=0;i<5;i++)await h.engine.tick();
  assert.equal(h.notices.length,3);assert.equal(h.saved.notice.delivered,false);assert.ok(!JSON.stringify(h.saved).includes(SENTINEL));
});
test('resume gap rechecks and concurrent ticks serialize preparation',async()=>{
  let release;const h=harness({prepare:()=>new Promise(resolve=>{release=()=>resolve({state:'NO_CHANGE'});})});
  await h.engine.tick();h.advance(10000);const pending=h.engine.tick();await h.engine.tick();assert.equal(h.calls.length,1);release();await pending;
  h.advance(600000);h.set({...h.snapshot(),sources:'after-resume'});await h.engine.tick();assert.equal(h.saved.status,'SETTLING');
});
test('ownership locks refuse duplicate starts, retain live owners and recover exited owners',async()=>{
  const f=fixture();try{
    const lock=acquireLock(f.stateRoot,'watcher');assert.throws(()=>acquireLock(f.stateRoot,'watcher'),/BUSY/);lock.release();
    const dir=path.join(f.stateRoot,'locks/operation');fs.mkdirSync(dir);writeJSON(path.join(dir,'owner.json'),{pid:99999999,token:'11111111-1111-4111-8111-111111111111'});
    const recovered=acquireLock(f.stateRoot);assert.ok(fs.existsSync(path.join(f.stateRoot,'locks/recovered/operation-11111111-1111-4111-8111-111111111111')));recovered.release();
    await assert.rejects(withWorkflowLock(f.stateRoot,()=>{throw new Error('interrupted');}),/interrupted/);const next=acquireLock(f.stateRoot);next.release();
    fs.mkdirSync(dir);assert.throws(()=>acquireLock(f.stateRoot),/INCOMPLETE/);
  }finally{f.clean();}
});
test('actual manual CLI refuses an active operation lock without modifying workflow state',()=>{
  const f=fixture();try{const before=digest(inventory(f.stateRoot)),lock=acquireLock(f.stateRoot);
    const child=spawnSync(process.execPath,[path.join(ROOT,'scripts/workflow-cli.mjs'),'prepare','--source-root',f.sourceRoot,'--state-root',f.stateRoot,'--release-date','2026-10-06'],{encoding:'utf8'});
    assert.equal(child.status,1);assert.equal(JSON.parse(child.stderr).code,'WORKFLOW_BUSY');lock.release();assert.equal(digest(inventory(f.stateRoot)),before);
  }finally{f.clean();}
});
test('migration copies and verifies all private history, preserves original and refuses replacement',()=>{
  const f=fixture();try{
    const before=digest(inventory(f.stateRoot)),to=path.join(f.base,'local-app-data','workflow');
    const result=migrate({from:f.stateRoot,to,sourceRoot:f.sourceRoot,localRoot:f.base});assert.equal(result.state,'MIGRATED_VERIFIED');
    assert.equal(digest(inventory(f.stateRoot)),before);assert.equal(digest(inventory(to)),before);
    assert.throws(()=>migrate({from:f.stateRoot,to,sourceRoot:f.sourceRoot,localRoot:f.base}),/EXISTS/);
    assert.throws(()=>migrate({from:f.stateRoot,to:path.join(ROOT,'tmp/state'),sourceRoot:f.sourceRoot,localRoot:ROOT}),/DESTINATION/);
  }finally{f.clean();}
});
test('real adapters: private-only change is quiet, conflicting evidence produces one safe notice',async()=>{
  const f=fixture();try{
    let time=Date.now(),notices=[];const read=()=>({sources:inventory(f.sourceRoot),bindings:'fixture',approvedBindings:'fixture'});
    const e=new WatcherEngine({now:()=>time,read,prepare:date=>withWorkflowLock(f.stateRoot,()=>prepare({sourceRoot:f.sourceRoot,stateRoot:f.stateRoot,releaseDate:date})),validateReady:()=>{},notify:async n=>{notices.push(n);return {};},save:()=>{}});
    await e.tick();time+=10000;await e.tick();assert.equal(e.state.status,'NO_CHANGE');
    f.edit('EXPORT',()=>JSON.stringify({private:SENTINEL+'edited'}));await e.tick();time+=10000;await e.tick();assert.equal(notices.length,0);
    f.edit('PUB',t=>t.replace('| S1 | CONTRIB |','| S1 | Published |'));await e.tick();time+=10000;await e.tick();assert.equal(e.state.status,'NEEDS_RECONCILIATION');assert.equal(notices.length,1);
    assert.ok(!JSON.stringify(e.state).includes(SENTINEL));
  }finally{f.clean();}
});
test('actual Windows exclusive file lock retries and recovers without preparing or exposing evidence',{skip:process.platform!=='win32'},async()=>{
 const f=fixture();let locker;
 try {
  const file=path.join(f.sourceRoot,f.data.sources.find(s=>s.id==='EXPORT').path),quoted=file.replaceAll("'","''");
  const code=`$ErrorActionPreference='Stop'; $p07Stream=[IO.File]::Open('${quoted}',[IO.FileMode]::Open,[IO.FileAccess]::ReadWrite,[IO.FileShare]::None); try { [Console]::WriteLine('LOCKED'); [Console]::ReadLine() | Out-Null } finally { $p07Stream.Dispose() }`;
  const encoded=Buffer.from(code,'utf16le').toString('base64');let notices=[],preparations=0;
  const e=new WatcherEngine({read:()=>({sources:readSources(f.sourceRoot,f.data.sources).fingerprints,bindings:'fixture',approvedBindings:'fixture'}),prepare:async()=>{preparations++;return {state:'NO_CHANGE'};},validateReady:()=>{},notify:async n=>{notices.push(n);return {};},save:()=>{}});
  // A persisted healthy fingerprint gives the recovery comparison a baseline.
  await e.tick();e.observation.since-=10000;await e.tick();assert.equal(preparations,1);
  locker=spawn(path.join(process.env.SystemRoot,'System32/WindowsPowerShell/v1.0/powershell.exe'),['-NoProfile','-NonInteractive','-EncodedCommand',encoded],{windowsHide:true,stdio:['pipe','pipe','pipe']});
  await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('LOCK_TRIAL_TIMEOUT')),10000);locker.stdout.once('data',data=>{clearTimeout(timer);data.toString().includes('LOCKED')?resolve():reject(new Error('LOCK_TRIAL_OUTPUT'));});locker.once('error',reject);});
  for(let i=0;i<3;i++)await e.tick();assert.equal(e.state.status,'SOURCE_UNAVAILABLE');assert.equal(notices.length,1);assert.equal(preparations,1);
  const exited=new Promise(resolve=>locker.once('close',resolve));locker.stdin.end('\n');await exited;await e.tick();assert.equal(e.state.status,'NO_CHANGE');assert.equal(preparations,1);
  assert.ok(!JSON.stringify(e.state).includes(SENTINEL));
 }finally{if(locker&&locker.exitCode===null&&locker.signalCode===null)locker.kill();f.clean();}
});
test('real watcher snapshots ignore unrelated files and observe only declared sources and bindings',()=>{
  const f=fixture();try{
    const config={stateRoot:f.stateRoot,sourceRoot:f.sourceRoot,node:process.execPath,python:process.env.SITE_PYTHON,playwright:process.env.SITE_PLAYWRIGHT_MODULE,browser:process.env.SITE_BROWSER_EXECUTABLE,powershell:path.join(process.env.SystemRoot,'System32/WindowsPowerShell/v1.0/powershell.exe')};
    const before=currentSnapshot(config);fs.writeFileSync(path.join(f.sourceRoot,'unrelated-private.txt'),SENTINEL);assert.deepEqual(currentSnapshot(config),before);
    f.edit('EXPORT',()=>'{"private":"changed"}');assert.notDeepEqual(currentSnapshot(config).sources,before.sources);assert.equal(currentSnapshot(config).bindings,before.bindings);
  }finally{f.clean();}
});
test('real public change produces a browser/PDF checked immutable candidate and one ready notice',async()=>{
  const f=fixture();let candidate;try{
    f.edit('EB',t=>t.replaceAll(f.data.profile.email,'watcher-fixture@example.org'));let time=Date.now(),notices=[];
    const read=()=>({sources:JSON.parse(fs.readFileSync(path.join(f.stateRoot,'state.json'))).sources.map(s=>({...s,sha256:digest(fs.readFileSync(path.join(f.sourceRoot,s.path)).toString())})),bindings:'fixture',approvedBindings:'fixture'});
    // Production validateReady requires the original byte SHA-256 fingerprints.
    const {readSources}=await import('../../scripts/workflow-core.mjs');
    const snapshot=()=>({...read(),sources:readSources(f.sourceRoot,f.data.sources).fingerprints});
    const e=new WatcherEngine({now:()=>time,read:snapshot,prepare:date=>withWorkflowLock(f.stateRoot,()=>prepare({sourceRoot:f.sourceRoot,stateRoot:f.stateRoot,releaseDate:date})),validateReady,notify:async n=>{notices.push(n);return {state:'FIXTURE_RECEIPT'};},save:s=>writeJSON(path.join(f.stateRoot,'watcher.json'),s)});
    await e.tick();time+=10000;await e.tick();assert.equal(e.state.status,'READY_FOR_REVIEW');candidate=e.state.pending.candidate;assert.equal(notices.length,1);
    await e.tick();assert.equal(notices.length,1);assert.ok(json(path.join(PACKAGES,candidate,'review.json')).checks.every(c=>c.result==='PASS'));
    assert.ok(!JSON.stringify(e.state).includes(SENTINEL));
  }finally{if(candidate)fs.rmSync(path.join(PACKAGES,candidate),{recursive:true,force:true});f.clean();}
});
