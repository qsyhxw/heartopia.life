import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const write = (file, value) => fs.writeFileSync(path.join(root, file), value);
const strip = (value) => value.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const escape = (value) => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const key = (value) => value.toLowerCase().replace(/[^a-z0-9]/g, '');
const maxValue = (value) => Math.max(...(value.match(/[\d,]+/g) || ['0']).map((item) => Number(item.replace(/,/g, ''))));

const fishTable = read('database/fish/index.html');
const images = new Map(fs.readdirSync(path.join(root, 'img/fish')).filter((file) => file.endsWith('.webp')).map((file) => [key(path.basename(file, '.webp')), `/img/fish/${file}`]));
const fish = [];
for (const match of fishTable.matchAll(/<tr>\s*([\s\S]*?)\s*<\/tr>/g)) {
  const cells = [...match[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((cell) => strip(cell[1]));
  if (cells.length < 7 || !/^\d+$/.test(cells[2])) continue;
  const item = { name: cells[0], location: cells[1], level: Number(cells[2]), shadow: cells[3], category: cells[4], schedule: cells[5], value: cells[6] };
  item.image = images.get(key(item.name));
  item.maxValue = maxValue(item.value);
  if (!item.image) throw new Error(`Missing image for ${item.name}`);
  fish.push(item);
}
if (!fish.length) throw new Error('No fish entries found in database/fish/index.html');
const fishCount = fish.length;

const ordered = [...fish].sort((a, b) => b.maxValue - a.maxValue || a.name.localeCompare(b.name));
const detailHref = (name) => ({
  'Butterfly Koi': '/database/fish/butterfly-koi/',
  'Smooth Hammerhead': '/database/fish/smooth-hammerhead/',
  'Tilapia': '/database/fish/tilapia/',
  'Seahorse': '/database/fish/seahorse/',
  'Wels Catfish': '/database/fish/wels-catfish/',
  'Bluefin Tuna': '/database/fish/bluefin-tuna/',
  'Swordfish': '/database/fish/swordfish/',
  'Whale Shark': '/database/fish/whale-shark/',
  'Mahi-Mahi': '/database/fish/mahi-mahi/',
  'Green Sea Turtle': '/database/fish/green-sea-turtle/',
  'Giant Oarfish': '/database/fish/giant-oarfish/',
  'Anglerfish': '/database/fish/anglerfish/',
  'King Crab': '/database/fish/king-crab/'
}[name] || '/database/fish/');
const row = (item, className = 'fish-data-row') => {
  const search = `${item.name} ${item.location} ${item.level} ${item.shadow} ${item.category} ${item.schedule} ${item.value}`.toLowerCase();
  return `<tr class="${className}" data-fish-text="${escape(search)}"><td class="px-4 py-3 font-medium min-w-[220px]"><a href="${detailHref(item.name)}" class="inline-flex items-center gap-3 hover:text-cozy-coral"><img src="${item.image}" alt="${escape(item.name)} fish image" class="w-10 h-10 object-contain rounded-lg bg-cozy-sky/10 p-1" loading="lazy"><span>${escape(item.name)}</span></a></td><td class="px-4 py-3 text-cozy-wood">${escape(item.location)}</td><td class="px-4 py-3 text-center">${item.level}</td><td class="px-4 py-3 text-cozy-wood">${escape(item.shadow)}</td><td class="px-4 py-3 text-cozy-wood">${escape(item.category)}</td><td class="px-4 py-3 text-cozy-wood min-w-[210px]">${escape(item.schedule)}</td><td class="px-4 py-3 font-semibold text-cozy-bark">${escape(item.value)}</td></tr>`;
};
const table = (items, title, description, id) => `<section id="${id}" class="scroll-mt-20 bg-white rounded-2xl p-6 border border-cozy-peach/30"><h2 class="font-display text-2xl font-bold mb-2">${title}</h2><p class="text-sm text-cozy-wood mb-4">${description}</p><div class="mb-4"><label class="sr-only" for="${id}-search">Search fish</label><input id="${id}-search" type="search" class="w-full p-3 border border-cozy-peach rounded-lg bg-cozy-cream text-sm" placeholder="Search fish, location, weather, shadow, or category..." oninput="const q=this.value.toLowerCase();document.querySelectorAll('#${id} .fish-data-row').forEach(r=>r.style.display=r.dataset.fishText.includes(q)?'':'none')"></div><div class="overflow-x-auto"><table class="w-full text-sm fish-table"><thead class="bg-cozy-cream/70 text-left"><tr><th class="px-4 py-3">Fish</th><th class="px-4 py-3">Location</th><th class="px-4 py-3 text-center">Lvl</th><th class="px-4 py-3">Shadow</th><th class="px-4 py-3">Category</th><th class="px-4 py-3">Weather / Time</th><th class="px-4 py-3">Market Value</th></tr></thead><tbody class="divide-y divide-cozy-peach/20">${items.map((item) => row(item)).join('')}</tbody></table></div></section>`;
const card = (item) => `<a href="${detailHref(item.name)}" class="bg-white rounded-xl p-4 border border-cozy-peach/30 hover:border-cozy-coral transition-colors flex items-center gap-3"><img src="${item.image}" alt="${escape(item.name)} fish image" class="w-14 h-14 object-contain rounded-lg bg-cozy-sky/10 p-1" loading="lazy"><span><strong class="block">${escape(item.name)}</strong><span class="text-xs text-cozy-wood">${escape(item.location)} · Lv.${item.level} · ${escape(item.schedule)}</span></span></a>`;
const ad = (slot) => `<div id="heartopia_in_content${slot}" class="heartopia-ad-slot max-w-6xl mx-auto px-4 my-6 text-center"></div>`;
const toc = (items) => `<div class="bg-white rounded-xl p-6 mb-8 border border-cozy-peach/30"><h2 class="font-bold text-lg mb-3">Quick Navigation</h2><ul class="grid md:grid-cols-2 gap-2 text-sm">${items.map(([id, label]) => `<li><a href="#${id}" class="text-cozy-coral hover:underline">→ ${label}</a></li>`).join('')}</ul></div>`;
const replace = (file, pattern, content) => {
  const html = read(file);
  if (!pattern.test(html)) throw new Error(`Marker not found in ${file}`);
  write(file, html.replace(pattern, content));
};

for (const file of ['database/fish-prices/index.html', 'guides/fishing-locations/index.html', 'guides/fishing-spots/index.html', 'guides/rare-fish/index.html', 'guides/fish-locations/index.html']) {
  write(file, read(file).replace(/<!-- FISH-DATA:[^>]+-->/g, ''));
}
const priceBlock = `<!-- FISH-DATA:PRICE-TABLE:START -->${table(ordered, 'All ' + fishCount + ' Fish Market Values', 'Every current fish is listed with its local image, location, requirements, and full market-value ladder. The table is ordered by the highest value tier.', 'all-fish-prices')}<!-- FISH-DATA:PRICE-TABLE:END -->`;
replace('database/fish-prices/index.html', /<section id="all-fish-prices"[\s\S]*?<\/section>/, priceBlock);

const locationArticle = `<!-- CONTENT -->\n<article class="space-y-12">\n<!-- FISH-DATA:FISHING-LOCATIONS:START -->${table(fish, 'Search All ' + fishCount + ' Fish by Location', 'This complete location catalogue follows the fish database. Search by fish name, water area, weather, time, shadow, category, or market value.', 'all-fish-table')}<!-- FISH-DATA:FISHING-LOCATIONS:END -->\n${ad('')}\n<section id="route-tips" class="bg-white rounded-2xl p-6 border border-cozy-peach/30"><h2 class="font-display text-2xl font-bold mb-3">Location Route Tips</h2><div class="grid md:grid-cols-2 gap-4 text-sm text-cozy-wood"><p><strong class="text-cozy-bark">Lake targets:</strong> Meadow Lake is useful for Butterfly Koi and Wels Catfish; Suburban Lake has European Mudminnow and Northern Pike.</p><p><strong class="text-cozy-bark">Sea targets:</strong> Swordfish is in Whale Sea, Bluefin Tuna is in Zephyr Sea, and Smooth Hammerhead is in Old Sea.</p></div></section>\n${ad('_2')}\n<section id="more-tools" class="bg-cozy-sky/10 rounded-2xl p-6 border border-cozy-sky/30"><h2 class="font-display text-2xl font-bold mb-3">Track Your Collection</h2><p class="text-cozy-wood">Use the Fish Tracker to save catches in this browser, or open the Fish Database for price sorting and collection progress.</p><div class="mt-4 flex flex-wrap gap-3"><a href="/tools/fish-tracker/" class="text-cozy-coral font-bold hover:underline">Open Fish Tracker</a><a href="/database/fish/" class="text-cozy-coral font-bold hover:underline">Open Fish Database</a></div></section>\n${ad('_3')}\n</article>`;
replace('guides/fishing-locations/index.html', /<!-- CONTENT -->[\s\S]*?<\/article>(?=\s*<!-- Related Guides -->)/, locationArticle);
replace('guides/fishing-locations/index.html', /<!-- TOC -->[\s\S]*?\s*(?=<!-- CONTENT -->)/, `<!-- TOC -->\n${toc([['all-fish-table', 'Search all ' + fishCount + ' fish'], ['route-tips', 'Location route tips'], ['more-tools', 'Fish tracker and database']])}\n`);

const byLocation = new Map();
for (const item of fish) (byLocation.get(item.location) || byLocation.set(item.location, []).get(item.location)).push(item);
const spotCards = [...byLocation.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([location, items]) => {
  const picks = [...items].sort((a, b) => b.maxValue - a.maxValue).slice(0, 3);
  return `<article class="bg-white rounded-xl p-4 border border-cozy-peach/30"><div class="flex items-center gap-3 mb-3"><img src="${picks[0].image}" alt="${escape(picks[0].name)} fish image" class="w-12 h-12 object-contain rounded-lg bg-cozy-sky/10 p-1" loading="lazy"><div><h3 class="font-bold">${escape(location)}</h3><p class="text-xs text-cozy-wood">${items.length} fish in the database</p></div></div><p class="text-sm text-cozy-wood"><strong>Priority catches:</strong> ${picks.map((item) => escape(item.name)).join(', ')}</p></article>`;
}).join('');
const spotArticle = `<article class="space-y-12">\n<!-- FISH-DATA:FISHING-SPOTS:START --><section id="spot-directory" class="scroll-mt-20"><h2 class="font-display text-2xl font-bold mb-3">Fishing Spot Directory</h2><p class="text-cozy-wood mb-5">Choose a named water area first, then use the full location catalogue for exact weather and time requirements.</p><div class="grid md:grid-cols-2 gap-4">${spotCards}</div></section><!-- FISH-DATA:FISHING-SPOTS:END -->\n${ad('')}\n${table(ordered.slice(0, 14), 'High-Value Route Targets', 'These are the current highest-value targets. Their conditions are shown in the table; check the full catalogue when you need every fish in an area.', 'priority-targets')}\n${ad('_2')}\n<section id="full-catalog" class="bg-cozy-sky/10 rounded-2xl p-6 border border-cozy-sky/30"><h2 class="font-display text-2xl font-bold mb-3">Need a Specific Fish?</h2><p class="text-cozy-wood">The location catalogue includes all ${fishCount} fish with a searchable table, while the map page helps you find the water access point.</p><div class="mt-4 flex flex-wrap gap-3"><a href="/guides/fishing-locations/" class="text-cozy-coral font-bold hover:underline">Search all fish locations</a><a href="/guides/map/" class="text-cozy-coral font-bold hover:underline">Open the map</a></div></section>\n${ad('_3')}\n</article>`;
replace('guides/fishing-spots/index.html', /<article class="space-y-12">[\s\S]*?<\/article>(?=\s*<!-- Related Guides -->)/, spotArticle);
replace('guides/fishing-spots/index.html', /<!-- TOC -->[\s\S]*?\s*(?=<!-- ===== MASTER SEARCH TABLE ===== -->)/, `<!-- TOC -->\n${toc([['spot-directory', 'Fishing spot directory'], ['priority-targets', 'High-value route targets'], ['full-catalog', 'Search every fish']])}\n`);

const highValue = ordered.filter((item) => item.maxValue >= 4280).slice(0, 14);
const highNames = new Set(highValue.map((item) => item.name));
const rainbow = ordered.filter((item) => item.schedule.startsWith('Rainbow;') && !highNames.has(item.name)).slice(0, 12);
const special = ordered.filter((item) => (item.category.includes('Mermaid') || item.category === 'Sea Fishing') && !highNames.has(item.name) && !rainbow.some((candidate) => candidate.name === item.name)).slice(0, 12);
const rareArticle = `<!-- CONTENT -->\n<article class="space-y-12">\n<!-- FISH-DATA:RARE-FISH:START -->${table(highValue, 'High-Value Fish', 'These targets have the highest known market-value tiers in the current fish database.', 'high-value')}<!-- FISH-DATA:RARE-FISH:END -->\n${ad('')}\n${table(rainbow, 'Rainbow Weather Targets', 'These fish require Rainbow weather and are not repeated from the high-value section above.', 'rainbow')}\n${ad('_2')}\n${table(special, 'Special Condition Targets', 'Mermaid Fish Attractor and Sea Fishing entries are grouped here without repeating the earlier tables.', 'special-conditions')}\n<section id="how-to-catch" class="bg-white rounded-2xl p-6 border border-cozy-peach/30"><h2 class="font-display text-2xl font-bold mb-3">How To Check a Rare Target</h2><p class="text-cozy-wood">Confirm location, Fishing Level, weather, time, shadow, and category in that order. Sea Fishing entries are separate from normal sea zones: Smooth Hammerhead is an Old Sea fish, while Shortfin Mako Shark is in Sea Fishing.</p></section>\n${ad('_3')}\n</article>`;
replace('guides/rare-fish/index.html', /<!-- CONTENT -->[\s\S]*?<\/article>(?=\s*<!-- Related Guides -->)/, rareArticle);
replace('guides/rare-fish/index.html', /<!-- TOC -->[\s\S]*?\s*(?=<!-- CONTENT -->)/, `<!-- TOC -->\n${toc([['high-value', 'High-value fish'], ['rainbow', 'Rainbow weather targets'], ['special-conditions', 'Special condition targets'], ['how-to-catch', 'How to check a target']])}\n`);

const popular = ['Butterfly Koi', 'Tilapia', 'Seahorse', 'Wels Catfish', 'Smooth Hammerhead', 'Swordfish', 'Bluefin Tuna', 'Golden King Crab'].map((name) => fish.find((item) => item.name === name)).filter(Boolean);
const lookupContent = `<!-- FISH-DATA:FISH-LOCATIONS:START --><section class="mb-12 bg-white rounded-2xl p-6 border border-blue-100 shadow-sm" id="quick-finder"><h2 class="font-display text-2xl font-bold mb-3 text-gray-800">Quick Fish Location Finder</h2><p class="text-gray-700 mb-5">Use these common targets as a starting point. For a full searchable list of all ${fishCount} fish, open the dedicated location catalogue.</p><div class="grid md:grid-cols-2 gap-4">${popular.map(card).join('')}</div><div class="mt-5 flex flex-wrap gap-3"><a href="/guides/fishing-locations/" class="text-blue-600 font-bold hover:underline">Search all ${fishCount} fish</a><a href="/database/fish/" class="text-blue-600 font-bold hover:underline">Browse fish database</a></div></section><!-- FISH-DATA:FISH-LOCATIONS:END -->${ad('')}<section class="mb-12 bg-blue-50 rounded-2xl p-6 border border-blue-100" id="water-types"><h2 class="font-display text-2xl font-bold mb-3 text-gray-800">Choose the Right Water Area</h2><div class="grid md:grid-cols-2 gap-4 text-sm text-gray-700"><p><strong>Lake:</strong> Start with Meadow Lake, Forest Lake, Suburban Lake, or Onsen Mountain Lake.</p><p><strong>River:</strong> Check the named river in the database, then confirm the time and weather.</p><p><strong>Sea:</strong> Whale Sea, Zephyr Sea, Old Sea, and East Sea each have separate catches.</p><p><strong>Event:</strong> Sea Fishing and seasonal fish are shown as event categories in the total database.</p></div></section>${ad('_2')}<section class="mb-12" id="rare-fish-links"><h2 class="font-display text-2xl font-bold mb-4 text-gray-800">Single Fish Pages</h2><p class="text-gray-700 mb-5">Open a detail page when you need an exact location, level, weather, or price explanation.</p><div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">${popular.slice(0, 6).map(card).join('')}</div></section>`;
replace('guides/fish-locations/index.html', /<section class="mb-12 bg-white rounded-2xl p-6 border border-blue-100 shadow-sm" id="quick-finder">[\s\S]*?(?=\s*<section class="mb-12 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm" id="fish-faq">)/, lookupContent);

write('data/heartopia-fish.json', `${JSON.stringify({ generatedAt: new Date().toISOString().slice(0, 10), count: fish.length, fish }, null, 2)}\n`);
console.log(`Synced ${fish.length} fish into data/heartopia-fish.json and fish page sections.`);