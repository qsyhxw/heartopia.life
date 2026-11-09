import fs from 'node:fs';
const pages = JSON.parse(fs.readFileSync('data/loftia/pages.json'));
const paths = ['loftia/index.html', ...pages.map(page => `loftia/${page.slug}/index.html`)];
for (const file of paths) {
  const html = fs.readFileSync(file, 'utf8');
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
const home = fs.readFileSync('index.html', 'utf8').match(/<!-- LOFTIA RECOMMENDATION -->([\s\S]*?)<!-- END LOFTIA RECOMMENDATION -->/)?.[1]?.replace(/<!-- PETIT PLANET CARD -->[\s\S]*?<!-- END PETIT PLANET CARD -->/, '');
if (!home || [...home.matchAll(/href="([^"]+)"/g)].some(match => !match[1].startsWith('/loftia/'))) throw new Error('Invalid recommendation');
console.log(`Loftia structural checks PASS: ${paths.length} pages`);
