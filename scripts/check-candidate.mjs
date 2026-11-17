/** Reuse release checks against isolated output; never checks live URLs. */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { ROOT, loadPublic, visitorFiles } from './public-content.mjs';

const root = path.resolve(process.argv[2] || 'tmp/candidates/p01-p02');
const dataset = path.resolve(process.argv[3] || 'content/site.json');
const files=visitorFiles(loadPublic(dataset));
function list(dir, prefix = '') {
  return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e => {
    if (e.isSymbolicLink()) throw new Error('Candidate symlink refused');
    return e.isDirectory() ? list(path.join(dir,e.name),prefix+e.name+'/') : [prefix+e.name];
  });
}
const actual = list(root).sort();
if (JSON.stringify(actual) !== JSON.stringify([...files].sort())) throw new Error('Candidate visitor allowlist mismatch');
for (const [script,args] of [['check-html.mjs',[root,dataset]],['check-site.mjs',[root,dataset]],['check-preview.mjs',[root,dataset]],['navigation.test.mjs',[]]]) {
  const result = spawnSync(process.execPath,[path.join(ROOT,'scripts',script),...args],{encoding:'utf8'});
  if (result.status !== 0) { console.error(result.stdout); console.error(result.stderr); throw new Error('Candidate check failed: '+script); }
  console.log(result.stdout.trim());
}
console.log('PASS: candidate HTML validator and exact visitor allowlist. PDF/visual QA are separate checks.');
