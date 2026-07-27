import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const dataFile = path.join(root, 'data', 'heartopia-call-of-whales-routes.json');
const pageFile = path.join(root, 'events', 'call-of-whales', 'index.html');
const startMarker = '<!-- AUTO_WHALE_ROUTES_START -->';
const endMarker = '<!-- AUTO_WHALE_ROUTES_END -->';

const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
const routes = [...data.routes].sort((a, b) => a.day - b.day);
const maxDay = routes.at(-1)?.day || 0;

if (!routes.length || routes.length > data.total) throw new Error('Whale route count is outside the allowed range.');
if (routes.some((route, index) => route.day !== index + 1)) throw new Error('Whale routes must be contiguous from Day 1.');
if (new Set(routes.map((route) => route.id)).size !== routes.length) throw new Error('Whale route IDs must be unique.');

const esc = (value) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

const colors = {
  'Light Blue': ['#9edff5', '#356f89'],
  Green: ['#8fd49d', '#347450'],
  Orange: ['#f2a35e', '#96501f'],
  Yellow: ['#f5d966', '#826313'],
  Purple: ['#b39ade', '#654b99'],
  'Yellow-Green': ['linear-gradient(110deg,#f5d966 0 58%,#86c97d 58% 100%)', '#527245'],
  Gray: ['#a9afb4', '#616970'],
  Cyan: ['#60cbd0', '#24767a'],
  Pink: ['#efa4bd', '#98445f'],
  'Sky Blue': ['#72bde8', '#356f98'],
  'Blue-Purple': ['linear-gradient(110deg,#558fd0 0 52%,#7760b7 52% 100%)', '#514286'],
  'Deep Blue': ['#315b9a', '#294c80'],
  Silver: ['#c7ced8', '#596574'],
  Gold: ['#e0b84f', '#735817'],
  Brown: ['#9b7257', '#674632'],
  Ivory: ['#eee8d7', '#665f4d'],
  Red: ['#e98276', '#8f3d34'],
  White: ['#f4f1ea', '#665f55'],
  Black: ['#55565a', '#ffffff'],
  'Peach-Green': ['linear-gradient(110deg,#ef7d86 0 52%,#8dce7b 52% 100%)', '#713f48'],
  Iridescent: ['linear-gradient(110deg,#78dfe2,#9fa6ef,#eda4d0)', '#455f7e'],
  Rainbow: ['linear-gradient(110deg,#ef8e8e,#f0d36a,#83c98c,#72bde8,#b79be0)', '#4d4d4d'],
};

function styleFor(color) {
  const [background, text] = colors[color] || ['#d8e8e6', '#365650'];
  const backgroundRule = background.startsWith('linear-gradient') ? `background:${background}` : `background-color:${background}`;
  return { backgroundRule, text };
}

function routeCard(route) {
  const style = styleFor(route.color);
  return `<article id="${esc(route.id)}" class="surface scroll-mt-24 overflow-hidden"><div class="whale-color" style="${style.backgroundRule}" role="img" aria-label="${esc(route.color)} color reference for the Day ${route.day} Splash Whale"><span>Day ${route.day}</span></div><div class="p-5"><h3 class="text-xl font-bold">${esc(route.name)}</h3><p class="mt-1 text-xs font-bold uppercase" style="color:${style.text}">Day ${route.day} whale route</p><dl class="mt-4 space-y-3 text-sm"><div><dt>Whale location</dt><dd>${esc(route.location)}</dd></div><div><dt>Appearance</dt><dd>Day ${route.day} in Naughty's server-time unlock sequence.</dd></div><div><dt>Reward bubble</dt><dd>${esc(route.rewardBubble)}</dd></div></dl><button class="whale-check" type="button" data-whale-check="${esc(route.id.replace(/-splash-whale$/, ''))}" aria-pressed="false">Mark photographed</button></div></article>`;
}

