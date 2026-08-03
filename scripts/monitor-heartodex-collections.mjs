import fs from 'node:fs';
import path from 'node:path';
import { syncPath } from './sync-runtime.mjs';

const root = path.resolve(import.meta.dirname, '..');
const sourceBase = 'https://www.heartodex.com';
const sourceRoot = sourceBase + '/en/';
const outputFile = syncPath('collections.json');

const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const write = (file, value) => {
  const target = path.join(root, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, value);
};
const decode = (value = '') => value
  .replace(/&amp;/g, '&')
  .replace(/&quot;/g, '"')
  .replace(/&#39;/g, "'")
  .replace(/&apos;/g, "'")
  .replace(/&nbsp;/g, ' ')
  .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
  .replace(/&#x([\da-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)));
const text = (value = '') => decode(value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim());
const slugify = (value = '') => decode(value).toLowerCase()
  .normalize('NFKD')
  .replace(/['’]/g, '')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '');
const attrs = (tag) => Object.fromEntries([...tag.matchAll(/([:\w-]+)\s*=\s*(["'])([\s\S]*?)\2/g)].map((match) => [match[1].toLowerCase(), decode(match[3])]));

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

function retryDelay(response, attempt) {
  const retryAfter = Number(response?.headers?.get('retry-after'));
  if (Number.isFinite(retryAfter) && retryAfter > 0) return Math.min(retryAfter * 1000, 30000);
  return Math.min(1500 * (2 ** (attempt - 1)), 12000);
}

async function fetchPage(kind) {
  const url = sourceRoot + kind + '/';
  let lastError;
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36 HeartopiaLifeMonitor/1.1',
          accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'accept-language': 'en-US,en;q=0.9',
          referer: sourceRoot
        }
      });
      if (!response.ok) {
        lastError = new Error(response.status + ' ' + response.statusText);
        if (![403, 408, 425, 429, 500, 502, 503, 504].includes(response.status)) throw lastError;
        if (attempt < 4) await sleep(retryDelay(response, attempt));
        continue;
      }
      return await response.text();
    } catch (error) {
      lastError = error;
      if (attempt < 4) await sleep(retryDelay(null, attempt));
    }
  }
  throw new Error('Unable to fetch a reference collection page: ' + lastError.message.replace(/https?:\/\/\S+/g, '[remote URL]'));
}

function parseRemoteCollection(html, kind) {
  const countMatch = html.match(/(\d{1,4})\s*Registered/i);
  const items = new Map();
  const cardPattern = new RegExp('<a\\b[^>]*href=(["\'])(?:https?:\\/\\/www\\.heartodex\\.com)?\\/en\\/' + kind + '\\/([^"\'/?#]+)[^"\']*\\1[^>]*>([\\s\\S]*?)<\\/a>', 'gi');
  for (const match of html.matchAll(cardPattern)) {
    const slug = slugify(match[2]);
    const block = match[3];
    const imageTag = block.match(/<img\b[^>]*>/i)?.[0] || '';
    const image = attrs(imageTag);
    const heading = block.match(/<h[1-6]\b[^>]*>([\s\S]*?)<\/h[1-6]>/i)?.[1];
    const name = text(heading || image.alt || '');
    if (!slug || !name) continue;
    items.set(slug, {
      slug,
      name,
      imageUrl: image.src ? new URL(image.src, sourceBase).href : null
    });
  }
  const entries = [...items.values()].sort((a, b) => a.slug.localeCompare(b.slug));
  // Some Heartodex database hubs expose a registered counter; insects currently does not.
  // In that case the deduplicated card count is the source count and still gets checked.
  const registered = countMatch ? Number(countMatch[1]) : entries.length;
  if (entries.length !== registered) {
    throw new Error(kind + ' parse safety check failed: page says ' + registered + ', parsed ' + entries.length + '. No snapshot was written.');
  }
  return { registered, entries };
}

function localFish() {
  const html = read('database/fish/index.html');
  const entries = [];
  for (const row of html.matchAll(/<tr>\s*([\s\S]*?)\s*<\/tr>/g)) {
    const cells = [...row[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((cell) => text(cell[1]));
    if (cells.length < 7 || !/^\d+$/.test(cells[2])) continue;
    entries.push({ slug: slugify(cells[0]), name: cells[0] });
  }
  return entries;
}

function localInsects() {
  const data = JSON.parse(read('data/heartopia-insects.json'));
  return data.insects.map((insect) => ({ slug: slugify(insect.name), name: insect.name }));
}

function localBirds() {
  const html = read('database/birds/index.html');
  const block = html.match(/const birdData=(\[[\s\S]*?\])\s*;const birdLinks/);
  if (!block) throw new Error('Could not read birdData from database/birds/index.html');
  return JSON.parse(block[1]).map((bird) => ({ slug: slugify(bird.name), name: bird.name }));
}

function comparison(remote, local) {
  const remoteSlugs = new Set(remote.entries.map((entry) => entry.slug));
  const localSlugs = new Set(local.map((entry) => entry.slug));
  return {
    remoteAdded: remote.entries.filter((entry) => !localSlugs.has(entry.slug)),
    localOnly: local.filter((entry) => !remoteSlugs.has(entry.slug))
  };
}

// Fetch one same-origin listing at a time. GitHub-hosted runners can be throttled when
// all three requests arrive together, which previously made the third request fail 403.
const listingHtml = {};
for (const kind of ['fish', 'birds', 'insects']) {
  listingHtml[kind] = await fetchPage(kind);
  if (kind !== 'insects') await sleep(1200);
}
const remote = {
  fish: parseRemoteCollection(listingHtml.fish, 'fish'),
  birds: parseRemoteCollection(listingHtml.birds, 'birds'),
  insects: parseRemoteCollection(listingHtml.insects, 'insects')
};
const local = {
  fish: localFish(),
  birds: localBirds(),
  insects: localInsects()
};
const snapshot = {
  schemaVersion: 1,
  source: sourceRoot,
  collections: {
    fish: {
      registered: remote.fish.registered,
      entries: remote.fish.entries,
      localCount: local.fish.length,
      pendingReview: comparison(remote.fish, local.fish)
    },
    birds: {
      registered: remote.birds.registered,
      entries: remote.birds.entries,
      localCount: local.birds.length,
      pendingReview: comparison(remote.birds, local.birds)
    },
    insects: {
      registered: remote.insects.registered,
      entries: remote.insects.entries,
      localCount: local.insects.length,
      pendingReview: comparison(remote.insects, local.insects)
    }
  },
  policy: {
    mode: 'review-before-publish',
    note: 'This monitor records public listing changes only. Review game conditions, availability, and image rights before publishing any update.'
  }
};
const next = JSON.stringify(snapshot, null, 2) + '\n';
const previous = fs.existsSync(outputFile) ? fs.readFileSync(outputFile, 'utf8') : '';
if (previous === next) {
  console.log('No reference collection change. Fish ' + remote.fish.registered + '/' + local.fish.length + '; birds ' + remote.birds.registered + '/' + local.birds.length + '; insects ' + remote.insects.registered + '/' + local.insects.length + '.');
} else {
  fs.mkdirSync(path.dirname(outputFile), { recursive: true });
  fs.writeFileSync(outputFile, next);
  console.log('Updated temporary monitor snapshot. Fish ' + remote.fish.registered + '/' + local.fish.length + '; birds ' + remote.birds.registered + '/' + local.birds.length + '; insects ' + remote.insects.registered + '/' + local.insects.length + '.');
}
