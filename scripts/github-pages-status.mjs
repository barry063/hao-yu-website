/** Read GitHub Pages settings and build status using configured Git credentials.
 * Credentials stay in memory and are sent only to GitHub's API; never logged.
 */
import { execFileSync } from 'node:child_process';

const credentialOutput = execFileSync('git', ['credential', 'fill'], {
  input: 'protocol=https\nhost=github.com\n\n', encoding: 'utf8',
  env: { ...process.env, GIT_TERMINAL_PROMPT: '0' }, stdio: ['pipe', 'pipe', 'pipe'],
});
const credential = Object.fromEntries(credentialOutput.trim().split(/\r?\n/).map(line => {
  const i = line.indexOf('='); return [line.slice(0, i), line.slice(i + 1)];
}));
if (!credential.password) throw new Error('No GitHub credential available');
const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'HaoYuWebsiteReleaseCheck',
  Authorization: `Bearer ${credential.password}`, 'X-GitHub-Api-Version': '2022-11-28' };
async function get(resource) {
  const response = await fetch(`https://api.github.com/repos/barry063/hao-yu-website/${resource}`, { headers });
  if (!response.ok) throw new Error(`GitHub API ${resource}: HTTP ${response.status}`);
  return response.json();
}
const settings = await get('pages');
console.log(JSON.stringify({ html_url: settings.html_url, status: settings.status,
  build_type: settings.build_type, source: settings.source }, null, 2));
const runs = await get('actions/runs?per_page=3');
console.log(JSON.stringify(runs.workflow_runs.map(run => ({ id: run.id, name: run.name,
  status: run.status, conclusion: run.conclusion, head_sha: run.head_sha,
  html_url: run.html_url, created_at: run.created_at, updated_at: run.updated_at })), null, 2));
