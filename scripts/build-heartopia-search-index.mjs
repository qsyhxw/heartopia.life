import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const write = (file, value) => fs.writeFileSync(path.join(root, file), value);
const readJson = (file) => JSON.parse(read(file));
const exists = (file) => fs.existsSync(path.join(root, file));
const today = () => new Date().toISOString().slice(0, 10);

function normalize(value) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function slugify(value) {
  return normalize(value).replace(/\band\b/g, 'and').replace(/\s+/g, '-');
}

function titleCase(value) {
  return String(value || '').replace(/\b[a-z]/g, (letter) => letter.toUpperCase());
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function joinMeta(parts) {
  return parts
    .filter((part) => part !== undefined && part !== null && String(part).trim() && String(part).trim() !== '0 G')
    .map((part) => String(part).trim())
    .join(' | ');
}

function money(value) {
  return Number.isFinite(value) && value > 0 ? `${value.toLocaleString('en-US')} G` : '';
}

function imagePath(value) {
  if (typeof value !== 'string' || !value.startsWith('/') || !exists(value.slice(1))) return '';
  return value;
}

function findDetailPath(directory, item) {
  const candidates = unique([item.slug, item.sourceSlug, item.id, slugify(item.name)]);
  for (const candidate of candidates) {
    if (candidate && exists(`${directory}/${candidate}/index.html`)) return `/${directory}/${candidate}/`;
  }
  return '';
}

function parseBirds() {
  const html = read('database/birds/index.html');
  const match = html.match(/const birdData=(\[[\s\S]*?\])\s*;const birdLinks=(\{[\s\S]*?\});const esc/);
  if (!match) throw new Error('Could not read bird data from database/birds/index.html');

  const links = {};
  const pair = /'([^']+)'\s*:\s*'([^']+)'/g;
  let current;
  while ((current = pair.exec(match[2]))) links[current[1]] = current[2];

  return { birds: JSON.parse(match[1]), links };
}

const aliasMap = {
  'picasso bug': ['picaso', 'picaso heartopia', 'picasso', 'picasso bug heartopia'],
  'sulkowskys morpho': ['sulkowsky morpho', 'sulkowskyi morpho', 'sulkowsky morpho heartopia'],
  'rajah brookes birdwing': ["rajah brooke's birdwing", 'rajah brookes birdwing'],
  'queen alexandras birdwing': ["queen alexandra's birdwing", 'queen alexandras birdwing'],
  'ka ching': ['ka-ching', 'kachng'],
  'mrs joan': ['mrs. joan', 'mrs-joan'],
  'golden stag beetle': ['golden stag'],
  'green sea turtle': ['sea turtle']
};

const detailOverrides = {
  'insects:picasso bug': '/guides/picasso/'
};

function aliasesFor(name, extra = []) {
  const normalized = normalize(name);
  return unique([
    name,
    String(name || '').replace(/[\u2018\u2019']/g, ''),
    ...(aliasMap[normalized] || []),
    ...extra
  ]);
}

const typeOrder = ['fish', 'insects', 'birds', 'recipes', 'ingredients', 'items', 'npcs', 'wildlife', 'crops', 'flowers'];
const entries = [];

function addEntry({ type, typeKey, name, image, href, listingHref, meta, aliases = [], extraSearch = [] }) {
  const allAliases = aliasesFor(name, aliases);
  const normalized = normalize(name);
  entries.push({
    id: `${typeKey}:${slugify(name)}`,
    name,
    normalized,
    aliases: allAliases,
    type,
    typeKey,
    image: imagePath(image),
    href,
    listingHref,
    meta,
    searchText: normalize([name, type, meta, ...allAliases, ...extraSearch].join(' '))
  });
}

const fish = readJson('data/heartopia-fish.json').fish;
for (const item of fish) {
  const listingHref = `/database/fish/?search=${encodeURIComponent(item.name)}`;
  addEntry({
    type: 'Fish',
    typeKey: 'fish',
    name: item.name,
    image: item.image,
    href: findDetailPath('database/fish', item) || listingHref,
    listingHref,
    meta: joinMeta([item.location, `Lv. ${item.level}`, item.category, money(item.maxValue)]),
    extraSearch: [item.schedule, item.shadow, item.value]
  });
}

const insects = readJson('data/heartopia-insects.json').insects;
for (const item of insects) {
  const listingHref = `/database/insects/?search=${encodeURIComponent(item.name)}`;
  const isFrostspore = item.category === 'Winter frost season';
  const isFrostsporeAliasEntry = normalize(item.name) === 'frostspore sulkowsky s morpho';
  addEntry({
    type: 'Insect',
    typeKey: 'insects',
    name: item.name,
    image: item.image,
    href: isFrostspore ? '/events/frostspore-butterflies/' : (detailOverrides[`insects:${normalize(item.name)}`] || findDetailPath('database/insects', item) || listingHref),
    listingHref,
    meta: joinMeta([item.location, `Lv. ${item.level}`, item.weather]),
    aliases: isFrostsporeAliasEntry ? ['frostspire butterfly', 'frostpore butterfly', 'crystalline butterfly', 'papillon cristallin', 'borboleta cristalina'] : [],
    extraSearch: [item.category, item.schedule, item.slug]
  });
}
const { birds, links: birdLinks } = parseBirds();
for (const item of birds) {
  const name = titleCase(item.name);
  const listingHref = `/database/birds/?search=${encodeURIComponent(name)}`;
  addEntry({
    type: 'Bird',
    typeKey: 'birds',
    name,
    image: `/img/birds/${item.img}`,
    href: birdLinks[item.name] || findDetailPath('database/birds', { ...item, name }) || listingHref,
    listingHref,
    meta: joinMeta([item.location, `Lv. ${item.level}`, item.category]),
    extraSearch: [item.weather, item.time]
  });
}

const recipes = readJson('data/heartopia-recipes.json').recipes;
for (const item of recipes) {
  const listingHref = `/database/recipes/?search=${encodeURIComponent(item.name)}`;
  const bestMarket = Array.isArray(item.market) ? Math.max(...item.market.filter(Number.isFinite)) : 0;
  addEntry({
    type: 'Recipe',
    typeKey: 'recipes',
    name: item.name,
    image: item.image,
    href: findDetailPath('database/recipes', item) || listingHref,
    listingHref,
    meta: joinMeta([item.category, `Lv. ${item.level}`, money(bestMarket)]),
    extraSearch: [item.availability, ...(item.ingredients || [])]
  });
}

const ingredients = readJson('data/heartopia-ingredients.json').ingredients;
for (const item of ingredients) {
  const listingHref = `/database/ingredients/?search=${encodeURIComponent(item.name)}`;
  addEntry({
    type: 'Ingredient',
    typeKey: 'ingredients',
    name: item.name,
    image: item.image,
    href: findDetailPath('database/ingredients', item) || listingHref,
    listingHref,
    meta: joinMeta([item.category, money(item.buyPrice), item.recipeCount ? `${item.recipeCount} recipe${item.recipeCount === 1 ? '' : 's'}` : '']),
    extraSearch: [item.availability]
  });
}

const items = readJson('data/heartopia-items.json').items;
for (const item of items) {
  const listingHref = `/database/items/?search=${encodeURIComponent(item.name)}`;
  addEntry({
    type: 'Item',
    typeKey: 'items',
    name: item.name,
    image: item.image,
    href: findDetailPath('database/items', item) || listingHref,
    listingHref,
    meta: joinMeta([item.category, money(item.price), item.soldBy]),
    extraSearch: []
  });
}

const npcs = readJson('data/heartopia-npcs.json').npcs;
for (const item of npcs) {
  const listingHref = `/npcs/?search=${encodeURIComponent(item.name)}`;
  addEntry({
    type: 'NPC',
    typeKey: 'npcs',
    name: item.name,
    image: item.image,
    href: findDetailPath('npcs', item) || listingHref,
    listingHref,
    meta: joinMeta([item.location, item.role, item.saleCount ? `${item.saleCount} shop item${item.saleCount === 1 ? '' : 's'}` : '']),
    extraSearch: [item.gifts]
  });
}

const wildlife = readJson('data/heartopia-wildlife.json').wildlife;
for (const item of wildlife) {
  const listingHref = `/database/wildlife/?search=${encodeURIComponent(item.name)}`;
  addEntry({
    type: 'Wildlife',
    typeKey: 'wildlife',
    name: item.name,
    image: item.image,
    href: findDetailPath('database/wildlife', item) || listingHref,
    listingHref,
    meta: joinMeta([item.location, item.category, (item.favoriteFood || []).slice(0, 2).join(', ')]),
    extraSearch: [item.weather, ...(item.favoriteFood || []), item.trough, item.interaction, item.status]
  });
}

const crops = readJson('data/heartopia-crops.json').crops;
for (const item of crops) {
  const listingHref = `/database/crops/?search=${encodeURIComponent(item.name)}`;
  addEntry({
    type: 'Crop',
    typeKey: 'crops',
    name: item.name,
    image: item.image,
    href: findDetailPath('database/crops', item) || listingHref,
    listingHref,
    meta: joinMeta([item.type, money(item.seedPrice), item.growthTime]),
    extraSearch: [item.plantingWindow, ...(item.recipes || [])]
  });
}

const flowers = readJson('data/heartopia-flowers.json').flowers;
for (const item of flowers) {
  const listingHref = `/database/flowers/?search=${encodeURIComponent(item.name)}`;
  addEntry({
    type: 'Flower',
    typeKey: 'flowers',
    name: item.name,
    image: item.image,
    href: listingHref,
    listingHref,
    meta: joinMeta([item.color, `${item.stars}-star`, item.role]),
    aliases: [`${item.color} ${item.stars} star flower`, `${item.stars} star ${item.color} flower`],
    extraSearch: [item.breedingSource, ...(item.parentPairs || []), ...(item.conditions || []), item.use, `star tier ${item.stars}`]
  });
}

entries.sort((left, right) => {
  const typeDifference = typeOrder.indexOf(left.typeKey) - typeOrder.indexOf(right.typeKey);
  return typeDifference || left.name.localeCompare(right.name, 'en');
});

const output = 'data/heartopia-search-index.json';
const previous = fs.existsSync(path.join(root, output)) ? readJson(output) : null;
const sameEntries = JSON.stringify(previous?.entries || []) === JSON.stringify(entries);
const generatedAt = sameEntries && previous?.generatedAt ? previous.generatedAt : today();
const localImages = entries.filter((entry) => entry.image).length;
const missingImages = entries.filter((entry) => !entry.image).map((entry) => `${entry.type}: ${entry.name}`);

write(output, `${JSON.stringify({ generatedAt, count: entries.length, typeOrder, entries }, null, 2)}\n`);

const queryHelper = '<script src="/assets/js/database-search-query.js"></script>';
const queryHelperPattern = /<script\s+src=(["'])\/assets\/js\/database-search-query\.js(?:\?[^"']*)?\1\s*><\/script>/gi;
const queryTargets = [
  'database/fish/index.html',
  'database/insects/index.html',
  'database/birds/index.html',
  'database/recipes/index.html',
  'database/ingredients/index.html',
  'database/items/index.html',
  'database/wildlife/index.html',
  'database/crops/index.html',
  'database/flowers/index.html',
  'npcs/index.html'
];

for (const file of queryTargets) {
  const html = read(file);
  let matches = 0;
  let next = html.replace(queryHelperPattern, (match) => {
    matches += 1;
    return matches === 1 ? match : '';
  });
  if (!matches) {
    if (!next.includes('</body>')) throw new Error(`Could not add query helper to ${file}`);
    next = next.replace('</body>', `${queryHelper}</body>`);
  }
  if (next !== html) write(file, next);
}

console.log(`Built universal search index with ${entries.length} entries and ${localImages} local images.`);
if (missingImages.length) console.warn(`Entries without a local image: ${missingImages.join('; ')}`);
