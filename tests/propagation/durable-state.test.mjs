import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {readJSON,saveJSON} from '../../scripts/durable-json.mjs';
import {readState,privateRecordHash} from '../../scripts/workflow-core.mjs';
import {fixture} from './workflow-fixture.mjs';
test('cross-device/encrypted replacement keeps two bounded checksummed slots and survives torn writes',()=>{
 const folder=fs.mkdtempSync(path.join(os.tmpdir(),'hao-durable-fixture-')),file=path.join(folder,'state.json');
 try {
  const refuse=()=>{const e=new Error('encrypted rename');e.code='EXDEV';throw e;};
  saveJSON(file,{processed:'A',notice:'delivered'},{rename:refuse});assert.deepEqual(readJSON(file),{processed:'A',notice:'delivered'});
  saveJSON(file,{processed:'B',notice:'delivered'});assert.equal(readJSON(file).processed,'B');
  fs.writeFileSync(file+'.slot-1','{"sequence":3,"payload":');fs.writeFileSync(file,'{torn mirror');assert.equal(readJSON(file).processed,'B');
  for(let i=0;i<20;i++)saveJSON(file,{processed:i});assert.equal(readJSON(file).processed,19);
  assert.equal(fs.readdirSync(folder).length,3);assert.ok(!fs.readdirSync(folder).some(f=>f.includes('.writing-')));
  const names=[file+'.slot-0',file+'.slot-1'];for(const name of names){const record=JSON.parse(fs.readFileSync(name));record.sequence+=100;fs.writeFileSync(name,JSON.stringify(record));}
  assert.throws(()=>readJSON(file),/JOURNAL_INVALID/);
 }finally{fs.rmSync(folder,{recursive:true,force:true});}
});
test('ordinary JSON uses atomic replacement and reads historical UTF-8 BOM records',()=>{
 const folder=fs.mkdtempSync(path.join(os.tmpdir(),'hao-durable-fixture-')),file=path.join(folder,'state.json');
 try{fs.writeFileSync(file,'\uFEFF{"historical":true}');assert.equal(readJSON(file).historical,true);saveJSON(file,{status:'NO_CHANGE'});assert.deepEqual(readJSON(file),{status:'NO_CHANGE'});assert.equal(fs.readdirSync(folder).length,1);}
 finally{fs.rmSync(folder,{recursive:true,force:true});}
});
test('recovered public policy/baseline records invalidate bindings even when their mirrors remain old',()=>{
 const f=fixture();try{
  const state=readState(f.stateRoot,f.sourceRoot);
  for(const [file,key] of [[state.policyFile,'policy'],[state.publishedFile,'published']]) {
   const bytes=fs.readFileSync(file),before=privateRecordHash(file),changed=structuredClone(state[key]);changed.profile.email='recovered-fixture@example.org';
   saveJSON(file,changed,{journalOnly:true});fs.writeFileSync(file,bytes);
   assert.equal(readState(f.stateRoot,f.sourceRoot)[key].profile.email,'recovered-fixture@example.org');
   assert.notEqual(privateRecordHash(file),before);
  }
 }finally{f.clean();}
});
