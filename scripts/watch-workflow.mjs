/** Local, read-only source watcher. No release or approval imports. */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawn, spawnSync} from 'node:child_process';
import {ROOT} from './public-content.mjs';
import {readState, readSources, inputHashes, sha, digest, json, writeJSON, runtimeInfo, inside, resolved, privateState, privateRecordHash} from './workflow-core.mjs';
import {acquireLock, processAlive} from './workflow-lock.mjs';
import {WatcherEngine} from './watcher-core.mjs';
import {packageFor} from './review-workflow.mjs';
const WATCH_FILES = ['scripts/watch-workflow.mjs','scripts/watcher-core.mjs','scripts/workflow-lock.mjs','scripts/watcher-notify.ps1','scripts/manage-watcher.ps1'];
function environment(config) {
  process.env.SITE_PYTHON = config.python;
  process.env.SITE_PLAYWRIGHT_MODULE = config.playwright;
  process.env.SITE_BROWSER_EXECUTABLE = config.browser;
}
export function loadConfig(file) {
  const config = json(file);
  if (config.version !== 1 || config.repo !== ROOT || !path.isAbsolute(file) || inside(ROOT,resolved(file)) || inside(config.sourceRoot,resolved(file))) throw new Error('WATCHER_CONFIGURATION');
  if (config.intervalMs !== 120000 || config.settleMs !== 10000) throw new Error('WATCHER_TIMING');
  readState(config.stateRoot,config.sourceRoot);
  for (const key of ['node','python','playwright','browser','powershell']) if (!path.isAbsolute(config[key]) || !fs.statSync(config[key]).isFile()) throw new Error('WATCHER_RUNTIME_PATH');
  return config;
}
export function currentSnapshot(config) {
  const state = readState(config.stateRoot, config.sourceRoot);
  const runtimeFiles = Object.fromEntries(['node','python','playwright','browser','powershell'].map(k=>{
    const stat=fs.statSync(config[k]); return [k,{size:stat.size,mtime:stat.mtimeMs}];
  }));
  const {approvedBindings,...settings} = config;
  const bindings = digest({inputs:inputHashes(),watcher:Object.fromEntries(WATCH_FILES.map(f=>[f,sha(fs.readFileSync(path.join(ROOT,f)))])),
    policy:privateRecordHash(state.policyFile),published:privateRecordHash(state.publishedFile),
    configuration:state.config,dataset:sha(fs.readFileSync(path.join(ROOT,'content/site.json'))),settings,runtimeFiles});
  return {sources:readSources(state.source,state.config.sources).fingerprints,bindings,approvedBindings};
}
export function validateReady(result,snapshot) {
  const p=packageFor(result.candidate);
  if (digest(p.manifest.sources)!==digest(snapshot.sources) || digest(p.manifest.inputs)!==digest(inputHashes()) || p.manifest.target!==result.target) throw new Error('STALE_READY_PACKAGE');
}
function runPreparation(config,date,signal) {
  return new Promise((resolve,reject)=>{
    const child=spawn(config.node,[path.join(ROOT,'scripts/workflow-cli.mjs'),'prepare','--source-root',config.sourceRoot,'--state-root',config.stateRoot,'--release-date',date],
      {cwd:ROOT,env:process.env,windowsHide:true,stdio:['ignore','pipe','pipe']});
    let output='';
    const collect=chunk=>{output=(output+chunk.toString()).slice(-65536);};
    child.stdout.on('data',collect);child.stderr.on('data',collect);
    const cancel=()=>{
      // This is the exact child started here; stop its build/browser descendants.
      if (child.exitCode===null && child.pid) {
        if (process.platform==='win32') spawnSync(path.join(process.env.SystemRoot,'System32/taskkill.exe'),['/PID',String(child.pid),'/T','/F'],{windowsHide:true,stdio:'ignore'});
        else child.kill('SIGTERM');
      }
    };
    signal.addEventListener('abort',cancel,{once:true});
    const timeout=setTimeout(cancel,15*60*1000);
    child.on('error',()=>reject(new Error('PREPARATION_START_FAILED')));
    child.on('close',()=>{
      clearTimeout(timeout);signal.removeEventListener('abort',cancel);
      try { resolve(JSON.parse(output)); } catch { reject(new Error('PREPARATION_OUTPUT')); }
    });
  });
}
function notification(config,notice) {
  const result=spawnSync(config.powershell,['-NoProfile','-NonInteractive','-ExecutionPolicy','Bypass','-WindowStyle','Hidden','-File',path.join(ROOT,'scripts/watcher-notify.ps1'),'-Kind',notice.kind,'-Tag',notice.key.slice(0,16)],{encoding:'utf8',windowsHide:true,timeout:30000});
  if (result.status!==0) throw new Error('NOTIFICATION_DELIVERY');
  return JSON.parse(result.stdout.trim());
}
export async function runWatcher(configFile,{once=false}={}) {
  let config=loadConfig(configFile);environment(config);
  const lock=acquireLock(config.stateRoot,'watcher'),stateFile=path.join(config.stateRoot,'watcher.json'),stopFile=path.join(config.stateRoot,'watcher-stop.json');
  const abort=new AbortController();let stopping=false;
  const stop=()=>{stopping=true;abort.abort();};
  process.on('SIGINT',stop);process.on('SIGTERM',stop);
  const checkStop=setInterval(()=>{
    try { if(JSON.parse(fs.readFileSync(stopFile,'utf8').replace(/^\uFEFF/, '')).token===lock.owner.token)stop(); } catch {}
  },1000);
  const saved=fs.existsSync(stateFile)?json(stateFile):{};
  const engine=new WatcherEngine({state:saved,settleMs:config.settleMs,retryMs:config.intervalMs,
    read:()=>{config=loadConfig(configFile);environment(config);return currentSnapshot(config);},
    prepare:date=>runPreparation(config,date,abort.signal),validateReady,
    notify:notice=>{running.notificationLaunches++;return notification(config,notice);},save:state=>writeJSON(stateFile,state)});
  const running={pid:process.pid,token:lock.owner.token,started:new Date().toISOString(),polls:0,preparations:0,workerLaunches:0,notificationLaunches:0,resumeGaps:0};
  const health=path.join(config.stateRoot,'watcher-health.json');
  const original=engine.prepare;engine.prepare=async date=>{running.preparations++;running.workerLaunches++;return original(date);};
  let last=Date.now();
  try {
    while(!stopping){
      const now=Date.now();if(now-last>config.intervalMs*2)running.resumeGaps++;
      last=now;await engine.tick();running.polls++;running.checked=new Date().toISOString();writeJSON(health,{...running,running:true});
      if(once)break;
      // A detected edit receives a second read after the settling window.
      const delay=['SETTLING','INPUTS_CHANGED_DURING_PREPARATION'].includes(engine.state.status) ? config.settleMs : config.intervalMs;
      await new Promise(resolve=>{
        const finish=()=>{clearTimeout(timer);abort.signal.removeEventListener('abort',finish);resolve();};
        const timer=setTimeout(finish,delay);abort.signal.addEventListener('abort',finish,{once:true});
        if(abort.signal.aborted)finish();
      });
    }
  } finally {
    clearInterval(checkStop);process.removeListener('SIGINT',stop);process.removeListener('SIGTERM',stop);
    writeJSON(health,{...running,running:false,stopped:new Date().toISOString()});lock.release();
  }
}
const [command,...args]=process.argv.slice(2),options={};
for(let i=0;i<args.length;i+=2){if(!args[i].startsWith('--')||!args[i+1])throw new Error('WATCHER_ARGUMENT');options[args[i].slice(2)]=args[i+1];}
if(command && path.resolve(process.argv[1]||'')===fileURLToPath(import.meta.url)) {
  try {
    const file=options.config;
    if(command==='configure'){
      const config={version:1,repo:ROOT,node:process.execPath,sourceRoot:options['source-root'],stateRoot:options['state-root'],python:options.python,playwright:options.playwright,browser:options.browser,
        powershell:options.powershell,intervalMs:120000,settleMs:10000};
      if(fs.existsSync(file))throw new Error('EXISTING_CONFIGURATION_PRESERVED');
      privateState(config.stateRoot,config.sourceRoot);
      if(!path.isAbsolute(file)||inside(ROOT,resolved(file))||inside(config.sourceRoot,resolved(file)))throw new Error('WATCHER_CONFIGURATION');
      environment(config);runtimeInfo();readState(config.stateRoot,config.sourceRoot);
      config.approvedBindings=currentSnapshot(config).bindings;writeJSON(file,config);loadConfig(file);console.log('{"state":"CONFIGURED"}');
    }else if(command==='revalidate'){
      const config=loadConfig(file),lock=acquireLock(config.stateRoot,'watcher');
      try {
        const operation=acquireLock(config.stateRoot);
        try {environment(config);runtimeInfo();config.approvedBindings=currentSnapshot(config).bindings;writeJSON(file,config);
          const stateFile=path.join(config.stateRoot,'watcher.json'),saved=fs.existsSync(stateFile)?json(stateFile):{};
          writeJSON(stateFile,{...saved,processed:null,pending:null,notice:null,status:'REVALIDATED'});
        }finally{operation.release();}
      }finally{lock.release();}
      console.log('{"state":"REVALIDATED"}');
    }else if(command==='run'||command==='once')await runWatcher(file,{once:command==='once'});
    else if(command==='status'){
      const config=loadConfig(file),stateFile=path.join(config.stateRoot,'watcher.json'),ownerFile=path.join(config.stateRoot,'locks/watcher/owner.json');
      const saved=fs.existsSync(stateFile)?json(stateFile):{};let running=false;
      if(fs.existsSync(ownerFile))running=processAlive(json(ownerFile).pid);
      console.log(JSON.stringify({running,status:saved.status||'NOT_STARTED',pending:saved.pending||null,notification:saved.notice?{delivered:saved.notice.delivered,attempts:saved.notice.attempts}:null},null,2));
    }else throw new Error('WATCHER_COMMAND');
  } catch(error){console.error(JSON.stringify({state:'FAILED',code:/^[A-Z_]+$/.test(error.message)?error.message:'WATCHER_FAILURE'}));process.exitCode=1;}
}
