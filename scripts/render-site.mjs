import fs from 'node:fs';
import path from 'node:path';
import { ROOT, escapeHTML as e, formatDate, normalise, STATUS } from './public-content.mjs';
import { UI, STATUS_ZH } from './localisation.mjs';

export function renderSite(data, locale='en') {
  const n = normalise(data,locale), s = n.site, records = n.records, ui=UI[locale];
  const prefix=locale==='zh'?'../':'', asset=file=>prefix+file, statuses=locale==='zh'?STATUS_ZH:STATUS;
  const r = id => { const item = records.find(r => r.id === id); if (!item) throw new Error('Missing required record'); return item; };
  const section = dest => records.filter(r => r.destination === dest);
  const paragraphs = text => text.map(t => `<p>${e(t)}</p>`).join('\n');
  const arrow = '<span aria-hidden="true">↗</span>';
  const links = values => values.length ? `<p class="card-links">${values.map(l => `<a href="${e(l.url)}">${e(l.label)} ${arrow}</a>`).join('\n')}</p>` : '';
  const time = date => `<time datetime="${e(date)}">${e(formatDate(date,locale))}</time>`;
  const profileLinks = n.profiles;
  const group = data.links.find(l => l.id === 'GROUP' && l.selected);
  if (!group) throw new Error('Missing group link');
  const contactLinks = profileLinks.filter(l => ['LINKEDIN','SCHOLAR','ORCID'].includes(l.id));
  const event = n.events.find(e => e.kind === 'THESIS_SUBMITTED');
  const person = { '@type':'Person', '@id':s.base_url+'#person', name:s.name, url:s.base_url,
    email:`mailto:${s.email}`, jobTitle:s.role, affiliation:{'@type':'Organization',name:s.institution},
    sameAs:profileLinks.filter(l => l.id !== 'EMAIL').map(l => l.url) };
  const ld = { '@context':'https://schema.org', '@type':'ProfilePage', '@id':s.url+'#profile-page',
    url:s.url, name:s.title, inLanguage:ui.lang, mainEntity:person };
  const metadata = [['property','og:type','website'],['property','og:site_name',s.name],['property','og:title',s.title],
    ['property','og:description',s.description],['property','og:url',s.url],['property','og:image',s.base_url+s.image],
    ['property','og:locale',locale==='zh'?'zh_CN':'en_GB'],
    ['property','og:image:width','1200'],['property','og:image:height','630'],['property','og:image:alt',n.social.alt],
    ['name','twitter:card','summary_large_image'],['name','twitter:title',s.title],['name','twitter:description',s.description],
    ['name','twitter:image',s.base_url+s.image]];
  const head = `<title>${e(s.title)}</title>
<meta name="description" content="${e(s.description)}">
<link rel="canonical" href="${e(s.url)}">
${data.localisation?`<link rel="alternate" hreflang="en" href="${e(s.base_url)}">\n<link rel="alternate" hreflang="zh-Hans" href="${e(s.base_url)}zh/">\n<link rel="alternate" hreflang="x-default" href="${e(s.base_url)}">`:''}
<meta name="theme-color" content="#fafaf8">
${metadata.map(([kind,key,val]) => `<meta ${kind}="${key}" content="${e(val)}">`).join('\n')}
<link rel="icon" href="${asset('favicon.svg')}" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&amp;family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;1,8..60,400&amp;display=swap" rel="stylesheet">
<link rel="stylesheet" href="${asset('styles.css')}">
<script src="${asset('script.js')}" defer></script>
<script type="application/ld+json">${JSON.stringify(ld,null,2).replaceAll('<','\\u003c').replaceAll('>','\\u003e').replaceAll('&','\\u0026')}</script>`;
  const hero = `<p class="eyebrow">${e(s.institution)} · ${e(s.discipline)}</p>
<h1 id="hero-heading">${e(s.name)}</h1>
<p class="hero-role">${e(s.role)}</p>
<h2 class="hero-statement" data-record="PROFILE">${e(r('PROFILE').title)}</h2>
<p class="hero-summary">${e(r('PROFILE').text[0])}</p>
${event ? `<p class="status-line" data-record="STATUS"><span class="status-dot" aria-hidden="true"></span>${e(ui.thesis)} ${time(event.date)}</p>` : ''}
<p class="hero-actions"><a class="btn" href="#projects">${e(ui.explore)} <span aria-hidden="true">↓</span></a><a class="text-link" href="${e(asset(s.cv))}">${e(ui.cvLink)} ${arrow}</a></p>
<ul class="profile-links">${profileLinks.map(l => `<li><a href="${e(l.url)}">${e(l.label)}</a></li>`).join('\n')}</ul>`;
  const projects = `<div class="project-grid">${section('projects').map(r => `<article class="project-card" data-record="${r.id}">
<p class="eyebrow">${e(r.dates)}</p>
<h3>${e(r.title)}</h3>
<p class="project-question">${e(r.text[0])}</p>
${paragraphs(r.text.slice(1))}
${links(r.links)}
</article>`).join('\n')}</div>`;
  const authors = value => e(value).replaceAll(e(s.bibliographic_name), `<strong>${e(s.bibliographic_name)}</strong>`);
  const published = n.outputs.filter(o => o.status === 'PUBLISHED');
  const other = Object.keys(STATUS).filter(k => k !== 'PUBLISHED').map(status => ({ status, outputs:n.outputs.filter(o => o.status === status) })).filter(g => g.outputs.length);
  const outputs = `${published.length ? `<h3 class="output-heading">${statuses.PUBLISHED} <span>${published.length}</span></h3>
<div class="pub-list">${published.map(o => { const rec = r(o.id); return `<article class="publication" data-record="${o.id}">
<div class="publication-year">${o.year}</div>
<div><h4>${e(rec.title)}</h4>
<p class="authors">${authors(rec.text[0])}</p>
<p class="venue">${e(rec.text[1])}</p>
<p class="contribution">${e(rec.text[2])}</p>
${links(rec.links)}</div></article>`; }).join('\n')}</div>` : ''}
<div class="output-grid">${other.map(g => `<div><h3 class="output-heading">${statuses[g.status]}</h3>${g.outputs.map(o => { const rec = r(o.id); return `<article class="output-note" data-record="${o.id}"><h4>${e(rec.title)}</h4>${paragraphs(rec.text)}${links(rec.links)}</article>`; }).join('\n')}</div>`).join('\n')}</div>`;
  const timeline = dest => `<div class="timeline">${section(dest).map(r => `<article class="timeline-item" data-record="${r.id}"><p class="timeline-date">${e(r.dates)}</p><div><h3>${e(r.title)}</h3>${paragraphs(r.text)}</div></article>`).join('\n')}</div>`;
  const groupLabel=locale==='zh'?data.localisation.records.find(r=>r.id===group.id).fields.label:group.label;
  const selector=data.localisation?`<nav class="language-switch" aria-label="${e(ui.language)}"><a href="${locale==='zh'?'../':'./'}" lang="en" hreflang="en" data-language-link${locale==='en'?' aria-current="page"':''}>English</a><span aria-hidden="true">|</span><a href="${locale==='zh'?'./':'zh/'}" lang="zh-Hans" hreflang="zh-Hans" data-language-link${locale==='zh'?' aria-current="page"':''}>中文</a></nav>`:'';
  const slots = {HEAD:head,NAME:e(s.name),HERO:hero,LANG:ui.lang,LANGUAGE:selector,
    PORTRAIT:`<figure class="headshot"><img src="${e(asset(s.portrait))}" width="480" height="658" alt="${e(ui.portrait.replace('{name}',s.name))}" fetchpriority="high"><figcaption>${e(ui.portraitCaption.replace('{name}',s.name))}</figcaption></figure>`,
    ABOUT:`<div class="prose" data-record="ABOUT">${paragraphs(r('ABOUT').text)}<p><a href="${e(group.url)}">${e(groupLabel)} ${arrow}</a></p></div>`,
    THEMES:`<div class="theme-grid">${section('research').map(r => `<article class="theme-card" data-record="${r.id}"><h3>${e(r.title)}</h3>${paragraphs(r.text)}</article>`).join('\n')}</div>`,
    PROJECTS:projects,OUTPUTS:outputs + (section('presentations').length ? `<h3 class="output-heading">${e(ui.posters)}</h3>${timeline('presentations')}` : ''),EXPERIENCE:timeline('experience'),
    EDUCATION:`<div>${timeline('education')}<div id="awards" class="honours"><h3>${e(ui.honours)}</h3><ul class="list-plain">${section('awards').map(r => `<li data-record="${r.id}"><strong>${e(r.title)}</strong><span>${e(r.dates)}</span></li>`).join('\n')}</ul></div></div>`,
    CV:`<div class="cv-panel"><div><p class="eyebrow">${e(ui.cv)}</p><h2 id="cv-heading">${e(ui.cvTitle)}</h2><p>${e(ui.cvDescription)}<br>${e(ui.cvUpdated)} ${time(s.cv_document?.date || data.release_date)}${locale==='zh'?'。':'.'}</p></div>
<a class="btn" href="${e(asset(s.cv))}" download="${locale==='zh'?'Hao_Yu_CV_CN.pdf':'Hao_Yu_CV.pdf'}">${e(ui.download)} <span aria-hidden="true">↓</span></a></div>`,
    CONTACT:`<div class="contact-block"><p>${e(ui.contactText)}</p><dl class="contact-dl"><div><dt>${e(ui.email)}</dt><dd><a href="mailto:${e(s.email)}">${e(s.email)}</a></dd></div><div><dt>${e(ui.location)}</dt><dd>${e(s.location)}</dd></div><div><dt>${e(ui.profiles)}</dt><dd>${contactLinks.map(l => `<a href="${e(l.url)}">${e(l.label)}</a>`).join(' · ')}</dd></div></dl></div>`,
    FOOTER:`<footer class="site-footer"><p>© <span id="year">${data.release_date.slice(0,4)}</span> ${e(s.name)}</p><p>${e(ui.reviewed)} ${time(data.release_date)} · <a href="${e(s.repository)}">${e(ui.source)}</a></p></footer>`};
  for(const [key,value] of Object.entries(ui))if(typeof value==='string')slots['UI_'+key.toUpperCase()]=e(value);
  slots.NAV=['about','projects','publications','experience','cv','contact'].map((id,i)=>`<a href="#${id}">${e(ui.nav[i])}</a>`).join('');
  return fs.readFileSync(path.join(ROOT,'templates/index.html'),'utf8').replace(/\{\{([A-Z_]+)\}\}/g, (_, key) => {
    if (!(key in slots)) throw new Error('Unknown template slot'); return slots[key];
  });
}
