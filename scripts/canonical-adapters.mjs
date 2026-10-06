/** Read-only, documented-format adapters. Raw text/issues never enter public output. */
import { validatePublic, safeURL } from './public-content.mjs';
import { unchanged } from './workflow-core.mjs';

const normal = text => text.replaceAll('\r\n','\n').replace(/[₂₃]/g,c=>c==='₂'?'2':'3').replace(/[–−]/g,'-').replace(/\*|"|“|”/g,'').toLowerCase().replace(/\s+/g,' ').trim();
const statusMap={published:'PUBLISHED',accepted:'ACCEPTED',submitted:'SUBMITTED',under_review:'UNDER_REVIEW',in_preparation:'IN_PREPARATION',active_development:'RESEARCH_SOFTWARE'};
function section(text,id) {
  const lines=text.replaceAll('\r\n','\n').split('\n'),start=lines.findIndex(l=>new RegExp('^#{1,3} '+id.replaceAll('.','\\.')+'(?:\\. | |$)').test(l));
  if(start<0)return '';
  const depth=lines[start].match(/^#+/)[0].length;let end=start+1;
  while(end<lines.length&&!new RegExp('^#{1,'+depth+'} ').test(lines[end]))end++;
  return lines.slice(start,end).join('\n');
}
function rows(text){return text.split('\n').filter(l=>l.startsWith('|')).map(l=>l.split('|').slice(1,-1).map(v=>v.trim()));}
function table(text,id){const result={};for(const row of rows(section(text,id))){if(!row[0]||/^(?:Field|---)/.test(row[0]))continue;
  if(Object.hasOwn(result,row[0]))throw new Error('AMBIGUOUS_TABLE');result[row[0]]={value:row[1],state:row[2]||''};}return result;}
function linkValue(value){const matches=[...value.matchAll(/https:\/\/[^\s)<>]+/g)];if(matches.length!==1)throw new Error('LINK_FORMAT');return matches[0][0];}
const contactFields={'Full professional name':'name','Email':'email','Location':'location','Institution':'institution'};
const linkFields={LinkedIn:'LINKEDIN','GitHub':'GITHUB',ORCID:'ORCID','Google Scholar':'SCHOLAR','Research group':'GROUP'};
const contactMapped=new Set([...Object.keys(contactFields),...Object.keys(linkFields),'Institution short','Telephone','Phone','Postcode']);
const eventFields={'Thesis submitted':'THESIS_SUBMITTED','Viva completed':'VIVA_COMPLETED','Degree awarded':'DEGREE_AWARDED'};
function checked(entry){return entry&&entry.state.startsWith('CHECKED')&&!/VERIFY|SUPPORTED|REJECT|HOLD|PRIVATE/.test(entry.state)&&!/\[VERIFY/.test(entry.value);}
function guardEB(text) {
  const sections=['1.1','1.2','2.1','2.2','3.1','3.2','3.3','3.4','3.5','3.6','4.1','4.2','4.3','5.1','5.2','5.3','10'];
  return Object.fromEntries(sections.map(id=>[id,section(text,id).split('\n').filter(l=>{
    if(l.startsWith('|')){const r=l.split('|').slice(1,-1).map(v=>v.trim());
      if(id==='1.1'&&contactMapped.has(r[0]))return false;
      if(id==='2.1'&&Object.hasOwn(eventFields,r[0]))return false;
    }return true;
  }).join('\n').trim()]));
}
function protectedRecord(r){return Object.fromEntries(['contribution','contribution_boundary','role','verification_state','associated_correction']
  .filter(k=>k in r).map(k=>[k,r[k]]));}
function mirrors(eb,pub,record) {
  const id=record.id,expected=statusMap[record.status],ebRows=rows(eb);
  const relevant=ebRows.filter(row=>row[0]===id);
  if(relevant.length!==1)throw new Error('MIRROR_EB_MISSING');
  const row=relevant[0];
  if(row[1]!=='CONTRIB') {
    const label=normal(row[1]).replaceAll(' ','_');
    const got=label.startsWith('active_development')||id==='SW1'? 'RESEARCH_SOFTWARE':statusMap[label];
    if(got!==expected)throw new Error('SOURCE_STATUS_CONFLICT');
  }
  const declared=rows(pub).find(r=>r[0]===id);
  if(declared) {
    if(declared[1]!=='CONTRIB'&&statusMap[declared[1].toLowerCase().replaceAll(' ','_')]!==expected)throw new Error('SOURCE_STATUS_CONFLICT');
    return;
  }
  const title=normal(record.title);let group=null,found=null;
  for(const line of pub.replaceAll('\r\n','\n').split('\n')) {
    if(line.startsWith('## '))group=/peer reviewed journal/i.test(line)?'PUBLISHED':/under review/i.test(line)?'UNDER_REVIEW':/in preparation/i.test(line)?'IN_PREPARATION':/research software/i.test(line)?'RESEARCH_SOFTWARE':null;
    if(group&&normal(line).includes(title)) {if(found)throw new Error('MIRROR_AMBIGUOUS');found=group;}
  }
  if(found!==expected)throw new Error('SOURCE_STATUS_CONFLICT');
}
function publicTitle(text){return text.replace(/\b(HfSe|WS|MoS)2\b/g,'$1₂');}
function authors(values){if(!Array.isArray(values)||values.length<1||values.some(v=>typeof v!=='string'))throw new Error('CITATION_AUTHORS');
  return values.length===1?values[0]+'.':values.slice(0,-1).join(', ')+' and '+values.at(-1)+'.';}
function venue(r){if(!r.journal||!r.volume||!r.pages_or_article_number)throw new Error('CITATION_METADATA');
  const issue=r.issue ? /^\d+$/.test(r.issue)?`(${r.issue})`:', '+r.issue : '';
  return `${r.journal} ${r.volume}${issue}, ${r.pages_or_article_number.replaceAll('-','–')}.`;}
function sourceRecords(text){let x;try{x=JSON.parse(text);}catch{throw new Error('CONTRIB_FORMAT');}if(x.schema_version!=='1.0'||!Array.isArray(x.records))throw new Error('CONTRIB_FORMAT');
  if(new Set(x.records.map(r=>r.id)).size!==x.records.length)throw new Error('DUPLICATE_SOURCE_ID');return x.records;}
export function derivePublic(policy,current,baseline) {
  const result=structuredClone(policy),old=sourceRecords(baseline.CONTRIB),records=sourceRecords(current.CONTRIB);
  const currentGuard=guardEB(current.EB),baselineGuard=guardEB(baseline.EB);
  if(!unchanged(currentGuard,baselineGuard)){const error=new Error('EDITORIAL_EB_CHANGE');error.locator={source:'EB',sections:Object.keys(currentGuard).filter(id=>currentGuard[id]!==baselineGuard[id])};throw error;}
  if(current.PROFILE.replaceAll('\r\n','\n')!==baseline.PROFILE.replaceAll('\r\n','\n'))throw new Error('EDITORIAL_PROFILE_CHANGE');
  const contact=table(current.EB,'1.1');
  for(const [label,field] of Object.entries(contactFields)) {
    if(!checked(contact[label]))throw new Error('CONTACT_EVIDENCE');
    result.profile[field]=contact[label].value;
    if(/applicant-confirmed/i.test(contact[label].state))result.profile.provenance.evidence_status='APPLICANT_CONFIRMED';
  }
  if(contact['Institution short']){if(!checked(contact['Institution short']))throw new Error('CONTACT_EVIDENCE');result.profile.institution_short=contact['Institution short'].value;}
  else if(result.profile.institution!==policy.profile.institution)throw new Error('INSTITUTION_EDITORIAL');
  for(const [label,id] of Object.entries(linkFields)){
    if(!checked(contact[label]))throw new Error('LINK_EVIDENCE');
    const l=result.links.find(l=>l.id===id);if(!l)throw new Error('LINK_CLEARANCE');
    l.url=safeURL(linkValue(contact[label].value));
    if(/applicant-confirmed/i.test(contact[label].state))l.provenance.evidence_status='APPLICANT_CONFIRMED';
  }
  const group=contact['Research group'].value.match(/^\[([^\]]+)\]/);if(!group)throw new Error('GROUP_FORMAT');result.profile.group=group[1];
  const edu=table(current.EB,'2.1');
  for(const [label,kind] of Object.entries(eventFields))if(!edu[label]&&result.qualification_events.some(e=>e.kind===kind&&e.qualification_id==='EDU-CAM'))throw new Error('QUALIFICATION_EVENT_REMOVAL');
  for(const [label,kind] of Object.entries(eventFields))if(edu[label]){
    const entry=edu[label].value;
    if(!/; (?:applicant-confirmed(?: \d{1,2} \w+ \d{4})?|VERIFIED)(?:;|$)/.test(entry)||/\[VERIFY/.test(entry))throw new Error('QUALIFICATION_EVIDENCE');
    const match=entry.match(/^(\d{1,2}) (January|February|March|April|May|June|July|August|September|October|November|December) (\d{4});/);
    if(!match)throw new Error('QUALIFICATION_FORMAT');
    const date=`${match[3]}-${String(['January','February','March','April','May','June','July','August','September','October','November','December'].indexOf(match[2])+1).padStart(2,'0')}-${match[1].padStart(2,'0')}`;
    const existing=result.qualification_events.find(e=>e.kind===kind&&e.qualification_id==='EDU-CAM');
    if(existing)existing.date=date;else result.qualification_events.push({id:kind.replaceAll('_','-'),kind,date,qualification_id:'EDU-CAM',selected:true,
      provenance:{source:'EB §2.1',evidence_status:/applicant-confirmed/.test(entry)?'APPLICANT_CONFIRMED':'VERIFIED',visibility:'PUBLIC',reviewed:policy.release_date}});
  }
  const known=new Set(policy.outputs.map(o=>o.id));
  for(const record of records)if(!known.has(record.id)&&record.public_visibility!=='PRIVATE'&&record.public_visibility!=='HOLD')throw new Error('NEW_RECORD_CLEARANCE');
  result.outputs=[];
  for(const cleared of policy.outputs) {
    const raw=records.find(r=>r.id===cleared.id),previous=old.find(r=>r.id===cleared.id);
    if(!raw){
      if(rows(current.EB).some(r=>r[0]===cleared.id&&r[1]!=='CONTRIB')||rows(current.PUB).some(r=>r[0]===cleared.id&&r[1]!=='CONTRIB')||normal(current.PUB).includes(normal(previous?.title||cleared.title)))throw new Error('DELETION_SOURCE_CONFLICT');
      continue;
    }
    if(raw.public_visibility&& !['PUBLIC','HOLD','PRIVATE'].includes(raw.public_visibility))throw new Error('PUBLIC_VISIBILITY');
    if(['HOLD','PRIVATE'].includes(raw.public_visibility))continue;
    if(raw.public_evidence_status&&!['VERIFIED','APPLICANT_CONFIRMED'].includes(raw.public_evidence_status))throw new Error('PUBLIC_EVIDENCE');
    if(!previous&&(!/VERIFIED|APPLICANT_CONFIRMED/.test(raw.verification_state||'')||/\[VERIFY/.test(raw.verification_state)))throw new Error('NEW_RECORD_EVIDENCE');
    if(previous&&!unchanged(protectedRecord(raw),protectedRecord(previous)))throw new Error('CONTRIBUTION_EDITORIAL');
    const output=structuredClone(cleared),status=statusMap[raw.status];if(!status)throw new Error('UNSUPPORTED_OUTPUT_STATUS');
    if(raw.public_evidence_status==='APPLICANT_CONFIRMED')output.provenance.evidence_status='APPLICANT_CONFIRMED';
    try{mirrors(current.EB,current.PUB,raw);}catch(error){error.locator={sources:['EB','PUB','CONTRIB'],record:raw.id,field:'status'};throw error;}
    output.status=status;
    if(status==='PUBLISHED') {
      if(raw.author_list_complete!==true||!Number.isInteger(raw.year)||!raw.doi||!output.cv_authors||raw.title_status==='working_title')throw new Error('PUBLIC_CITATION_CLEARANCE');
      output.title=publicTitle(raw.title);output.authors=authors(raw.authors);output.venue=venue(raw);output.year=raw.year;
      output.links[0]={label:'DOI',url:safeURL('https://doi.org/'+raw.doi)};
    } else if(output.kind==='SOFTWARE') {
      output.links[0]={label:'GitHub repository',url:safeURL(raw.repository)};
    } else {output.year=null;output.authors=null;output.venue=null;output.cv_authors=null;output.links=[];}
    result.outputs.push(output);
  }
  // Clearance loss/deletion cascades through dependent project prose; retain no stale claim.
  const available=new Set(result.outputs.filter(o=>o.selected).map(o=>o.id));
  result.narratives=result.narratives.filter(n=>!n.output_id||available.has(n.output_id));
  // All free-form public source changes outside the mapped table values need editorial review.
  if(current.PUB!==baseline.PUB) {
    const strip=text=>text.replaceAll('\r\n','\n').split('\n').filter(l=>!/^\| (?:[A-Z][A-Z0-9-]*|ID|---)/.test(l))
      .map(l=>l.replace(/Submission reference: `[^`]*`\.?/g,'Submission reference: [PRIVATE]').replace(/Recorded version [\d.]+/g,'Recorded version [OMITTED]')).join('\n');
    if(strip(current.PUB)!==strip(baseline.PUB))throw new Error('EDITORIAL_PUBLICATION_LIST');
  }
  validatePublic(result);return result;
}
