import fs from 'node:fs';
import {inventory} from './integration-signature.mjs';

const pages = JSON.parse(fs.readFileSync('data/petit-planet/pages.json'));
const reference = inventory(fs.readFileSync('loftia/index.html', 'utf8'));
for (const page of pages) {
  const route = page.slug ? `/petit-planet/${page.slug}/` : '/petit-planet/';
  const file = `${route.slice(1)}index.html`;
  const html = fs.readFileSync(file, 'utf8');
  if ((html.match(/<h1>/g) || []).length !== 1 || /noindex|LOCAL EDITORIAL|Production notes/.test(html)) throw new Error(`Invalid published content ${file}`);
  if (!html.includes(`rel="canonical" href="https://heartopia.life${route}"`)) throw new Error(`Canonical ${file}`);
  if (JSON.stringify(inventory(html)) !== JSON.stringify(reference)) throw new Error(`Inherited integrations ${file}`);
  const faq = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
  if (faq.mainEntity.length !== page.faqs.length || !page.faqs.every(([q,a]) => html.includes(q) && html.includes(a))) throw new Error(`FAQ content ${file}`);
  for (const [, href] of html.matchAll(/href="(\/[^"#]*)(#[^"]*)?"/g)) {
    const target = href === '/' ? 'index.html' : href.endsWith('/') ? href.slice(1) + 'index.html' : href.slice(1);
    if (!fs.existsSync(target)) throw new Error(`Missing ${target}`);
  }
  for (const [, src] of html.matchAll(/<img[^>]+src="([^"]+)"/g)) if (!fs.existsSync(src.slice(1))) throw new Error(`Missing image ${src}`);
  const nav = html.match(/<nav aria-label="Petit Planet">(.*?)<\/nav>/s)[1];
  for (const [, href, fragment] of html.matchAll(/href="(\/petit-planet\/[^"#]*)(#[^"]+)"/g)) {
    const target = fs.readFileSync(`${href.slice(1)}index.html`, 'utf8');
    if (!target.includes(`id="${fragment.slice(1)}"`)) throw Error(`Missing destination ${href}${fragment}`);
  }
  for (const [, fragment] of html.matchAll(/href="#([^"]+)"/g)) if (!html.includes(`id="${fragment}"`)) throw Error(`Missing anchor ${fragment}`);
  if ([...nav.matchAll(/href="([^"]+)"/g)].some(([,href]) => !href.startsWith('/petit-planet/'))) throw new Error('Wrong game navigation');
  console.log(`${route} PASS title=${page.metaTitle.length} description=${page.description.length}`);
}
const home = fs.readFileSync('index.html','utf8');
const card = home.match(/<!-- PETIT PLANET CARD -->(.*?)<!-- END PETIT PLANET CARD -->/s)?.[1];
if (!card || [...card.matchAll(/href="([^"]+)"/g)].some(([,href]) => href !== '/petit-planet/')) throw new Error('Recommendation link');
