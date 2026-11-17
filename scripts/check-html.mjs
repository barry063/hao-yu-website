/** Validate all declared HTML pages and the sitemap, including nested locales. */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { HtmlValidate } from 'html-validate';
import { ROOT, loadPublic, visitorFiles } from './public-content.mjs';
const root=path.resolve(process.argv[2]||ROOT),data=loadPublic(process.argv[3]?path.resolve(process.argv[3]):undefined);
const validator=new HtmlValidate(JSON.parse(fs.readFileSync(path.join(ROOT,'.htmlvalidate.json'),'utf8')));
const files=visitorFiles(data).filter(f=>f.endsWith('.html'));
for(const file of files) {
  const report=await validator.validateFile(path.join(root,file));
  if(!report.valid||report.results.some(r=>r.warningCount)) {
    console.error(JSON.stringify(report.results));throw new Error('HTML validation failed');
  }
}
const xml=spawnSync(process.env.SITE_PYTHON||'python',['-c',
  "import sys,xml.etree.ElementTree as E; r=E.parse(sys.argv[1]).getroot(); assert r.tag=='{http://www.sitemaps.org/schemas/sitemap/0.9}urlset'",path.join(root,'sitemap.xml')],{encoding:'utf8'});
if(xml.status!==0)throw new Error('Sitemap XML validation failed');
console.log(`PASS: ${files.length} HTML documents, zero validator errors/warnings; sitemap XML parses.`);
