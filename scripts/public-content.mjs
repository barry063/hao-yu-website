/** Strict, public-only contract. Canonical parsing belongs to P03. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv from 'ajv';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE_PATHS = Object.freeze({ EB:'1 Master Academic CV/Evidence_Bank.md',
  PUB:'4 Publication list/Master_Publication_List.md', CONTRIB:'4 Publication list/Publication_Contributions.json',
  PROFILE:'3 Research Profile/Hao_Yu_Application_Evidence_Wording.md', EXPORT:'1 Master Academic CV/Current_Export_Record.json' });
const schema = JSON.parse(fs.readFileSync(path.join(ROOT, 'schemas/public-content.schema.json')));
const checkSchema = new Ajv({ allErrors: true, strict: true }).compile(schema);
export const STATUS = Object.freeze({ PUBLISHED: 'Published journal articles', ACCEPTED: 'Accepted',
  SUBMITTED: 'Submitted', UNDER_REVIEW: 'Under review', IN_PREPARATION: 'In preparation', RESEARCH_SOFTWARE: 'Research software' });
export const VISITOR_FILES = Object.freeze(['.nojekyll', 'index.html', 'styles.css', 'script.js', 'favicon.svg',
  'robots.txt', 'sitemap.xml', 'assets/Hao_Yu_CV.pdf', 'assets/hao-yu-portrait.jpg', 'assets/og-image.png']);
export const escapeHTML = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
export function safeURL(value, { mail = false } = {}) {
  if (/\s|[<>"'\\]/.test(value)) throw new Error('Unsafe URL');
  const url = new URL(value);
  if (url.username || url.password || !(url.protocol === 'https:' || (mail && url.protocol === 'mailto:')))
    throw new Error('Unsafe URL');
  if (url.protocol === 'https:' && !url.hostname) throw new Error('Unsafe URL');
  return value;
}
function validDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && new Date(value).toISOString().slice(0, 10) === value;
}
export function formatDate(value) {
  const [y, m, d] = value.split('-').map(Number);
  return `${d} ${['January','February','March','April','May','June','July','August','September','October','November','December'][m - 1]} ${y}`;
}
export function entities(data) {
  return [data.profile, ...['qualification_events','links','outputs','experience','qualifications','awards','narratives'].flatMap(k => data[k])];
}
/** Contract-level projection, not a canonical adapter. Explicit fields only. */
export function selectPublicFields(kind, raw) {
  const definition = schema.properties[kind];
  if (!definition?.items?.properties) throw new Error('Unknown export entity');
  const provenance = raw.provenance;
  const mapping = {VERIFIED:'VERIFIED',APPLICANT_CONFIRMED:'APPLICANT_CONFIRMED',SUPPORTED:null,VERIFY:null,REJECT:null};
  if (!provenance || !(provenance.evidence_status in mapping)) throw new Error('Unsupported source evidence state');
  if (!['PUBLIC','HOLD','PRIVATE'].includes(provenance.visibility)) throw new Error('Unsupported visibility');
  if (provenance.visibility !== 'PUBLIC') return null;
  if (!mapping[provenance.evidence_status]) throw new Error('Unresolved record cannot be PUBLIC');
  function project(value, contract) {
    if (contract.$ref) contract = schema.$defs[contract.$ref.split('/').at(-1)];
    if (contract.type === 'array') return value.map(v => project(v,contract.items));
    if (contract.type === 'object') return Object.fromEntries(Object.entries(contract.properties)
      .filter(([key]) => Object.hasOwn(value,key)).map(([key,child]) => [key,project(value[key],child)]));
    return value;
  }
  return project(raw,definition.items);
}
export function validatePublic(data) {
  // Never include values, paths, or rejected text in errors emitted at this boundary.
  if (!checkSchema(data)) throw new Error('Public content schema rejected input');
  const all = entities(data), ids = new Set(all.map(r => r.id));
  if (all.length !== ids.size) throw new Error('Duplicate public ID');
  if (!data.profile.selected || !validDate(data.release_date)) throw new Error('Missing profile or invalid release date');
  if (new Set(data.sources.map(s => s.id)).size !== data.sources.length) throw new Error('Duplicate source ID');
  for (const s of data.sources) {
    if (SOURCE_PATHS[s.id] !== s.path) throw new Error('Source outside public provenance allowlist');
  }
  for (const r of all) {
    if (!validDate(r.provenance.reviewed)) throw new Error('Invalid review date');
    const sourceIds = [...r.provenance.source.matchAll(/\b(EB|PUB|CONTRIB|PROFILE|EXPORT)\b/g)].map(x => x[1]);
    if (!sourceIds.length || sourceIds.some(id => !data.sources.some(s => s.id === id))) throw new Error('Missing source reference');
  }
  for (const experience of data.experience) {
    for (const value of [experience.start_month,experience.end_month]) {
      if (!validDate(value + '-01')) throw new Error('Invalid experience month');
    }
    if (experience.start_month > experience.end_month) throw new Error('Experience interval reversed');
  }
  if (!/^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']+$/.test(data.profile.email)) throw new Error('Invalid public email');
  safeURL(data.presentation.url); safeURL(data.presentation.repository);
  if (!data.presentation.url.endsWith('/')) throw new Error('Site URL must end in slash');
  for (const l of data.links) safeURL(l.url);
  for (const r of data.outputs) for (const l of r.links) safeURL(l.url);
  for (const event of data.qualification_events) {
    if (!validDate(event.date) || !data.qualifications.some(q => q.id === event.qualification_id)) throw new Error('Invalid qualification event');
  }
  if (new Set(data.qualification_events.map(e => `${e.qualification_id}:${e.kind}`)).size !== data.qualification_events.length)
    throw new Error('Ambiguous qualification event');
  for (const o of data.outputs) {
    if ((o.kind === 'SOFTWARE') !== (o.status === 'RESEARCH_SOFTWARE')) throw new Error('Output kind/status conflict');
    if (o.status === 'PUBLISHED' && (!o.year || !o.authors || !o.venue || !o.cv_authors || !o.links.length)) throw new Error('Published citation incomplete');
  }
  for (const r of data.narratives) if (r.output_id && !data.outputs.some(o => o.id === r.output_id && (!r.selected || o.selected)))
    throw new Error('Missing selected output reference');
  for (const r of data.narratives) for (const link of r.links) {
    const output = data.outputs.find(o => o.id === r.output_id);
    if (!output?.links[link.output_link_index]) throw new Error('Missing output link reference');
  }
  // Resolve every authored token, including unselected records, before building anything.
  const walk = x => { if (typeof x === 'string') {
    if (/\[VERIFY\]|TODO/.test(x)) throw new Error('Unresolved public wording');
    resolveText(x, data);
  } else if (Array.isArray(x)) x.forEach(walk);
    else if (x && typeof x === 'object') Object.values(x).forEach(walk); };
  walk(data);
  return data;
}
export function resolveText(text, data) {
  const resolved = text.replace(/\{\{([^{}]+)\}\}/g, (_, key) => {
    if (key.startsWith('profile.')) {
      const field = key.slice(8);
      if (field === 'role_short') return data.profile.role.replace(/ in .*/, '');
      if (typeof data.profile[field] === 'string' && field !== 'id') return data.profile[field];
    }
    const [kind, id, form] = key.split(':');
    if (kind === 'status' && form === 'lower') {
      const o = data.outputs.find(o => o.id === id && o.selected);
      if (o) return o.status === 'PUBLISHED' ? 'published' : STATUS[o.status].toLowerCase();
    }
    if (kind === 'event') {
      const e = data.qualification_events.find(e => e.id === id && e.selected);
      if (e) {
        const label = {THESIS_SUBMITTED:'Thesis submitted',VIVA_COMPLETED:'Viva completed',DEGREE_AWARDED:'Degree awarded'}[e.kind];
        if (form === 'sentence') return `${label} ${formatDate(e.date)}.`;
      }
    }
    if (kind === 'qualification' && form === 'thesis') {
      if (data.qualification_events.some(e => e.selected && e.qualification_id === id && e.kind === 'THESIS_SUBMITTED')) return 'submitted thesis';
    }
    throw new Error('Unsupported or missing authored reference');
  });
  if (/\{\{|\}\}/.test(resolved)) throw new Error('Malformed authored reference');
  return resolved;
}
export function loadPublic(filename = path.join(ROOT, 'content/site.json')) {
  return validatePublic(JSON.parse(fs.readFileSync(filename, 'utf8')));
}
export function normalise(data) {
  validatePublic(data);
  const render = value => resolveText(value, data), p = data.profile, config = data.presentation;
  const record = (r, destination, text = r.text || []) => {
    let links = r.links || [];
    if (r.output_id) {
      const output = data.outputs.find(o => o.id === r.output_id);
      links = output.links.map((link,i) => ({label:r.links.find(l => l.output_link_index === i)?.label || link.label,url:link.url}));
    }
    return { id:r.id, destination, title:render(r.title), dates:r.dates,
      text:text.map(render), links, ...r.provenance };
  };
  const event = data.qualification_events.find(e => e.selected && e.kind === 'THESIS_SUBMITTED');
  const records = data.narratives.filter(r => r.selected).map(r => record(r, r.destination));
  if (event) records.splice(1, 0, {id:'STATUS',destination:'top',title:'Thesis submitted',dates:formatDate(event.date),
    text:[`${p.role} at the ${p.institution}. Thesis submitted on ${formatDate(event.date)}.`],links:[],...event.provenance});
  records.push(...data.outputs.filter(o => o.selected).map(o => record({...o,dates:o.year ? String(o.year) : STATUS[o.status]}, 'publications',
    o.status === 'PUBLISHED' ? [o.authors,o.venue,o.contribution] : [o.contribution])));
  const monthLabel = (month, includeYear=true) => {
    const label = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][Number(month.slice(5)) - 1];
    return label + (includeYear ? ' ' + month.slice(0,4) : '');
  };
  for (const key of ['experience','qualifications','awards']) records.push(...data[key].filter(r => r.selected).map(r => {
    if (key === 'experience') r = {...r,title:r.role + ' · ' + r.organisation,
      dates:monthLabel(r.start_month,r.start_month.slice(0,4)!==r.end_month.slice(0,4)) + ' – ' + monthLabel(r.end_month)};
    const item=record(r,{experience:'experience',qualifications:'education',awards:'awards'}[key]);
    if(key==='qualifications')for(const event of data.qualification_events.filter(e=>e.selected&&e.qualification_id===r.id&&e.kind!=='THESIS_SUBMITTED'))
      item.text.push(`${{VIVA_COMPLETED:'Viva completed',DEGREE_AWARDED:'Degree awarded'}[event.kind]} ${formatDate(event.date)}.`);
    return item;
  }));
  return {reviewed:data.release_date,site:{...p,...config,title:render(config.title),description:render(config.description)},
    profiles:[{id:'EMAIL',label:'Email',url:`mailto:${p.email}`},...data.links.filter(l => l.selected && l.id !== 'GROUP')],
    records, outputs:data.outputs.filter(o => o.selected), events:data.qualification_events.filter(e => e.selected),
    cv_authors:Object.fromEntries(data.outputs.filter(o => o.cv_authors).map(o => [o.id,render(o.cv_authors)])),
    social:{name:p.name,role:p.role,institution:p.institution,topic:config.social.topic,
      status:event ? `Thesis submitted ${formatDate(event.date)}` : '',alt:render(config.social.alt)}};
}