const nav = `<nav class="mt-6 flex gap-2 overflow-x-auto pb-2" aria-label="Jump to a Splash Whale">${routes.map((route) => `<a class="whale-jump" href="#${esc(route.id)}">Day ${route.day} ${esc(route.color)}</a>`).join('')}</nav>`;
const cards = `<div class="mt-4 grid gap-5 md:grid-cols-2 xl:grid-cols-3">${routes.map(routeCard).join('')}</div>`;
const statusDate = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }).format(new Date(`${data.updatedAt}T00:00:00Z`));
const statusCopy = maxDay === data.total
  ? `All ${data.total} daily Splash Whale locations are now listed. The route directory was completed on ${statusDate}.`
  : `This directory covers the ${maxDay} daily locations released through ${statusDate}. Later entries unlock in sequence, so use the in-game hunt list instead of guessing an unreleased color.`;
const status = `<div class="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950"><strong>Collection status:</strong> the event contains ${data.total} Splash Whales. ${statusCopy}</div>`;
const generated = `${startMarker}\n      ${nav}\n      ${cards}\n      ${status}\n      ${endMarker}`;

let html = fs.readFileSync(pageFile, 'utf8');
if (html.includes(startMarker)) {
  html = html.replace(new RegExp(`${startMarker}[\\s\\S]*?${endMarker}`), generated);
} else {
  const legacy = /<nav class="mt-6 flex gap-2 overflow-x-auto pb-2" aria-label="Jump to a Splash Whale">[\s\S]*?(?=      <div class="mt-8 grid gap-4 md:grid-cols-3">)/;
  if (!legacy.test(html)) throw new Error('Could not locate the existing whale route block.');
  html = html.replace(legacy, generated + '\n');
}

html = html
  .replace(/Day 1-\d+/g, `Day 1-${maxDay}`)
  .replace(/of \d+ released whales photographed/, `of ${maxDay} released whales photographed`)
  .replace(/There are 16 Small Fountain Whales in the complete sequence\. [^<]*/, maxDay === data.total
    ? `There are ${data.total} Small Fountain Whales in the complete sequence, and all ${data.total} locations are listed through ${statusDate}.`
    : `There are ${data.total} Small Fountain Whales in the complete sequence. ${maxDay} locations were available through ${statusDate}; later whales unlock on following days.`);

const schemaMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
if (!schemaMatch) throw new Error('Call of Whales JSON-LD block is missing.');
const schema = JSON.parse(schemaMatch[1]);
const graph = schema['@graph'] || [];
const webPage = graph.find((item) => item['@type'] === 'WebPage');
const itemList = graph.find((item) => item['@type'] === 'ItemList');
const faq = graph.find((item) => item['@type'] === 'FAQPage');
if (!webPage || !itemList || !faq) throw new Error('Call of Whales JSON-LD graph is incomplete.');
webPage.name = `Heartopia Whale Locations: Day 1-${maxDay} and Event Guide`;
webPage.dateModified = data.updatedAt;
itemList.name = 'Released Splash Whale locations';
itemList.numberOfItems = routes.length;
itemList.itemListElement = routes.map((route) => ({
  '@type': 'ListItem',
  position: route.day,
  name: route.name,
  url: `https://heartopia.life/events/call-of-whales/#${route.id}`,
}));
const countFaq = faq.mainEntity?.find((item) => item.name === 'How many Splash Whales are there?');
if (countFaq) countFaq.acceptedAnswer.text = maxDay === data.total
  ? `The collection contains ${data.total} Splash Whales, and all ${data.total} daily locations are listed through ${statusDate}.`
  : `The collection contains ${data.total} Splash Whales. ${maxDay} daily locations were available by ${statusDate}, with later entries unlocking in sequence.`;
html = html.replace(schemaMatch[0], `<script type="application/ld+json">${JSON.stringify(schema)}</script>`);

fs.writeFileSync(pageFile, html);
await import('./build-call-of-whales-locales.mjs');
console.log(`Built Call of Whales routes through Day ${maxDay}.`);
