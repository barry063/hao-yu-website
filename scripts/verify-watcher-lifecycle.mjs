/** Explicit synthetic foreground trial, never real source edits or publication. */
import fs from 'node:fs';
import path from 'node:path';
import {spawn,spawnSync} from 'node:child_process';
import {ROOT} from './public-content.mjs';
import {fixture} from '../tests/propagation/workflow-fixture.mjs';
import {json,writeJSON} from './workflow-core.mjs';
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function until(check,timeout=120000) {const start=Date.now();while(Date.now()-start<timeout){try{if(check())return;}catch{}await pause(250);}throw new Error('LIFECYCLE_TIMEOUT');}
const f=fixture(),checks=[],created=[];let child;
const configFile=path.join(f.base,'config.json'),cli=path.join(ROOT,'scripts/watch-workflow.mjs');
const configArgs=['configure','--config',configFile,'--source-root',f.sourceRoot,'--state-root',f.stateRoot,'--python',process.env.SITE_PYTHON,
  '--playwright',process.env.SITE_PLAYWRIGHT_MODULE,'--browser',process.env.SITE_BROWSER_EXECUTABLE,'--powershell',path.join(process.env.SystemRoot,'System32/WindowsPowerShell/v1.0/powershell.exe')];
const health=()=>json(path.join(f.stateRoot,'watcher-health.json')),state=()=>json(path.join(f.stateRoot,'watcher.json'));
function start(){child=spawn(process.execPath,[cli,'run','--config',configFile],{cwd:ROOT,windowsHide:true,stdio:'ignore'});return child;}
async function stop(){const owner=json(path.join(f.stateRoot,'locks/watcher/owner.json'));writeJSON(path.join(f.stateRoot,'watcher-stop.json'),{token:owner.token});await until(()=>child.exitCode!==null,15000);if(child.exitCode!==0)throw new Error('STOP_FAILED');}
try {
  const configured=spawnSync(process.execPath,[cli,...configArgs],{encoding:'utf8'});if(configured.status!==0)throw new Error('FIXTURE_CONFIGURATION_FAILED');
  start();await until(()=>state().status==='NO_CHANGE'&&health().polls>=2);checks.push({id:'FOREGROUND_NO_CHANGE',result:'PASS'});
  const duplicate=spawnSync(process.execPath,[cli,'run','--config',configFile],{encoding:'utf8'});
  if(duplicate.status!==1||JSON.parse(duplicate.stderr).code!=='WORKFLOW_BUSY')throw new Error('DUPLICATE_NOT_REFUSED');checks.push({id:'DUPLICATE_PROCESS',result:'PASS'});
  await stop();checks.push({id:'GRACEFUL_STOP',result:'PASS'});
  f.edit('EB',text=>text.replaceAll(f.data.profile.email,'foreground-fixture@example.org'));
  start();await until(()=>state().status==='READY_FOR_REVIEW'&&state().notice.delivered,180000);created.push(state().pending.candidate);
  checks.push({id:'FOREGROUND_READY_NATIVE_NOTICE',result:'PASS',receipt:state().notice.receipt});
  await stop();const notice=state().notice;start();await until(()=>health().pid===child.pid&&health().polls>=1);
  if(health().preparations!==0||state().notice.key!==notice.key||state().notice.attempts!==notice.attempts)throw new Error('RESTART_DUPLICATION');checks.push({id:'RESTART_DEDUPLICATION',result:'PASS'});
  // Kill only this exact child while idle to leave a stale ownership lock.
  child.kill();await until(()=>child.exitCode!==null||child.signalCode!==null);start();await until(()=>health().pid===child.pid&&health().polls>=1);
  if(!fs.readdirSync(path.join(f.stateRoot,'locks/recovered')).some(name=>name.startsWith('watcher-')))throw new Error('STALE_LOCK_NOT_RECOVERED');
  checks.push({id:'PROCESS_INTERRUPTION_RECOVERY',result:'PASS'});await stop();
  f.edit('PUB',text=>text.replace('| S1 | CONTRIB |','| S1 | Published |'));start();
  await until(()=>state().status==='NEEDS_RECONCILIATION'&&state().notice.delivered,60000);
  checks.push({id:'FOREGROUND_CONFLICT_NATIVE_NOTICE',result:'PASS',receipt:state().notice.receipt});await stop();
  const report={state:'FOREGROUND_VERIFIED',checks,time:new Date().toISOString()};
  writeJSON(path.join(ROOT,'tmp/p07-foreground-checks.json'),report);console.log(JSON.stringify(report,null,2));
} finally {
  if(child&&child.exitCode===null){try{await stop();}catch{child.kill();await pause(1000);}}
  for(const id of created){const folder=path.join(ROOT,'tmp/candidates',id);if(/^[a-f0-9]{64}$/.test(id)&&path.dirname(folder)===path.join(ROOT,'tmp/candidates'))fs.rmSync(folder,{recursive:true,force:true});}
  f.clean();
}
