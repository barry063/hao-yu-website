/** Cross-process ownership for the public CLI and local watcher. */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
export function processAlive(pid) {
  if (!Number.isSafeInteger(pid) || pid < 1) throw new Error('LOCK_OWNER_INVALID');
  try { process.kill(pid, 0); return true; }
  catch (error) { if (error.code === 'ESRCH') return false; return true; }
}
export function acquireLock(stateRoot, name = 'operation', {alive = processAlive} = {}) {
  if (!['operation', 'watcher'].includes(name)) throw new Error('LOCK_NAME');
  const directory = path.join(stateRoot, 'locks', name);
  const token = crypto.randomUUID();
  fs.mkdirSync(path.dirname(directory), {recursive: true});
  for (let attempt = 0; attempt < 2; attempt++) {
    try { fs.mkdirSync(directory); }
    catch (error) {
      if (error.code !== 'EEXIST') throw error;
      let owner;
      try { owner = JSON.parse(fs.readFileSync(path.join(directory, 'owner.json'), 'utf8')); }
      catch { throw new Error('LOCK_INCOMPLETE_REQUIRES_INSPECTION'); }
      if (!/^[a-f0-9-]{36}$/.test(owner.token || '') || alive(owner.pid)) throw new Error('WORKFLOW_BUSY');
      // A deterministic, retained claim prevents two recoverers from deleting
      // a replacement owner's directory after reading the same stale owner.
      const recovered = path.join(stateRoot, 'locks', 'recovered');
      fs.mkdirSync(recovered, {recursive: true});
      const claim=path.join(recovered,name+'-'+owner.token);
      try { fs.mkdirSync(claim); }
      catch { throw new Error('WORKFLOW_BUSY'); }
      fs.writeFileSync(path.join(claim,'owner.json'),JSON.stringify(owner),{flag:'wx'});
      const current=JSON.parse(fs.readFileSync(path.join(directory,'owner.json'),'utf8'));
      if(current.token!==owner.token||alive(current.pid))throw new Error('WORKFLOW_BUSY');
      fs.unlinkSync(path.join(directory,'owner.json'));fs.rmdirSync(directory);
      continue;
    }
    const owner = {pid: process.pid, token, created: new Date().toISOString()};
    fs.writeFileSync(path.join(directory, 'owner.json'), JSON.stringify(owner), {flag: 'wx'});
    return {owner, release() {
      const current = JSON.parse(fs.readFileSync(path.join(directory, 'owner.json'), 'utf8'));
      if (current.token !== token || current.pid !== process.pid) throw new Error('LOCK_OWNERSHIP_CHANGED');
      fs.unlinkSync(path.join(directory, 'owner.json')); fs.rmdirSync(directory);
    }};
  }
  throw new Error('WORKFLOW_BUSY');
}
export async function withWorkflowLock(stateRoot, action) {
  const lock = acquireLock(stateRoot);
  try { return await action(); } finally { lock.release(); }
}
