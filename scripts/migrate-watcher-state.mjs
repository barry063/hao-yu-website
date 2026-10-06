/** Opt-in copy/verify only. Retains the previous state as a backup. */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {ROOT, loadPublic} from './public-content.mjs';
import {readState, resolved, inside, sha, digest, writeJSON, json} from './workflow-core.mjs';
import {processAlive} from './workflow-lock.mjs';
export function inventory(root) {
  const files={};
  function visit(folder,prefix='') {
    for(const entry of fs.readdirSync(folder,{withFileTypes:true})) {
      if(entry.isSymbolicLink())throw new Error('MIGRATION_LINK_REFUSED');
      const relative=prefix+entry.name,absolute=path.join(folder,entry.name);
      if(entry.isDirectory())visit(absolute,relative+'/');
      else if(entry.isFile())files[relative]=sha(fs.readFileSync(absolute));
      else throw new Error('MIGRATION_FILE_TYPE');
    }
  }
  visit(root);return files;
}
export function migrate({from,to,sourceRoot,localRoot,verifyExisting=false}) {
  from=resolved(from);to=resolved(to);localRoot=resolved(localRoot);
  if(!inside(localRoot,to)||localRoot===to||inside(ROOT,to)||inside(sourceRoot,to)||/onedrive/i.test(to)||inside(from,to)||inside(to,from))throw new Error('MIGRATION_DESTINATION');
  readState(from,sourceRoot);
  for(const name of ['watcher','operation']) {
    const file=path.join(from,'locks',name,'owner.json');
    if(fs.existsSync(file) && processAlive(json(file).pid))throw new Error('WORKFLOW_BUSY');
  }
  const exists=fs.existsSync(to);
  if(exists&&!verifyExisting)throw new Error('MIGRATION_DESTINATION_EXISTS');
  const before=inventory(from);
  if(!exists){fs.mkdirSync(path.dirname(to),{recursive:true});fs.cpSync(from,to,{recursive:true,errorOnExist:true,force:false,dereference:false});}
  const after=inventory(to);
  if(digest(before)!==digest(after)||digest(before)!==digest(inventory(from)))throw new Error('MIGRATION_HASH_MISMATCH');
  readState(to,sourceRoot);
  if(digest(readState(to,sourceRoot).published)!==digest(loadPublic()))throw new Error('MIGRATION_PUBLISHED_BASELINE');
  const record={state:'MIGRATED_VERIFIED',files:Object.keys(before).length,inventory:digest(before),time:new Date().toISOString(),original_preserved:true};
  writeJSON(path.join(path.dirname(to),'migration.json'),{...record,from,to,file_hashes:before});return record;
}
if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const args=process.argv.slice(2),options={};for(let i=0;i<args.length;i+=2)options[args[i].slice(2)]=args[i+1];
  try {console.log(JSON.stringify(migrate({from:options.from,to:options.to,sourceRoot:options['source-root'],localRoot:options['local-root'],verifyExisting:options['verify-existing-copy']==='true'})));}
  catch(error){console.error(JSON.stringify({state:'FAILED',code:/^[A-Z_]+$/.test(error.message)?error.message:'MIGRATION_FAILED'}));process.exitCode=1;}
}
