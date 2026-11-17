/** Reviewed language presentation; factual identifiers and statuses remain shared. */
import crypto from 'node:crypto';

export const STATUS_ZH = Object.freeze({PUBLISHED:'已发表期刊论文',ACCEPTED:'已接收',SUBMITTED:'已投稿',UNDER_REVIEW:'审稿中',IN_PREPARATION:'准备中',RESEARCH_SOFTWARE:'科研软件'});
export const UI = Object.freeze({
  en: {
    lang:'en-GB', language:'Language', skip:'Skip to content', brand:'Research & work', menu:'Menu', primary:'Primary',
    nav:['Profile','Research','Outputs','Experience','CV','Contact'],
    profile:'Profile', aboutTitle:'Connecting growth, structure and response.', approach:'Research approach', approachTitle:'Synthesis, measurement, analysis.', capabilities:'Research capabilities',
    research:'Selected research', researchTitle:'From materials growth to optical data.', researchIntro:'Current doctoral work, research software and earlier photonic-device research.',
    outputs:'Research outputs', outputsTitle:'Publications & software', experience:'Experience', experienceTitle:'Research in a wider context.', experienceIntro:'Researcher training, academic service and industry engagement.', engagement:'University engagement',
    education:'Education', educationTitle:'Academic background', contact:'Contact', contactTitle:"Let's compare notes.",
    thesis:'Thesis submitted', explore:'Explore my research', cvLink:'English CV (PDF)', portrait:'{name}, wearing a suit and tie', portraitCaption:'{name} in a suit', posters:'Selected poster presentations', honours:'Selected honours & funding',
    cv:'Curriculum vitae', cvTitle:'A closer look at my work.', cvDescription:'Academic background, research contributions and publications.', cvUpdated:'Public CV updated', download:'Download English CV (PDF)',
    contactText:'I welcome conversations about low-dimensional materials growth, spectroscopy, research software and related experimental collaborations.', email:'Email', location:'Location', profiles:'Profiles', reviewed:'Last content review:', source:'Website source'
  },
  zh: {
    lang:'zh-Hans', language:'语言选择', skip:'跳至正文', brand:'个人学术主页', menu:'菜单', primary:'主导航',
    nav:['个人简介','研究项目','论文与成果','相关经历','简历下载','联系方式'],
    profile:'个人简介', aboutTitle:'材料生长与光学表征', approach:'研究方法', approachTitle:'材料制备、实验表征与数据分析', capabilities:'研究技能',
    research:'研究项目', researchTitle:'材料生长、光谱分析与光子器件', researchIntro:'以下介绍我的博士研究、光谱分析软件及在牛津开展的光子器件研究。',
    outputs:'研究成果', outputsTitle:'论文与科研软件', experience:'相关经历', experienceTitle:'科研培训、学术服务与行业经历', experienceIntro:'这些经历包括科研培训、学术服务、技术评估与行业交流。', engagement:'学术服务',
    education:'教育背景', educationTitle:'教育与学术背景', contact:'联系方式', contactTitle:'欢迎就学术和工作与我交流、指导',
    thesis:'博士论文已提交', explore:'查看研究项目', cvLink:'中文简历（PDF）', portrait:'身着西装、系领带的{name}', portraitCaption:'我的正装照', posters:'学术会议海报', honours:'荣誉与资助',
    cv:'个人简历', cvTitle:'请点击链接下载我的简历了解详细介绍', cvDescription:'简历包含我的教育背景、研究经历、论文成果及相关工作经历。', cvUpdated:'更新日期：', download:'下载中文简历（PDF）',
    contactText:'如果您希望讨论研究问题、探讨合作或工作机会，欢迎通过电子邮件与我联系，也欢迎提出建议。', email:'电子邮箱', location:'所在地', profiles:'相关主页', reviewed:'页面更新：', source:'网站源码'
  }
});
const clean = value => Array.isArray(value) ? value.map(clean) : value && typeof value === 'object'
  ? Object.fromEntries(Object.keys(value).filter(k => k !== 'reviewed').sort().map(k => [k, clean(value[k])])) : value;
