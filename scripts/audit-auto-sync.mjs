import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createHash } from 'node:crypto';

const root = path.resolve(import.meta.dirname, '..');
const assetRoot = path.join(root, 'assets', 'js');
const ignoredDirectories = new Set(['.git', 'node_modules']);
const errors = [];
const notes = [];
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const readJson = (file) => JSON.parse(read(file));

function check(condition, message) {
  if (!condition) errors.push(message);
}

function walk(directory, extension) {
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...walk(target, extension));
    else if (entry.isFile() && entry.name.endsWith(extension)) files.push(target);
  }
  return files;
}

function assetVersion(relativeAsset) {
  const target = path.resolve(assetRoot, relativeAsset);
  if (!target.startsWith(`${assetRoot}${path.sep}`) || !fs.existsSync(target)) return null;
  return createHash('sha256')
    .update(fs.readFileSync(target, 'utf8').replace(/\r\n/g, '\n'))
    .digest('hex')
    .slice(0, 12);
}

const scriptPattern = /<script\b[^>]*\bsrc\s*=\s*["']\/assets\/js\/([A-Za-z0-9._/-]+\.js)(?:\?v=([^"']*))?["']/gi;
let localScriptReferences = 0;
for (const file of walk(root, '.html')) {
  const source = fs.readFileSync(file, 'utf8');
  const pageScripts = new Set();
  for (const match of source.matchAll(scriptPattern)) {
    localScriptReferences += 1;
    const expected = assetVersion(match[1]);
    const page = path.relative(root, file).replace(/\\/g, '/');
    check(!pageScripts.has(match[1]), `${page}: duplicate /assets/js/${match[1]} reference`);
    pageScripts.add(match[1]);
    check(expected, `${page}: missing /assets/js/${match[1]}`);
    check(match[2], `${page}: /assets/js/${match[1]} has no content version`);
    check(!expected || match[2] === expected, `${page}: /assets/js/${match[1]} has stale version ${match[2] || '(none)'}, expected ${expected}`);
  }
}

const mapScriptPattern = /<script\b[^>]*\bsrc\s*=\s*["']\/assets\/js\/map-entity-links\.js(?:\?v=[^"']*)?["']/gi;
for (const directory of ['database/fish', 'database/birds', 'database/wildlife', 'database/materials']) {
  for (const file of walk(path.join(root, directory), '.html').filter((target) => path.basename(target) === 'index.html')) {
    const page = path.relative(root, file).replace(/\\/g, '/');
    const count = [...fs.readFileSync(file, 'utf8').matchAll(mapScriptPattern)].length;
    check(count === 1, `${page}: expected one map entity script, found ${count}`);
  }
}

