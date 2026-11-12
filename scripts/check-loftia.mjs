import fs from 'node:fs';
import {groups} from './loftia-home.mjs';
const pages = JSON.parse(fs.readFileSync('data/loftia/pages.json'));
const grouped = groups.flatMap(group => group.cards.map(card => card[0]));
if (new Set(grouped).size !== grouped.length || pages.some(page => !grouped.includes(page.slug)) || grouped.some(slug => !pages.some(page => page.slug === slug))) throw Error('Home task groups must cover each published guide exactly once');
if (groups.some(group => group.cards.some(card => !card[1]?.trim() || !card[2]?.trim()))) throw Error('Missing home task title or summary');
const paths = ['loftia/index.html', ...pages.map(page => `loftia/${page.slug}/index.html`)];
for (const file of paths) {
  const html = fs.readFileSync(file, 'utf8');
  if (/heartopia\.life/i.test(html.match(/<header[\s\S]*?<\/header>/)[0])) throw Error(`Unexpected host branding in section header: ${file}`);
  if (html.match(/<header[\s\S]*?<a[^>]+href="([^"]+)"/)[1] !== "/loftia/") throw Error(`Wrong section home: ${file}`);
  if ((html.match(/<h1>/g) || []).length !== 1) throw new Error(`H1: ${file}`);
  if (!html.includes('ads-2368.js') || (html.match(/createAd\('heartopia_/g) || []).length !== 6) throw new Error(`Nitro: ${file}`);
  for (const [, href] of html.matchAll(/href=["'](\/[^"'#]*)(?:#[^"']*)?["']/g)) {
    const target = href === '/' ? 'index.html' : href.endsWith('/') ? href.slice(1) + 'index.html' : href.slice(1);
    if (!fs.existsSync(target)) throw new Error(`Broken link ${href} in ${file}`);
  }
  for (const [, src] of html.matchAll(/<img[^>]+src=["']([^"']+)/g)) {
    if (!fs.existsSync(src.slice(1))) throw new Error(`Missing media ${src}`);
  }
  const nav = html.match(/<nav[\s\S]*?<\/nav>/)[0];
  if ([...nav.matchAll(/href="([^"]+)"/g)].some(match => !match[1].startsWith('/loftia/'))) throw new Error(`Wrong game navigation: ${file}`);
}
const home = fs.readFileSync('index.html', 'utf8').match(/<!-- LOFTIA RECOMMENDATION -->([\s\S]*?)<!-- END LOFTIA RECOMMENDATION -->/)?.[1]?.replace(/<!-- PETIT PLANET CARD -->[\s\S]*?<!-- END PETIT PLANET CARD -->/, '').replace(/<!-- DREADMOOR CARD -->[\s\S]*?<!-- END DREADMOOR CARD -->/, '');
if (!home || [...home.matchAll(/href="([^"]+)"/g)].some(match => !match[1].startsWith('/loftia/'))) throw new Error('Invalid recommendation');
console.log(`Loftia structural checks PASS: ${paths.length} pages`);
