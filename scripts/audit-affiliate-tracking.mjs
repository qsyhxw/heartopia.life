import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const ignored = new Set(['.git', 'node_modules']);
const failures = [];
let pages = 0;
let links = 0;

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isDirectory() && ignored.has(entry.name)) return [];
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) return walk(target);
    return entry.isFile() && entry.name.endsWith('.html') ? [target] : [];
  });
}

for (const file of walk(root)) {
  const html = fs.readFileSync(file, 'utf8');
  const affiliateLinks = html.match(/<a\b[^>]*href=["'][^"']*lootbar\.(?:com|gg)[^"']*["'][^>]*>/gi) || [];
  if (!affiliateLinks.length) continue;

  pages += 1;
  links += affiliateLinks.length;
  const relative = path.relative(root, file).replace(/\\/g, '/');
  if (!html.includes('/assets/js/affiliate-tracking.js')) failures.push(`${relative}: missing shared tracker`);
  if (html.includes("document.querySelectorAll('[data-provider]').forEach(function(a){a.addEventListener('click'")) failures.push(`${relative}: legacy click listener remains`);
  if (/(?:^|\/)guides\/top-up\/index\.html$/.test(relative)) {
    if (!html.includes('data-affiliate-widget="lootbar-heartopia"')) failures.push(`${relative}: widget marker missing`);
    if (html.includes("gtag('event','affiliate_widget_")) failures.push(`${relative}: legacy widget tracking remains`);
  }

  affiliateLinks.forEach((link, index) => {
    if (!/data-affiliate=["']lootbar["']/i.test(link)) failures.push(`${relative}: link ${index + 1} missing data-affiliate`);
    if (!/data-affiliate-placement=["'][^"']+["']/i.test(link)) failures.push(`${relative}: link ${index + 1} missing placement`);
  });
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log(`Affiliate tracking audit passed: ${links} LootBar links across ${pages} pages.`);
