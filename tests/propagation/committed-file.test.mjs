import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {readCommittedFile} from '../../scripts/release-workflow.mjs';

test('release verification reads complete committed binary files above 1 MiB independently of working files',()=>{
  const cwd=fs.mkdtempSync(path.join(os.tmpdir(),'hao-committed-file-'));
  const git=(...args)=>execFileSync('git',args,{cwd,encoding:'utf8',stdio:['pipe','pipe','pipe']});
  try {
    const file='assets/Hao_Yu_CV_CN.pdf',binary=Buffer.alloc(2*1024*1024+193);
    for(let i=0;i<binary.length;i++)binary[i]=(i*17+41)&255;
    assert.ok(binary.length>1024*1024);
    fs.mkdirSync(path.join(cwd,'assets'));
    fs.writeFileSync(path.join(cwd,file),binary);
    fs.writeFileSync(path.join(cwd,'index.html'),'Synthetic committed page\n');
    fs.writeFileSync(path.join(cwd,'.nojekyll'),'');
    git('init','--quiet');
    git('-c','core.autocrlf=false','add','--',file,'index.html','.nojekyll');
    git('-c','user.name=Synthetic test','-c','user.email=fixture@example.invalid',
      '-c','core.hooksPath=/dev/null','commit','--quiet','--no-gpg-sign','-m','Synthetic binary fixture');
    const commit=git('rev-parse','HEAD').trim();
    fs.writeFileSync(path.join(cwd,file),'Uncommitted replacement');
    assert.deepEqual(readCommittedFile(commit,file,{cwd}),binary);
    assert.equal(readCommittedFile(commit,'index.html',{cwd}).toString(),'Synthetic committed page\n');
    assert.equal(readCommittedFile(commit,'.nojekyll',{cwd}).length,0);
  } finally {
    if(path.dirname(fs.realpathSync(cwd))!==fs.realpathSync(os.tmpdir()))throw new Error('FIXTURE_LOCATION');
    fs.rmSync(cwd,{recursive:true,force:true});
  }
});
