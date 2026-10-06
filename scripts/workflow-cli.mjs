import path from 'node:path';
import { ROOT } from './public-content.mjs';
import { calibrate, prepare } from './prepare-update.mjs';
import { approve, gate, packageFor } from './review-workflow.mjs';
import { promote, rollback, verifyLive } from './release-workflow.mjs';
import { browserQA } from './browser-qa.mjs';
import { privateState } from './workflow-core.mjs';
import { acquireLock } from './workflow-lock.mjs';
const [command,...args]=process.argv.slice(2),options={};
const names={'--source-root':'sourceRoot','--state-root':'stateRoot','--candidate':'id','--target':'target','--release-date':'releaseDate','--actor':'actor','--statement':'statement','--decision':'decision','--commit':'commit','--rollback':'id','--data':'input'};
let operationLock;
try {
  for(let i=0;i<args.length;i++){if(args[i]==='--force-candidate'){options.force=true;continue;}
    if(args[i]==='--refresh-reviewed-calibration'){options.refresh=true;continue;}
    if(args[i]==='--authorise-publication'){options.authorisePublication=true;continue;}
    if(args[i]==='--authorise-restoration'){options.authoriseRestoration=true;options.dryRun=false;continue;}
    if(!names[args[i]]||!args[i+1])throw new Error('INVALID_ARGUMENT');options[names[args[i]]]=args[++i];}
  if (options.stateRoot && options.sourceRoot) operationLock = acquireLock(privateState(options.stateRoot,options.sourceRoot).state);
  let result;
  if(command==='calibrate')result=calibrate(options);
  else if(command==='prepare')result=await prepare(options);
  else if(command==='approve')result=approve(options);
  else if(command==='gate'){gate(options);result={state:'APPROVED',candidate:options.id};}
  else if(command==='promote')result=promote(options);
  else if(command==='rollback')result=rollback(options);
  else if(command==='qa'){const p=packageFor(options.id);result=await browserQA({visitor:path.join(p.dir,'visitor'),evidence:path.join(ROOT,'tmp/qa',options.id)});}
  else if(command==='verify-live')result=await verifyLive({...options,browserCheck:target=>browserQA({target,evidence:path.join(ROOT,'tmp/qa/live-'+options.id)})});
  else throw new Error('COMMAND_REQUIRED');
  console.log(JSON.stringify(result,null,2));if(['FAILED','NEEDS_RECONCILIATION'].includes(result.state))process.exitCode=1;
} catch(error){console.error(JSON.stringify({state:/^STALE/.test(error.message)?'STALE':'FAILED',code:/^[A-Z_]+$/.test(error.message)?error.message:'WORKFLOW_REFUSED'}));process.exitCode=1;}
finally { if (operationLock) operationLock.release(); }
