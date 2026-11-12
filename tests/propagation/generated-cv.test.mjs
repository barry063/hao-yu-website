/** Verify the generated-PDF fallback independently of frozen master derivatives. */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {ROOT,loadPublic,normalise,formatDate} from '../../scripts/public-content.mjs';

test('generated PDF accepts ordinary verification prose but rejects review markers and private references',()=>{
  const base=fs.mkdtempSync(path.join(os.tmpdir(),'hao-generated-cv-'));
  try {
    const data=loadPublic();delete data.presentation.cv_document;
    const source=path.join(base,'source.json'),normalised=path.join(base,'normalised.json'),pdf=path.join(base,'candidate.pdf');
    fs.writeFileSync(source,JSON.stringify(data));
    const model={...normalise(data),release_label:formatDate(data.release_date)};
    // Deliberately corrupt the rendered model to test the final PDF privacy gate,
    // independently of the earlier public-dataset validation boundary.
    for(const [addition,error] of [
      [' We verify sample identity before measurement.',null],
      [' [verify]','Unresolved review marker'],
      [' VERIFY','Unresolved review marker'],
      [' TODO','Unresolved review marker'],
      [' MQT-123456','Private or unsupported claim'],
      [' nn-2099-12345x','Private or unsupported claim'],
    ]) {
      const candidate=structuredClone(model);
      candidate.records.find(r=>r.id==='PROFILE').text[0]+=addition;
      fs.writeFileSync(normalised,JSON.stringify(candidate));
      const built=spawnSync(process.env.SITE_PYTHON||'python',[
        path.join(ROOT,'scripts/build_public_cv.py'),'--data',normalised,'--output',pdf,
      ],{encoding:'utf8'});
      assert.equal(built.status,0,built.stderr);
      const checked=spawnSync(process.env.SITE_PYTHON||'python',[
        path.join(ROOT,'scripts/check_public_cv.py'),pdf,source,
      ],{encoding:'utf8'});
      if(error) {
        assert.notEqual(checked.status,0,'Unsafe PDF was accepted');
        assert.ok(checked.stderr.includes(error),checked.stderr);
      } else assert.equal(checked.status,0,checked.stderr);
    }
  } finally {
    if(path.dirname(base)!==path.resolve(os.tmpdir()))throw new Error('FIXTURE_LOCATION');
    fs.rmSync(base,{recursive:true,force:true});
  }
});
