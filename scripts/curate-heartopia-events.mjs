import fs from 'node:fs';
import path from 'node:path';
import { renderHeartopiaEvents } from './render-heartopia-events.mjs';

const root = path.resolve(import.meta.dirname, '..');
const dataPath = path.join(root, 'data', 'heartopia-events.json');
const sitemapPath = path.join(root, 'sitemap.xml');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const reviewed = [
  {slug:'party-festival-september-2026',localSlug:'party-festival-september-2026',name:'Party Festival',status:'active',type:'Limited festival',startDate:'September 19, 2026',endDate:'October 9, 2026',dateLabel:'Sep 19 - Oct 9, 2026'},
  {slug:'burger-bliss',localSlug:'burger-bliss',name:'Burger Bliss',status:'active',type:'Limited event',startDate:'September 19, 2026',endDate:'October 12, 2026',dateLabel:'Sep 19 - Oct 12, 2026'},
  {slug:'september-23-update-preview',localSlug:'september-23-update-preview',name:'September 23 Update Preview',status:'upcoming',type:'Official update preview',startDate:'September 23, 2026',endDate:'',dateLabel:'September 23, 2026'}
];
const reviewedSlugs = new Set(reviewed.map((event) => event.slug));
data.events = [...reviewed, ...(data.events || []).filter((event) => !reviewedSlugs.has(event.slug))];
data.generatedAt = '2026-09-21';
data.count = data.events.length;
fs.writeFileSync(dataPath, `${JSON.stringify(data, null, 2)}\n`);

const events = data.events.map((event) => ({...event, local:event.localSlug || event.slug, date:event.dateLabel || ''}));
renderHeartopiaEvents(events, data.generatedAt);
let sitemap = fs.readFileSync(sitemapPath, 'utf8');
sitemap = sitemap.replace(/(<loc>https:\/\/heartopia\.life\/events\/<\/loc>\s*<lastmod>)[^<]+(<\/lastmod>)/, `$1${data.generatedAt}$2`);
fs.writeFileSync(sitemapPath, sitemap);
console.log(`Curated and rendered ${events.length} event records; three new items remain hub-only.`);
