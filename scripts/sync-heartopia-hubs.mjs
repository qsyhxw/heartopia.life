import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root = path.resolve(import.meta.dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const write = (file, value) => fs.writeFileSync(path.join(root, file), value);
const readJson = (file) => JSON.parse(read(file));
const today = () => new Date().toISOString().slice(0, 10);

function collectionCount(file, property) {
  const data = readJson(`data/${file}`);
  if (!Array.isArray(data[property])) throw new Error(`Missing ${property} array in ${file}`);
  return data[property].length;
}

function mapLocationCount() {
  const source = read('assets/js/map-location-finder.js');
  const match = source.match(/const locations = (\[[\s\S]*?\]);\s*\n\s*const typeLabels/);
  if (!match) throw new Error('Could not read map locations from map-location-finder.js');
  const locations = vm.runInNewContext(`(${match[1]})`);
  if (!Array.isArray(locations)) throw new Error('Map locations are not an array');
  return locations.length;
}

function replaceOne(html, pattern, replacement, label) {
  if (!pattern.test(html)) throw new Error(`Could not update ${label}`);
  return html.replace(pattern, replacement);
}

function replaceIfPresent(html, pattern, replacement) {
  return pattern.test(html) ? html.replace(pattern, replacement) : html;
}

function humanDate(value) {
  const [year, month, day] = value.split('-').map(Number);
  return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(year, month - 1, day)));
}

const monitored = readJson('data/monitor/heartodex-collections.json');
const totals = {
  fish: collectionCount('heartopia-fish.json', 'fish'),
  insects: collectionCount('heartopia-insects.json', 'insects'),
  birds: monitored.collections?.birds?.registered,
  wildlife: collectionCount('heartopia-wildlife.json', 'wildlife'),
  crops: collectionCount('heartopia-crops.json', 'crops'),
  flowers: collectionCount('heartopia-flowers.json', 'flowers'),
  recipes: collectionCount('heartopia-recipes.json', 'recipes'),
  achievements: collectionCount('heartopia-achievements.json', 'achievements'),
  collectibles: collectionCount('heartopia-collectibles.json', 'collectibles'),
  items: collectionCount('heartopia-items.json', 'items'),
  ingredients: collectionCount('heartopia-ingredients.json', 'ingredients'),
  npcs: collectionCount('heartopia-npcs.json', 'npcs'),
  map: mapLocationCount()
};

if (!Number.isInteger(totals.birds) || totals.birds < 1) throw new Error('Missing monitored bird count');

const dateSources = ['heartopia-fish.json', 'heartopia-insects.json', 'heartopia-wildlife.json', 'heartopia-crops.json', 'heartopia-flowers.json', 'heartopia-recipes.json', 'heartopia-achievements.json']
  .map((file) => readJson(`data/${file}`).generatedAt)
  .filter((value) => /^\d{4}-\d{2}-\d{2}$/.test(value));
const previous = fs.existsSync(path.join(root, 'data/heartopia-hub-totals.json')) ? readJson('data/heartopia-hub-totals.json') : null;
const totalsChanged = JSON.stringify(previous?.totals || {}) !== JSON.stringify(totals);
const updated = dateSources.sort().at(-1) || (totalsChanged ? today() : previous?.updated || today());
write('data/heartopia-hub-totals.json', JSON.stringify({ updated, totals }, null, 2) + '\n');

for (const dashboardFile of ['assets/js/my-progress-dashboard.js', 'assets/js/my-progress-assistant.js']) {
let dashboard = read(dashboardFile);
for (const [id, total] of Object.entries(totals)) {
  dashboard = replaceOne(dashboard, new RegExp(`(id: '${id}'[\\s\\S]*?total: )\\d+`), `$1${total}`, `dashboard ${id} total`);
}
write(dashboardFile, dashboard);
}

