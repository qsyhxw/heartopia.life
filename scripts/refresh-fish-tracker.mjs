import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const data = JSON.parse(read('data/heartopia-fish.json'));
const trackerPath = path.join(root, 'tools', 'fish-tracker', 'index.html');
let html = fs.readFileSync(trackerPath, 'utf8');

const oldMatch = html.match(/const fishData = (\[[\s\S]*?\]);\s*let caughtFish/);
const currentMatch = html.match(/window\.heartopiaFishData = (\[[\s\S]*?\]);/);
const existing = JSON.parse(oldMatch?.[1] || currentMatch?.[1] || '[]');
const byName = new Map(existing.map((fish) => [fish.name, fish]));
let nextId = Math.max(0, ...existing.map((fish) => Number(fish.id) || 0)) + 1;

function slug(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function scheduleParts(schedule) {
  const [weather = '', time = ''] = String(schedule || '').split(';');
  const list = (value) => value.split(',').map((item) => item.trim().toLowerCase()).filter(Boolean);
  return { weather: list(weather), time: list(time) };
}

function listedValue(value, fallback) {
  const cleaned = String(value || '')
    .replace(/&mdash;|&#8212;|\u2014/gi, '')
    .trim();
  return cleaned || fallback;
}

function locationType(fish, previous) {
  if (previous?.locationType) return previous.locationType;
  if (/mermaid fish attractor/i.test(fish.category)) return 'special';
  if (/\[event\]|event|season|cinematics|modular|call of whales/i.test(`${fish.location} ${fish.category}`)) return 'event';
  if (/river/i.test(fish.location)) return 'river';
  if (/lake/i.test(fish.location)) return 'lake';
  if (/sea/i.test(fish.location)) return 'sea';
  return 'special';
}

const trackerData = data.fish.map((fish) => {
  const previous = byName.get(fish.name);
  const fishSlug = previous?.slug || slug(fish.name);
  const schedule = scheduleParts(fish.schedule);
  const detail = path.join(root, 'database', 'fish', fishSlug, 'index.html');
  return {
    id: previous?.id || nextId++,
    name: fish.name,
    slug: fishSlug,
    image: fish.image,
    locationType: locationType(fish, previous),
    location: fish.location,
    level: Number(fish.level) || 1,
    shadow: listedValue(fish.shadow, 'Not listed'),
    category: fish.category || 'Common',
    weather: schedule.weather,
    time: schedule.time,
    schedule: fish.schedule || 'Check in game',
    marketValue: listedValue(fish.value, 'Check in game'),
    maxValue: Number(fish.maxValue) || 0,
    url: fs.existsSync(detail) ? `/database/fish/${fishSlug}/` : '/database/fish/'
  };
}).sort((left, right) => left.id - right.id);

const marker = `<!-- FISH_TRACKER_DATA_START -->\n    <script>window.heartopiaFishData = ${JSON.stringify(trackerData)};</script>\n    <script src="/assets/js/fish-tracker.js"></script>\n    <!-- FISH_TRACKER_DATA_END -->`;
if (/<!-- FISH_TRACKER_DATA_START -->[\s\S]*?<!-- FISH_TRACKER_DATA_END -->/.test(html)) {
  html = html.replace(/<!-- FISH_TRACKER_DATA_START -->[\s\S]*?<!-- FISH_TRACKER_DATA_END -->/, marker);
} else {
  html = html.replace(/\s*<script>\s*const fishData = [\s\S]*?<\/script>/, `\n    ${marker}`);
}

const count = trackerData.length;
const updated = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
  .format(new Date(`${data.generatedAt}T00:00:00Z`));
html = html
  .replace(/Heartopia Fish Tracker: \d+ Fish/g, `Heartopia Fish Tracker: ${count} Fish`)
  .replace(/Track all \d+ Heartopia fish/g, `Track all ${count} Heartopia fish`)
  .replace(/Track all <strong>\d+ fish<\/strong>/g, `Track all <strong>${count} fish</strong>`)
  .replace(/id="total-count">\d+/, `id="total-count">${count}`)
  .replace(/Updated: [A-Z][a-z]+ \d+, \d{4}/, `Updated: ${updated}`);

fs.writeFileSync(trackerPath, html);
console.log(`Refreshed Fish Tracker with ${count} fish and shared My Progress storage.`);
