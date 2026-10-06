import {test} from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {ROOT,VISITOR_FILES,normalise} from '../../scripts/public-content.mjs';
import {readSources,readState,sha,json,writeJSON,digest,inputHashes,publicChanges,removeOwnedDirectory} from '../../scripts/workflow-core.mjs';
import {derivePublic} from '../../scripts/canonical-adapters.mjs';
import {prepare,calibrate} from '../../scripts/prepare-update.mjs';
import {approve,gate,packageFor,PACKAGES} from '../../scripts/review-workflow.mjs';
import {promote,rollback} from '../../scripts/release-workflow.mjs';
import {renderSite} from '../../scripts/render-site.mjs';
import {fixture,SENTINEL} from './workflow-fixture.mjs';
const snapshot=f=>readSources(f.sourceRoot,f.data.sources);
const derive=f=>derivePublic(f.data,snapshot(f).texts,f.texts);
const opts=f=>({sourceRoot:f.sourceRoot,stateRoot:f.stateRoot,releaseDate:'2026-10-06'});
test('initial reviewed policy cannot make a pending change count as already published',()=>{
 const f=fixture();try{
 f.edit('EB',t=>t.replaceAll(f.data.profile.email,'pending-fixture@example.org'));
 const current=snapshot(f),pending=derivePublic(f.data,current.texts,current.texts);pending.sources=current.fingerprints;
 const input=path.join(f.base,'pending-policy.json'),stateRoot=path.join(f.base,'new-private-state');writeJSON(input,pending);
 calibrate({sourceRoot:f.sourceRoot,stateRoot,input});const state=readState(stateRoot,f.sourceRoot);
 assert.equal(state.published.profile.email,f.data.profile.email);assert.equal(state.policy.profile.email,'pending-fixture@example.org');
 assert.ok(publicChanges(state.published,state.policy).some(c=>c.field==='/profile/email'));
 }finally{f.clean();}
});
test('unchanged and private-only edits are NO_CHANGE; approved baseline remains intact',async()=>{
 const f=fixture();try{const baseline=sha(fs.readFileSync(path.join(f.stateRoot,'published.json')));
 assert.equal((await prepare(opts(f))).state,'NO_CHANGE');
 f.edit('EXPORT',()=>JSON.stringify({private:SENTINEL+'edited'}));f.edit('CONTRIB',t=>t.replaceAll(SENTINEL,SENTINEL+'edited'));
 f.edit('EB',t=>t.replaceAll(SENTINEL,SENTINEL+'edited'));
 assert.equal((await prepare(opts(f))).state,'NO_CHANGE');assert.equal(sha(fs.readFileSync(path.join(f.stateRoot,'published.json'))),baseline);
 }finally{f.clean();}
});
test('single owner status and contact/link edits reach project, output groups, profile metadata and CV model',()=>{
 const f=fixture();try{f.editRecords(r=>r.find(o=>o.id==='S1').status='accepted');
 f.edit('EB',t=>t.replaceAll(f.data.profile.email,'fixture@example.org').replaceAll(f.data.links.find(l=>l.id==='ORCID').url,'https://orcid.org/0000-0000-0000-0000'));
 const d=derive(f),html=renderSite(d),n=normalise(d);assert.ok(html.includes('The co-authored manuscript is accepted.'));
 assert.ok(html.includes('>Accepted<'));assert.equal(d.outputs.find(o=>o.id==='S1').authors,null);assert.equal(n.site.email,'fixture@example.org');
 assert.ok(html.includes('mailto:fixture@example.org'));assert.ok(html.includes('0000-0000-0000-0000'));
 }finally{f.clean();}
});
test('precleared addition, deletion and clearance loss update counts and dependent project wording',()=>{
 const f=fixture();try{const slot=structuredClone(f.data.outputs[0]);slot.id='J5';slot.title='A cleared synthetic article';f.data.outputs.push(slot);
 const raw=JSON.parse(f.texts.CONTRIB).records[0];f.editRecords(r=>r.push({...raw,id:'J5',title:slot.title}));
 f.edit('EB',t=>t.replace('# 10. Awards','| J5 | CONTRIB |\n# 10. Awards'));f.edit('PUB',t=>t+'| J5 | CONTRIB |\n');
 // This owner-reference addition is structural, and explicitly reviewed with the new slot.
 f.texts.EB=snapshot(f).texts.EB;f.texts.PUB=snapshot(f).texts.PUB;
 assert.ok(renderSite(derive(f)).includes('Published journal articles <span>5</span>'));
 f.editRecords(r=>r.splice(r.findIndex(o=>o.id==='J2'),1));assert.ok(!renderSite(derive(f)).includes('data-record="J2"'));
 f.editRecords(r=>r.find(o=>o.id==='S1').public_visibility='HOLD');const d=derive(f);
 assert.ok(!d.outputs.some(o=>o.id==='S1'));assert.ok(!d.narratives.some(n=>n.id==='PROJECT-MOS2'));
 }finally{f.clean();}
});
test('submission, viva and award are distinct; no title or role promotion is inferred',()=>{
 const f=fixture();try{f.edit('EB',t=>t.replace('## 5.1','| Viva completed | 2 October 2026; applicant-confirmed |\n## 5.1'));
 let d=derive(f);assert.ok(d.qualification_events.some(e=>e.kind==='VIVA_COMPLETED'));assert.ok(!d.qualification_events.some(e=>e.kind==='DEGREE_AWARDED'));
 assert.ok(renderSite(d).includes('Viva completed 2 October 2026.'));assert.equal(d.profile.role,f.data.profile.role);
 f.edit('EB',t=>t.replace('## 5.1','| Degree awarded | 5 October 2026; VERIFIED |\n## 5.1'));
 d=derive(f);assert.ok(normalise(d).records.find(r=>r.id==='EDU-CAM').text.join(' ').includes('Degree awarded 5 October 2026.'));assert.equal(d.profile.name,f.data.profile.name);
 }finally{f.clean();}
});
test('explicit reviewed recalibration retains publication baseline; addition/deletion/clearance/viva reach an actual PDF',async()=>{
 const f=fixture();let candidate;try{
 const published=sha(fs.readFileSync(path.join(f.stateRoot,'published.json'))),oldConfig=json(path.join(f.stateRoot,'state.json'));
 const slot=structuredClone(f.data.outputs[0]);slot.id='J5';slot.title='A cleared synthetic article';f.data.outputs.push(slot);
 f.editRecords(r=>{r.push({...r[0],id:'J5',title:slot.title});r.splice(r.findIndex(o=>o.id==='J2'),1);r.find(o=>o.id==='S1').public_visibility='HOLD';});
 f.edit('EB',t=>t.replace('## 5.1','| Viva completed | 2 October 2026; applicant-confirmed |\n## 5.1').replace('# 10. Awards','| J5 | CONTRIB |\n# 10. Awards'));
 f.edit('PUB',t=>t+'| J5 | CONTRIB |\n');f.texts.EB=snapshot(f).texts.EB;f.texts.PUB=snapshot(f).texts.PUB;
 const reviewed=derive(f);reviewed.sources=snapshot(f).fingerprints;const input=path.join(f.base,'reconciled-public.json');writeJSON(input,reviewed);
 assert.throws(()=>calibrate({...opts(f),input}),/EXISTING/);calibrate({...opts(f),input,refresh:true});
 assert.equal(sha(fs.readFileSync(path.join(f.stateRoot,'published.json'))),published);assert.notEqual(json(path.join(f.stateRoot,'state.json')).policy_file,oldConfig.policy_file);
 const result=await prepare(opts(f));assert.equal(result.state,'READY_FOR_REVIEW',JSON.stringify(result));candidate=result.candidate;const p=packageFor(candidate);
 assert.ok(p.review.changes.some(c=>c.field==='/outputs/J5'));assert.ok(p.review.changes.some(c=>c.field==='/outputs/J2'));
 const parsed=spawnSync(process.env.SITE_PYTHON||'python',['-c','import pdfplumber,sys;print(" ".join(p.extract_text() for p in pdfplumber.open(sys.argv[1]).pages))',path.join(p.dir,'visitor/assets/Hao_Yu_CV.pdf')],{encoding:'utf8'});
 assert.equal(parsed.status,0);assert.ok(parsed.stdout.includes(slot.title));assert.ok(parsed.stdout.includes('Viva completed 2 October 2026.'));
 assert.ok(!parsed.stdout.includes(f.data.outputs.find(o=>o.id==='J2').title));assert.ok(!parsed.stdout.includes('Accepted: Closed-loop'));assert.equal(p.data.profile.role,f.data.profile.role);
 }finally{if(candidate)removeOwnedDirectory(PACKAGES,path.join(PACKAGES,candidate));f.clean();}
});
test('unsupported editorial changes, ambiguous mirrors and missing clearance fail closed privately',async()=>{
 for(const change of [f=>f.edit('PROFILE',t=>t+SENTINEL),f=>f.edit('EB',t=>t.replace('Reviewed synthetic honours','Unsupported honours '+SENTINEL)),f=>f.edit('EB',t=>t.replaceAll('| CHECKED |','| CHECKED [VERIFY] |')),f=>f.edit('PUB',t=>t.replace('| S1 | CONTRIB |','| S1 | Published |')),
 f=>f.editRecords(r=>r.push({id:'UNREVIEWED',title:SENTINEL,status:'published'})),f=>f.edit('CONTRIB',()=>'{invalid'),
 f=>f.editRecords(r=>r.find(o=>o.id==='S1').public_evidence_status='VERIFY')]){
 const f=fixture();try{change(f);const result=await prepare(opts(f));assert.equal(result.state,'NEEDS_RECONCILIATION');
 assert.ok(!JSON.stringify(result).includes(SENTINEL));assert.ok(json(path.join(f.stateRoot,'reconciliation.json')).instruction);assert.ok(json(path.join(f.stateRoot,'reconciliation.json')).locator);
 assert.equal(readState(f.stateRoot,f.sourceRoot).published.profile.email,f.data.profile.email);
 }finally{f.clean();}}
});
test('unavailable roots, concurrent changes and failed checks never create a READY package',async()=>{
 const f=fixture();try{assert.equal((await prepare({...opts(f),sourceRoot:path.join(f.base,'missing')})).state,'FAILED');
 let result=await prepare({...opts(f),force:true,afterSnapshot:()=>f.edit('EXPORT',()=>'{"private":"changed"}')});assert.equal(result.code,'CONCURRENT_SOURCE_EDIT');
 result=await prepare({...opts(f),force:true,checks:()=>{throw new Error('VALIDATION_TEST');}});assert.equal(result.state,'NEEDS_RECONCILIATION');
 result=await prepare({...opts(f),force:true,checks:()=>[{id:'HTML_CONTENT_NAVIGATION_HTTP',result:'PASS'},{id:'PUBLIC_PDF',result:'PASS'},{id:'BROWSER_KEYBOARD_ZOOM_MOTION',result:'PASS'}],afterBuild:()=>f.edit('EXPORT',()=>'{"private":"concurrent-after-build"}')});assert.equal(result.code,'CONCURRENT_INPUT_EDIT');
 }finally{f.clean();}
});
test('real review package, PDF propagation, privacy, deterministic outputs, approval invalidation and rollback',async()=>{
 const f=fixture(),created=[];try{
 f.editRecords(r=>r.find(o=>o.id==='S1').status='accepted');f.edit('EB',t=>t.replaceAll(f.data.profile.email,'fixture@example.org'));
 const result=await prepare(opts(f));assert.equal(result.state,'READY_FOR_REVIEW',JSON.stringify(result));created.push(result.candidate);
 const p=packageFor(result.candidate),options={...opts(f),id:result.candidate,target:result.target};
 assert.ok(p.review.changes.some(c=>c.field==='/outputs/S1/status'));assert.ok(p.review.affected_files.includes('assets/Hao_Yu_CV.pdf'));
 const repeat=await prepare(opts(f));assert.equal(repeat.state,'READY_FOR_REVIEW');created.push(repeat.candidate);
 assert.equal(repeat.candidate,result.candidate,'Immutable candidate identity is repeatable');
 assert.deepEqual(packageFor(repeat.candidate).manifest.outputs,p.manifest.outputs);
 for(const file of ['data.json','manifest.json','review.json',...VISITOR_FILES.map(v=>'visitor/'+v)])assert.ok(!fs.readFileSync(path.join(p.dir,file)).includes(Buffer.from(SENTINEL)),file);
 const parsed=spawnSync(process.env.SITE_PYTHON||'python',['-c','import pdfplumber,sys;print(" ".join(p.extract_text() for p in pdfplumber.open(sys.argv[1]).pages))',path.join(p.dir,'visitor/assets/Hao_Yu_CV.pdf')],{encoding:'utf8'});
 assert.equal(parsed.status,0);assert.ok(parsed.stdout.includes('Accepted: Closed-loop'));assert.ok(parsed.stdout.includes('fixture@example.org'));assert.ok(!parsed.stdout.includes(SENTINEL));
 assert.throws(()=>gate(options));assert.throws(()=>promote({...options,authorisePublication:true}));
 const decision={...options,actor:'Synthetic test operator',statement:'Synthetic fixture approval only',decision:'APPROVE'};
 const a=approve(decision);assert.deepEqual(approve(decision),a);assert.ok(gate(options));assert.throws(()=>gate({...options,target:'https://example.org/'}));
 const approvalFile=path.join(f.stateRoot,'approvals',result.candidate+'.json');writeJSON(approvalFile,{...a,decision:'REJECT'});assert.throws(()=>gate(options),/APPROVAL/);writeJSON(approvalFile,a);
 for(const [file,mutate] of [[path.join(f.sourceRoot,f.data.sources.find(s=>s.id==='EXPORT').path),b=>Buffer.concat([b,Buffer.from(' ')])],
 [path.join(ROOT,'templates/index.html'),b=>Buffer.concat([b,Buffer.from('\n')])],[path.join(ROOT,'.htmlvalidate.json'),b=>Buffer.concat([b,Buffer.from('\n')])],
 [path.join(ROOT,'content/site.json'),b=>Buffer.concat([b,Buffer.from('\n')])],[path.join(p.dir,'data.json'),b=>Buffer.concat([b,Buffer.from('\n')])],
 [path.join(p.dir,'visitor/index.html'),b=>Buffer.concat([b,Buffer.from('\n')])],[path.join(p.dir,'visitor/assets/Hao_Yu_CV.pdf'),b=>Buffer.concat([b,Buffer.from('x')])]]){
 const bytes=fs.readFileSync(file);try{fs.writeFileSync(file,mutate(bytes));assert.throws(()=>gate(options),/STALE/);}finally{fs.writeFileSync(file,bytes);}}
 const dest=path.join(f.base,'public-destination');fs.mkdirSync(dest);for(const v of [...VISITOR_FILES,'content/site.json']){fs.mkdirSync(path.dirname(path.join(dest,v)),{recursive:true});fs.copyFileSync(path.join(ROOT,v),path.join(dest,v));}
 assert.throws(()=>promote({...options,destination:dest}));const before=sha(fs.readFileSync(path.join(dest,'index.html')));
 const promotion=promote({...options,destination:dest,authorisePublication:true});assert.equal(sha(fs.readFileSync(path.join(dest,'index.html'))),p.manifest.outputs['index.html']);
 assert.equal(rollback({...opts(f),id:promotion.rollback,destination:dest}).operation,'ROLLBACK_CHECKED');
 assert.throws(()=>rollback({...opts(f),id:promotion.rollback,destination:dest,dryRun:false}));
 rollback({...opts(f),id:promotion.rollback,destination:dest,dryRun:false,authoriseRestoration:true});assert.equal(sha(fs.readFileSync(path.join(dest,'index.html'))),before);
 }finally{for(const id of new Set(created)){const dir=path.join(PACKAGES,id);if(fs.existsSync(dir))removeOwnedDirectory(PACKAGES,dir);}f.clean();}
});
