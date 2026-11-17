import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {ROOT,loadPublic,visitorFiles} from '../../scripts/public-content.mjs';
import {buildSite} from '../../scripts/build-site.mjs';
import {createPreviewServer} from '../../scripts/preview.mjs';

test('real bilingual package is deterministic, serves both directory routes and rejects wrong-language downloads',async()=>{
  if(!process.env.SITE_PYTHON)throw new Error('Pinned PDF/image runtime required');
  const input=path.join(ROOT,'content/proposals/2026-11-17.json'),data=loadPublic(input);
  const folder=fs.mkdtempSync(path.join(ROOT,'tmp/candidates/bilingual-build-'));
  let server;
  try {
    const a=path.join(folder,'a'),b=path.join(folder,'b');
    const first=buildSite({out:a,input}),second=buildSite({out:b,input});
    assert.deepEqual(first.hashes,second.hashes,'Both locale pages, PDFs and cards must reproduce exactly');
    assert.deepEqual(Object.keys(first.hashes).sort(),[...visitorFiles(data)].sort());
    for(const name of ['zh/index.html','assets/Hao_Yu_CV_CN.pdf','assets/og-image-zh.png'])assert.ok(first.hashes[name]);
    const check=spawnSync(process.execPath,[path.join(ROOT,'scripts/check-candidate.mjs'),a,input],{encoding:'utf8'});
    assert.equal(check.status,0,check.stdout+check.stderr);
    server=createPreviewServer(a);await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
    const base=`http://127.0.0.1:${server.address().port}/hao-yu-website/`;
    for(const [route,file] of [['','index.html'],['zh/','zh/index.html'],['zh/index.html','zh/index.html']]){
      const r=await fetch(base+route);assert.equal(r.status,200);
      assert.ok(Buffer.from(await r.arrayBuffer()).equals(fs.readFileSync(path.join(a,file))));
    }
    for(const file of ['assets/Hao_Yu_CV.pdf','assets/Hao_Yu_CV_CN.pdf']){
      const r=await fetch(base+file,{method:'HEAD'});assert.equal(r.status,200);
      assert.equal(r.headers.get('content-type'),'application/pdf');
      assert.equal(Number(r.headers.get('content-length')),fs.statSync(path.join(a,file)).size);
    }
    for(const file of ['content/proposals/2026-11-17.json','zh/../content/site.json','build-resources/fonts/FandolHei-Regular.otf']){
      const r=await fetch(base+file);await r.body?.cancel();assert.equal(r.status,404);
    }
    const file=path.join(a,'zh/index.html'),original=fs.readFileSync(file,'utf8');
    fs.writeFileSync(file,original.replaceAll('../assets/Hao_Yu_CV_CN.pdf','../assets/Hao_Yu_CV.pdf'));
    const wrong=spawnSync(process.execPath,[path.join(ROOT,'scripts/check-site.mjs'),a,input],{encoding:'utf8'});
    assert.notEqual(wrong.status,0);assert.match(wrong.stderr,/Wrong-language CV link/);
    fs.writeFileSync(file,original.replace('</body>','<a href="../assets/Hao_Yu_CV.pdf?download=1#page=1">Additional CV</a></body>'));
    const queried=spawnSync(process.execPath,[path.join(ROOT,'scripts/check-site.mjs'),a,input],{encoding:'utf8'});
    assert.notEqual(queried.status,0);assert.match(queried.stderr,/Wrong-language CV link/);
  } finally {
    if(server)await new Promise(resolve=>server.close(resolve));
    const relative=path.relative(path.join(ROOT,'tmp/candidates'),folder);
    assert.ok(relative.startsWith('bilingual-build-')&&!relative.includes(path.sep));
    fs.rmSync(folder,{recursive:true,force:true});
  }
});
