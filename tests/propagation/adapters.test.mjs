/** Synthetic public facts exercise the documented submitted-tutorial format. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { derivePublic } from '../../scripts/canonical-adapters.mjs';
import { fixture } from './workflow-fixture.mjs';

function tutorialFixture() {
  const f=fixture(),data=structuredClone(f.data),texts=structuredClone(f.texts);
  const output=structuredClone(data.outputs.find(o=>o.id==='S1'));
  Object.assign(output,{id:'S2',status:'SUBMITTED',title:'A synthetic optical metrology tutorial',
    year:null,authors:null,venue:null,cv_authors:null,links:[],
    contribution:'Co-authored tutorial submitted to a journal. Contributed samples and analysis methods.'});
  output.provenance={source:'EB §§3.9,5.2; PUB/CONTRIB S2',evidence_status:'APPLICANT_CONFIRMED',visibility:'PUBLIC',reviewed:'2026-11-12'};
  // Replace any released S2 fixture so these tests survive candidate promotion.
  data.outputs=data.outputs.filter(o=>o.id!=='S2');
  data.outputs.push(output);
  texts.EB=texts.EB.replace(/^\| S2 \| CONTRIB \|\r?\n/gm,'')
    .replace('## 5.1 Outputs','## 3.9 Tutorial project\nReviewed sample contribution.\n## 5.1 Outputs')
    .replace('# 10. Awards',`| S2 | Submitted Tutorial | ${output.title} |\n# 10. Awards`);
  texts.PUB=texts.PUB.replace(/^\| S2 \| CONTRIB \|\r?\n/gm,'');
  texts.PUB+=`\n## Submitted tutorial\n1. ${output.title}. Submitted to a journal.\n`;
  const contributions=JSON.parse(texts.CONTRIB);
  contributions.records=contributions.records.filter(o=>o.id!=='S2');
  contributions.records.push({id:'S2',title:output.title,status:'submitted',
    contribution:['Reviewed sample contribution'],verification_state:'APPLICANT_CONFIRMED'});
  texts.CONTRIB=JSON.stringify(contributions);
  return {...f,data,texts};
}

test('documented Submitted Tutorial label and Submitted tutorial heading preserve submission status',()=>{
  const f=tutorialFixture();
  try {
    const result=derivePublic(f.data,f.texts,f.texts),output=result.outputs.find(o=>o.id==='S2');
    assert.equal(output.status,'SUBMITTED');
    assert.equal(output.contribution,f.data.outputs.find(o=>o.id==='S2').contribution);
    assert.equal(output.year,null);assert.equal(output.venue,null);assert.equal(output.authors,null);
    assert.deepEqual(output.links,[]);
    assert.equal(result.outputs.filter(o=>o.status==='PUBLISHED').length,f.data.outputs.filter(o=>o.status==='PUBLISHED').length);
    for(const id of ['S1','P1'])assert.equal(result.outputs.find(o=>o.id===id).status,f.data.outputs.find(o=>o.id===id).status);
    assert.deepEqual(result,f.data,'Reviewed synthetic policy reproduces exactly');
  } finally {f.clean();}
});

test('submitted tutorial refuses contradictory or qualified evidence-bank labels',()=>{
  const f=tutorialFixture();
  try {
    for(const label of ['Under review','Accepted','Submitted Tutorial [VERIFY]','Submitted Tutorial accepted']) {
      const texts={...f.texts,EB:f.texts.EB.replace('| S2 | Submitted Tutorial |',`| S2 | ${label} |`)};
      assert.throws(()=>derivePublic(f.data,texts,texts),error=>{
        assert.equal(error.message,'SOURCE_STATUS_CONFLICT');
        assert.equal(error.locator.record,'S2');return true;
      },label);
    }
  } finally {f.clean();}
});

test('submitted tutorial rejects conflicting, unsupported and duplicate publication-list headings',()=>{
  const f=tutorialFixture();
  try {
    for(const heading of ['Manuscript under review','Accepted tutorial','Submitted tutorial accepted']) {
      const texts={...f.texts,PUB:f.texts.PUB.replace('## Submitted tutorial',`## ${heading}`)};
      assert.throws(()=>derivePublic(f.data,texts,texts),/SOURCE_STATUS_CONFLICT/,heading);
    }
    const repeated={...f.texts,PUB:f.texts.PUB+'\n## Submitted tutorial\nA synthetic optical metrology tutorial.\n'};
    assert.throws(()=>derivePublic(f.data,repeated,repeated),/MIRROR_AMBIGUOUS/);
  } finally {f.clean();}
});

test('tutorial contribution record cannot promote submitted mirrors to accepted',()=>{
  const f=tutorialFixture();
  try {
    const records=JSON.parse(f.texts.CONTRIB);records.records.find(o=>o.id==='S2').status='accepted';
    const current={...f.texts,CONTRIB:JSON.stringify(records)};
    assert.throws(()=>derivePublic(f.data,current,f.texts),/SOURCE_STATUS_CONFLICT/);
  } finally {f.clean();}
});

test('section 3.9 editorial changes require reconciliation with a safe section locator',()=>{
  const f=tutorialFixture();
  try {
    const current={...f.texts,EB:f.texts.EB.replace('Reviewed sample contribution.','Changed tutorial contribution.')};
    assert.throws(()=>derivePublic(f.data,current,f.texts),error=>{
      assert.equal(error.message,'EDITORIAL_EB_CHANGE');
      assert.deepEqual(error.locator,{source:'EB',sections:['3.9']});
      assert.ok(!JSON.stringify(error).includes('Changed tutorial contribution'));return true;
    });
  } finally {f.clean();}
});

test('tutorial format support does not waive explicit new-record clearance',()=>{
  const f=tutorialFixture();
  try {
    const policy=structuredClone(f.data);policy.outputs=policy.outputs.filter(o=>o.id!=='S2');
    assert.throws(()=>derivePublic(policy,f.texts,f.texts),/NEW_RECORD_CLEARANCE/);
  } finally {f.clean();}
});