const hash = value => crypto.createHash('sha256').update(JSON.stringify(clean(value))).digest('hex');
export function translationRecords(data) {
  return [data.profile,...['links','outputs','experience','qualifications','awards','narratives'].flatMap(k => data[k])].filter(r=>r.selected);
}
export function translationFields(record, data) {
  if(record.id===data.profile.id)return ['name','role','institution','institution_short','discipline','group','location'];
  if(data.links.some(r=>r.id===record.id))return ['label'];
  if(data.outputs.some(r=>r.id===record.id))return ['contribution','link_labels'];
  if(data.experience.some(r=>r.id===record.id))return ['role','organisation','text'];
  if(data.qualifications.some(r=>r.id===record.id))return ['title','dates','text'];
  if(data.awards.some(r=>r.id===record.id))return ['title','dates'];
  return ['title','dates','text','link_labels'];
}
export function translationSourceHash(record, data) {
  const referenced = new Set([...JSON.stringify(record).matchAll(/\{\{(?:status|qualification):([^:}]+)/g)].map(m=>m[1]));
  if(record.output_id)referenced.add(record.output_id);
  return hash({record,profile:data.profile,events:data.qualification_events,
    references:[...data.outputs,...data.qualifications].filter(r=>referenced.has(r.id))});
}
export function presentationSourceHash(data) {
  return hash({profile:data.profile,events:data.qualification_events,title:data.presentation.title,
    description:data.presentation.description,social:data.presentation.social});
}
export function validateLocalisation(data) {
  if(!data.localisation)return;
  const l=data.localisation, expected=translationRecords(data);
  if(l.locale!=='zh-Hans'||l.records.length!==expected.length||new Set(l.records.map(r=>r.id)).size!==l.records.length)
    throw new Error('LOCALISATION_COVERAGE');
  if(l.presentation.source_sha256!==presentationSourceHash(data))throw new Error('LOCALISATION_PRESENTATION_STALE');
  for(const record of expected){
    const translated=l.records.find(r=>r.id===record.id);
    if(!translated)throw new Error('LOCALISATION_MISSING');
    if(translated.source_sha256!==translationSourceHash(record,data))throw new Error('LOCALISATION_STALE');
    const fields=translationFields(record,data);
    if(Object.keys(translated.fields).sort().join('|')!==fields.sort().join('|'))throw new Error('LOCALISATION_FIELDS');
    for(const key of fields){
      const value=translated.fields[key];
      if(['text','link_labels'].includes(key)){
        const original=key==='text'?(record.text||[]):record.links;
        if(value.length!==original.length)throw new Error('LOCALISATION_TEXT_COVERAGE');
      }else if(key!=='dates'&&!value.trim())throw new Error('LOCALISATION_EMPTY');
    }
    // References remain shared; a translation may not silently discard a milestone/status token.
    const tokens=v=>[...JSON.stringify(v).matchAll(/\{\{[^}]+\}\}/g)].map(m=>m[0]).sort();
    const source=Object.fromEntries(fields.filter(k=>k!=='link_labels').map(k=>[k,record[k]]));
    if(tokens(source).join('|')!==tokens(translated.fields).join('|'))throw new Error('LOCALISATION_REFERENCES');
  }
  if(!data.presentation.cv_zh||!data.presentation.cv_document_zh)throw new Error('LOCALISATION_CV_REQUIRED');
}
/** Called only after the original public data has passed schema and review checks. */
export function localise(data, locale='en') {
  if(!['en','zh'].includes(locale))throw new Error('UNSUPPORTED_LOCALE');
  if(locale==='en')return data;
  if(!data.localisation)throw new Error('LOCALISATION_REQUIRED');
  const view=structuredClone(data), byId=new Map(view.localisation.records.map(r=>[r.id,r.fields]));
  for(const record of translationRecords(view)){
    const fields=byId.get(record.id);
    for(const [key,value] of Object.entries(fields)){
      if(key==='link_labels')record.links.forEach((link,i)=>link.label=value[i]);
      else record[key]=value;
    }
  }
  Object.assign(view.presentation,{title:view.localisation.presentation.title,
    description:view.localisation.presentation.description,social:view.localisation.presentation.social,
    cv:view.presentation.cv_zh,cv_document:view.presentation.cv_document_zh});
  return view;
}
