import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const errors = [];
const locales = ['id', 'pt-br', 'ja', 'zh-tw'];
const blockedPublicFields = new Set(['source', 'sourceUrl', 'imageUrl']);
const artworkAliases = {
  'my-little-pony': 'my-little-pony-collaboration',
  'winter-frost-season': 'winter-2026',
  'sanrio-characters': 'sanrio-characters-collaboration',
  'frostspore-butterflies': 'winter-2026',
};

const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const readJson = (relativePath) => JSON.parse(read(relativePath));
const exists = (relativePath) => fs.existsSync(path.join(root, relativePath));
const check = (condition, message) => {
  if (!condition) errors.push(message);
};

function findBlockedFields(value, location, found = []) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => findBlockedFields(item, `${location}[${index}]`, found));
    return found;
  }
  if (!value || typeof value !== 'object') return found;
  for (const [key, item] of Object.entries(value)) {
    const child = `${location}.${key}`;
    if (blockedPublicFields.has(key)) found.push(child);
    findBlockedFields(item, child, found);
  }
  return found;
}

const eventData = readJson('data/heartopia-events.json');
const imageManifest = readJson('data/heartopia-event-images.json');
const events = Array.isArray(eventData.events) ? eventData.events : [];
const images = imageManifest.images || {};

check(eventData.count === events.length, `Event data: declared ${eventData.count}, actual ${events.length}`);
for (const field of findBlockedFields(eventData, 'data/heartopia-events.json')) {
  errors.push(`Event data: blocked public field ${field}`);
}
for (const field of findBlockedFields(imageManifest, 'data/heartopia-event-images.json')) {
  errors.push(`Event image manifest: blocked public field ${field}`);
}

const englishHub = read('events/index.html');
check(!englishHub.includes('Artwork not available'), 'Events: English hub still contains an artwork placeholder');

const currentEvents = events.filter((event) => ['active', 'upcoming'].includes(event.status));
for (const event of events) {
  const route = event.localSlug || event.slug;
  const image = images[route] || images[event.slug];
  const artworkRoute = artworkAliases[event.slug] || route;
  const localArtwork = ['webp', 'jpg', 'jpeg', 'png']
    .map((extension) => `img/events/${artworkRoute}.${extension}`)
    .find(exists);
  check(Boolean(route), `Events: ${event.name || event.slug || 'unknown event'} has no local route`);
  check(Boolean(localArtwork), `Events: ${event.name} has no local artwork file`);
  if (image?.path) {
    check(image.path.startsWith('/img/events/'), `Events: ${event.name} image is not stored under /img/events/`);
    check(exists(image.path.replace(/^\//, '')), `Events: ${event.name} image file is missing at ${image.path}`);
  }
  check(exists(`events/${route}/index.html`), `Events: missing English detail page /events/${route}/`);
  check(englishHub.includes(`href="/events/${route}/"`), `Events: English hub does not link to /events/${route}/`);

  if (['active', 'upcoming'].includes(event.status)) {
    for (const locale of locales) {
      check(exists(`${locale}/events/${route}/index.html`), `Events: missing ${locale} ${event.status} detail page /${locale}/events/${route}/`);
    }
  }
}

for (const locale of locales) {
  const localizedHub = read(`${locale}/events/index.html`);
  check(!localizedHub.includes('Artwork not available'), `Events: /${locale}/events/ still contains an artwork placeholder`);
  for (const event of currentEvents) {
    const route = event.localSlug || event.slug;
    check(localizedHub.includes(event.name), `Events: /${locale}/events/ is missing ${event.name}`);
    check(localizedHub.includes(`href="/${locale}/events/${route}/"`), `Events: /${locale}/events/ does not link to /${locale}/events/${route}/`);
  }
}

if (errors.length) {
  console.error(`Event publishing audit failed with ${errors.length} issue(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(`Event publishing audit passed for ${events.length} events (${currentEvents.length} active/upcoming).`);
  console.log('- Public event JSON contains no blocked crawler-source fields.');
  console.log('- Every event has a local detail page, hub link, and local artwork file.');
  console.log(`- Active/upcoming event pages and links are present for ${locales.length} localized hubs.`);
}
