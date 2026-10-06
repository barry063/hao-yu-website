/** Atomic JSON where supported; bounded, checksummed two-slot recovery otherwise. */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const hash = value => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
function slots(file) {
  const records=[];let present=false;
  for(let slot=0;slot<2;slot++) {
    const name=file+'.slot-'+slot;
    if(!fs.existsSync(name))continue;present=true;
    try {
      const record=JSON.parse(fs.readFileSync(name,'utf8'));
      const body={sequence:record.sequence,payload:record.payload};
      if(Number.isSafeInteger(record.sequence)&&record.sequence>0&&record.checksum===hash(body))records.push(record);
    }catch{}
  }
  records.sort((a,b)=>b.sequence-a.sequence);return {present,records};
}
export function readJSON(file) {
  const journal=slots(file);
  if(journal.present) {
    if(!journal.records.length)throw new Error('STATE_JOURNAL_INVALID');
    return journal.records[0].payload;
  }
  return JSON.parse(fs.readFileSync(file,'utf8').replace(/^\uFEFF/,''));
}
export function saveJSON(file,value,{rename=fs.renameSync,journalOnly=false}={}) {
  fs.mkdirSync(path.dirname(file),{recursive:true});
  const bytes=JSON.stringify(value,null,2)+'\n',payload=JSON.parse(bytes),journal=slots(file);
  const temp=file+'.writing-'+crypto.randomUUID();
  if(!journal.present&&!journalOnly) {
    const fd=fs.openSync(temp,'wx');try{fs.writeFileSync(fd,bytes);fs.fsyncSync(fd);}finally{fs.closeSync(fd);}
    try{rename(temp,file);return;}catch(error){
      if(!['EXDEV','EPERM'].includes(error.code)){fs.unlinkSync(temp);throw error;}
    }
  }
  // No subprocesses and no encryption changes. A torn new slot leaves the last
  // committed slot intact. JSON mirrors aid inspection; readers trust slots.
  if(journal.present&&!journal.records.length)throw new Error('STATE_JOURNAL_INVALID');
  const sequence=(journal.records[0]?.sequence||0)+1,body={sequence,payload};
  const fd=fs.openSync(file+'.slot-'+(sequence%2),'w');
  try{fs.writeFileSync(fd,JSON.stringify({...body,checksum:hash(body)})+'\n');fs.fsyncSync(fd);}finally{fs.closeSync(fd);}
  try{if(fs.existsSync(temp))fs.copyFileSync(temp,file);else fs.writeFileSync(file,bytes);}catch{}
  if(fs.existsSync(temp))fs.unlinkSync(temp);
}
