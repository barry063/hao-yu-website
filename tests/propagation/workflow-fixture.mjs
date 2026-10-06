/** Construct canonical-format fixtures from public facts, never private originals. */
import fs from 'node:fs';import path from 'node:path';import os from 'node:os';
import { loadPublic } from '../../scripts/public-content.mjs';
import { readSources, writeJSON } from '../../scripts/workflow-core.mjs';
import { calibrate } from '../../scripts/prepare-update.mjs';
export const SENTINEL='SYNTHETIC_PRIVATE_SENTINEL_9b46';
export function fixture(){
  const base=fs.mkdtempSync(path.join(os.tmpdir(),'hao-canonical-fixture-')),sourceRoot=path.join(base,'canonical'),stateRoot=path.join(base,'private-state');
  fs.mkdirSync(sourceRoot);const data=loadPublic(),p=data.profile;
  const contact={'Full professional name':p.name,Email:p.email,Location:p.location,Institution:p.institution};
  for(const [label,id] of Object.entries({LinkedIn:'LINKEDIN',GitHub:'GITHUB',ORCID:'ORCID','Google Scholar':'SCHOLAR','Research group':'GROUP'})){
    const url=data.links.find(l=>l.id===id).url;contact[label]=id==='GROUP'?`[${p.group}](${url})`:url;}
  const owner=data.outputs.map(o=>`| ${o.id} | CONTRIB |`).join('\n');
  const texts={EB:'# Fictional adapter workspace\n## 1.1 Contact\n| Field | Current information | Status |\n| --- | --- | --- |\n'+Object.entries(contact).map(([k,v])=>`| ${k} | ${v} | CHECKED |`).join('\n')+`\n| Telephone | ${SENTINEL} | PRIVATE |\n## 2.1 Qualification\n| Field | Entry |\n| --- | --- |\n| Thesis submitted | 30 September 2026; applicant-confirmed |\n## 5.1 Outputs\n| ID | Status owner |\n| --- | --- |\n${owner}\n## 11 Referees\n${SENTINEL}\n`,
    PUB:`# Explicit owner references\n| ID | Status owner |\n| --- | --- |\n${owner}\n`,PROFILE:'# Reviewed wording unchanged\n',EXPORT:JSON.stringify({private:SENTINEL})};
  texts.EB=texts.EB.replace('## 11 Referees','# 10. Awards\nReviewed synthetic honours\n# 11. Referees');
  const records=data.outputs.map(o=>{
    const raw={id:o.id,title:o.title,status:o.status==='RESEARCH_SOFTWARE'?'active_development':o.status.toLowerCase(),private_note:SENTINEL,contribution:['Reviewed safe contribution'],verification_state:'VERIFIED'};
    if(o.status==='PUBLISHED'){
      const m=o.venue.match(/^(.*) (\d+)(?:\((\d+)\)|, (Part \d+))?, ([^.]+)\.$/);
      Object.assign(raw,{author_list_complete:true,authors:o.authors.slice(0,-1).split(/, | and /),year:o.year,journal:m[1],volume:m[2],issue:m[3]||m[4]||null,pages_or_article_number:m[5],doi:o.links[0].url.replace('https://doi.org/','')});
    }else if(o.kind==='SOFTWARE')raw.repository=o.links[0].url;return raw;
  });texts.CONTRIB=JSON.stringify({schema_version:'1.0',records,private_note:SENTINEL});
  for(const s of data.sources){const file=path.join(sourceRoot,s.path);fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,texts[s.id]);}
  data.sources=readSources(sourceRoot,data.sources).fingerprints;const input=path.join(base,'reviewed-public.json');writeJSON(input,data);
  calibrate({sourceRoot,stateRoot,input});
  const edit=(id,fn)=>{const file=path.join(sourceRoot,data.sources.find(s=>s.id===id).path);fs.writeFileSync(file,fn(fs.readFileSync(file,'utf8')));};
  const editRecords=fn=>edit('CONTRIB',text=>{const value=JSON.parse(text);fn(value.records);return JSON.stringify(value);});
  const clean=()=>{if(path.dirname(base)!==path.resolve(os.tmpdir()))throw new Error('FIXTURE_LOCATION');fs.rmSync(base,{recursive:true,force:true});};
  return {base,sourceRoot,stateRoot,data,texts,edit,editRecords,clean};
}
