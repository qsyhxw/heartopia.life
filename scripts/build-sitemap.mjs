import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sitemapPath = path.join(root, 'sitemap.xml');
const siteOrigin = 'https://heartopia.life';
const today = process.env.SITEMAP_DATE || new Date().toISOString().slice(0, 10);
const dryRun = process.argv.includes('--dry-run');
const excludedRoots = new Set([
  '.git',
  '.github',
  '.claude',
  '.vscode',
  'assets',
  'data',
  'img',
  'outputs',
  'plans',
  'screenshots',
  'scripts'
]);

function git(args) {
  try {
    return execFileSync('git', args, {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore']
    }).trim();
  } catch (error) {
    if (error.status === 128) return '';
    throw error;
  }
}

function pageIsIndexable(file) {
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  const robotsTags = html.match(/<meta\b[^>]*>/gi) || [];
  return !robotsTags.some((tag) => /\bname=["']robots["']/i.test(tag) && /noindex/i.test(tag));
}

function findPages(relative = '') {
  const directory = path.join(root, relative);
  const pages = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!relative && excludedRoots.has(entry.name)) continue;
      pages.push(...findPages(path.join(relative, entry.name)));
      continue;
    }
    if (entry.name !== 'index.html') continue;
    const file = path.join(relative, entry.name).replace(/\\/g, '/');
    if (pageIsIndexable(file)) pages.push(file);
  }
  return pages;
}

function routeFor(file) {
  if (file === 'index.html') return '/';
  return `/${file.slice(0, -'index.html'.length)}`;
}

function gitDates() {
  const output = git([
    '-c',
    'core.quotepath=false',
    'log',
    '--format=@@%cs',
    '--name-only',
    '--',
    'index.html',
    ':(glob)**/index.html'
  ]);
  const dates = new Map();
  let currentDate = '';
  for (const line of output.split(/\r?\n/)) {
    if (line.startsWith('@@')) {
      currentDate = line.slice(2);
      continue;
    }
    const file = line.trim().replace(/\\/g, '/');
    if (file && currentDate && !dates.has(file)) dates.set(file, currentDate);
  }
  return dates;
}

function changedFiles() {
  const files = new Set();
  for (const args of [
    ['diff', '--name-only', 'HEAD', '--'],
    ['ls-files', '--others', '--exclude-standard']
  ]) {
    for (const file of git(args).split(/\r?\n/)) {
      if (file.trim()) files.add(file.trim().replace(/\\/g, '/'));
    }
  }
  return files;
}

function defaultEntry(url, lastmod) {
  const route = new URL(url).pathname;
  const depth = route.split('/').filter(Boolean).length;
  const changefreq = depth <= 2 ? 'weekly' : 'monthly';
  const priority = route === '/' ? '1.0' : depth <= 1 ? '0.8' : '0.7';
  return `    <url>\n        <loc>${url}</loc>\n        <lastmod>${lastmod}</lastmod>\n        <changefreq>${changefreq}</changefreq>\n        <priority>${priority}</priority>\n    </url>`;
}

const history = gitDates();
const changed = changedFiles();
const source = fs.readFileSync(sitemapPath, 'utf8');
const existingLastmod = new Map();
for (const block of source.match(/<url>[\s\S]*?<\/url>/g) || []) {
  const location = block.match(/<loc>(.*?)<\/loc>/)?.[1]?.trim();
  const lastmod = block.match(/<lastmod>(.*?)<\/lastmod>/)?.[1]?.trim();
  if (location && lastmod) existingLastmod.set(location, lastmod);
}
const pages = findPages().sort((a, b) => routeFor(a).localeCompare(routeFor(b)));
const pageByUrl = new Map(pages.map((file) => {
  const url = `${siteOrigin}${routeFor(file)}`;
  const lastmod = changed.has(file) ? today : history.get(file) || existingLastmod.get(url) || today;
  return [url, { file, lastmod }];
}));

const seen = new Set();
const removed = [];
const updated = [];
const duplicate = [];
const urlBlock = /\s*<url>[\s\S]*?<\/url>/g;
let output = source.replace(urlBlock, (block) => {
  const location = block.match(/<loc>(.*?)<\/loc>/)?.[1]?.trim();
  if (!location || !pageByUrl.has(location)) {
    if (location) removed.push(location);
    return '';
  }
  if (seen.has(location)) {
    duplicate.push(location);
    return '';
  }
  seen.add(location);
  const { lastmod } = pageByUrl.get(location);
  const previous = block.match(/<lastmod>(.*?)<\/lastmod>/)?.[1]?.trim();
  if (previous !== lastmod) updated.push({ location, from: previous || null, to: lastmod });
  if (previous) return block.replace(/<lastmod>.*?<\/lastmod>/, `<lastmod>${lastmod}</lastmod>`);
  return block.replace(/(<loc>.*?<\/loc>)/, `$1\n        <lastmod>${lastmod}</lastmod>`);
});

const added = [];
const additions = [];
for (const [url, page] of pageByUrl) {
  if (seen.has(url)) continue;
  added.push(url);
  additions.push(defaultEntry(url, page.lastmod));
}

output = output.replace(/\s*<\/urlset>\s*$/, `${additions.length ? `\n${additions.join('\n')}` : ''}\n</urlset>\n`);
if (!dryRun && output !== source) fs.writeFileSync(sitemapPath, output);

console.log(JSON.stringify({
  pages: pageByUrl.size,
  added,
  removed,
  duplicate,
  lastmodUpdated: updated.length,
  updated: updated.slice(0, 30),
  dryRun
}, null, 2));