for (const file of walk(assetRoot, '.js')) {
  const source = fs.readFileSync(file, 'utf8');
  const fetchPattern = /fetch\(\s*(["'])(\/data\/[^"']+\.json)\1\s*(?:,\s*(\{[\s\S]{0,500}?\}))?\s*\)/g;
  for (const match of source.matchAll(fetchPattern)) {
    const script = path.relative(root, file).replace(/\\/g, '/');
    check(/cache\s*:\s*["']no-store["']/.test(match[3] || ''), `${script}: ${match[2]} must be fetched with cache: 'no-store'`);
  }
}

const sourceConfig = {
  fish: ['data/heartopia-fish.json', 'fish'],
  insects: ['data/heartopia-insects.json', 'insects'],
  wildlife: ['data/heartopia-wildlife.json', 'wildlife'],
  crops: ['data/heartopia-crops.json', 'crops'],
  flowers: ['data/heartopia-flowers.json', 'flowers'],
  recipes: ['data/heartopia-recipes.json', 'recipes'],
  achievements: ['data/heartopia-achievements.json', 'achievements'],
  collectibles: ['data/heartopia-collectibles.json', 'collectibles'],
  items: ['data/heartopia-items.json', 'items'],
  ingredients: ['data/heartopia-ingredients.json', 'ingredients'],
  npcs: ['data/heartopia-npcs.json', 'npcs']
};
const totals = {};

for (const [key, [file, property]] of Object.entries(sourceConfig)) {
  const data = readJson(file);
  check(Array.isArray(data[property]), `${file}: ${property} is not an array`);
  totals[key] = Array.isArray(data[property]) ? data[property].length : 0;
  if (Number.isInteger(data.count)) check(data.count === totals[key], `${file}: declared count ${data.count}, actual ${totals[key]}`);
}

const birdHtml = read('database/birds/index.html');
const birdMatch = birdHtml.match(/const birdData=(\[[\s\S]*?\])\s*;const birdLinks/);
check(birdMatch, 'database/birds/index.html: embedded bird data is missing');
totals.birds = birdMatch ? JSON.parse(birdMatch[1]).length : 0;

const mapSource = read('assets/js/map-location-finder.js');
const mapMatch = mapSource.match(/const locations = (\[[\s\S]*?\]);\s*\n\s*const typeLabels/);
check(mapMatch, 'assets/js/map-location-finder.js: location data is missing');
totals.map = mapMatch ? vm.runInNewContext(`(${mapMatch[1]})`).length : 0;

const hub = readJson('data/heartopia-hub-totals.json').totals || {};
for (const [key, total] of Object.entries(totals)) {
  check(hub[key] === total, `Database hub: ${key} is ${hub[key]}, expected ${total}`);
}

const progressSource = read('assets/js/progress-catalog.js');
const progressStart = progressSource.indexOf('window.heartopiaProgressCatalog = ');
const progressEnd = progressSource.lastIndexOf(';');
let progress = {};
try {
  progress = JSON.parse(progressSource.slice(progressStart + 'window.heartopiaProgressCatalog = '.length, progressEnd));
} catch (error) {
  errors.push(`My Progress catalog is invalid JSON: ${error.message}`);
}
for (const [key, total] of Object.entries(totals)) {
  check(progress[key]?.items?.length === total, `My Progress: ${key} has ${progress[key]?.items?.length}, expected ${total}`);
}

const search = readJson('data/heartopia-search-index.json');
check(search.count === search.entries?.length, `Universal Search: declared ${search.count}, actual ${search.entries?.length}`);
for (const key of ['fish', 'insects', 'birds', 'recipes', 'ingredients', 'items', 'npcs', 'wildlife', 'crops', 'flowers']) {
  const count = search.entries.filter((entry) => entry.typeKey === key).length;
  check(count === totals[key], `Universal Search: ${key} has ${count}, expected ${totals[key]}`);
}

const achievements = totals.achievements;
for (const file of ['guides/achievements/index.html', 'guides/badges/index.html', 'guides/hidden-achievements/index.html']) {
  const html = read(file);
  check(!/All 63 achievements|All 63 Achievement|current 63 entries|63 Achievement Titles/.test(html), `${file}: stale hard-coded 63 remains`);
  check(html.includes(String(achievements)), `${file}: current achievement total ${achievements} is not present`);
}

const eventMonitor = readJson('data/monitor/heartodex-events.json');
for (const event of eventMonitor.events || []) {
  if (!['active', 'upcoming'].includes(event.status)) continue;
  check(fs.existsSync(path.join(root, 'events', event.localSlug, 'index.html')), `Events: missing ${event.status} detail page /events/${event.localSlug}/`);
}

const workflowFiles = [
  '.github/workflows/monitor-heartodex-collections.yml',
  '.github/workflows/sync-heartopia-fish-pages.yml',
  '.github/workflows/sync-heartopia-insects.yml',
  '.github/workflows/update-heartopia-codes.yml'
];
for (const file of workflowFiles) {
  check(read(file).includes('group: heartopia-derived-sync'), `${file}: shared concurrency group is missing`);
}
for (const file of ['.github/workflows/sync-heartopia-fish-pages.yml', '.github/workflows/sync-heartopia-insects.yml']) {
  const workflow = read(file);
  check(workflow.includes('ref: ${{ github.ref_name }}'), `${file}: checkout does not follow the latest triggering branch`);
  check(workflow.includes(`- '${file}'`), `${file}: workflow changes do not trigger a validation run`);
}

notes.push(`${localScriptReferences} local script references use current content hashes`);
notes.push(`My Progress and Database totals match ${Object.keys(totals).length} synchronized categories`);
notes.push(`Universal Search matches 10 searchable categories`);
notes.push(`Achievements: ${achievements}`);

if (errors.length) {
  console.error(`Auto-sync audit failed with ${errors.length} issue(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log('Auto-sync cache and consistency audit passed.');
  for (const note of notes) console.log(`- ${note}`);
}