let progress = read('tools/my-progress/index.html');
// Older progress templates used static total-copy. The assistant dashboard reads live totals
// from its generated catalog, but keeping these optional replacements preserves old templates.
progress = replaceIfPresent(progress, /Mark all \d+ wildlife entries/, `Mark all ${totals.wildlife} wildlife entries`);
progress = replaceIfPresent(progress, /Track all \d+ crops/, `Track all ${totals.crops} crops`);
progress = replaceIfPresent(progress, /Track all \d+ documented flower forms/, `Track all ${totals.flowers} documented flower forms`);
progress = replaceIfPresent(progress, /Track all \d+ registered collectibles/, `Track all ${totals.collectibles} registered collectibles`);
progress = replaceIfPresent(progress, /Track all \d+ registered utility items/, `Track all ${totals.items} registered utility items`);
progress = replaceIfPresent(progress, /Track all \d+ ingredients/, `Track all ${totals.ingredients} ingredients`);
progress = replaceIfPresent(progress, /Track all \d+ residents/, `Track all ${totals.npcs} residents`);
write('tools/my-progress/index.html', progress);

let hub = read('database/index.html');
hub = replaceOne(hub, /Updated [A-Z][a-z]+ \d{1,2}, \d{4}/, `Updated ${humanDate(updated)}`, 'database update date');
hub = replaceOne(hub, /\d+ prices, recipe-use counts/, `${totals.ingredients} prices, recipe-use counts`, 'ingredient quick jump');
hub = replaceOne(hub, /\d+ entries, filters, progress/, `${totals.collectibles} entries, filters, progress`, 'collectible quick jump');
hub = replaceOne(hub, /\d+ tools, sellers, prices/, `${totals.items} tools, sellers, prices`, 'item quick jump');
hub = replaceOne(hub, /\d+ documented forms, filters, progress/, `${totals.flowers} documented forms, filters, progress`, 'flower quick jump');
hub = replaceOne(hub, />\d+ tracked<\/span>([\s\S]{0,500}?Fish Database)/, `>${totals.fish} tracked</span>$1`, 'fish hub total');
hub = replaceOne(hub, />\d+ tracked<\/span>([\s\S]{0,500}?Insect Database)/, `>${totals.insects} tracked</span>$1`, 'insect hub total');
hub = replaceOne(hub, />\d+ tracked<\/span>([\s\S]{0,500}?Birds Database)/, `>${totals.birds} tracked</span>$1`, 'bird hub total');
hub = replaceOne(hub, />\d+ recipes<\/span>/, `>${totals.recipes} recipes</span>`, 'recipe hub total');
hub = replaceOne(hub, />\d+ tracked<\/span>([\s\S]{0,500}?Ingredients Database)/, `>${totals.ingredients} tracked</span>$1`, 'ingredient hub total');
hub = replaceOne(hub, />\d+ tracked<\/span>([\s\S]{0,500}?Items Database)/, `>${totals.items} tracked</span>$1`, 'item hub total');
hub = replaceOne(hub, />\d+ tracked<\/span>([\s\S]{0,500}?Collectibles Database)/, `>${totals.collectibles} tracked</span>$1`, 'collectible hub total');
hub = replaceOne(hub, />\d+ tracked<\/span>([\s\S]{0,500}?Flowers Database)/, `>${totals.flowers} tracked</span>$1`, 'flower hub total');
hub = replaceOne(hub, /(<span class="text-xs bg-cozy-sage text-white px-2 py-1 rounded-full">)(?:Farming|\d+ tracked)(<\/span>)/, `$1${totals.crops} tracked$2`, 'crop hub total');
hub = replaceOne(hub, /(<span class="text-xs bg-purple-500 text-white px-2 py-1 rounded-full">)(?:NPCs|\d+ tracked)(<\/span>)/, `$1${totals.npcs} tracked$2`, 'NPC hub total');
write('database/index.html', hub);

console.log(`Refreshed hub totals: ${Object.entries(totals).map(([name, count]) => `${name}=${count}`).join(', ')}.`);
