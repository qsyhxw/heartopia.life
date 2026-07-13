import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const sourceBase = 'https://www.heartodex.com';
const sourceRoot = sourceBase + '/en/';
const outputFile = 'data/monitor/heartodex-collections.json';

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

async function fetchPage(kind) {
  const url = sourceRoot + kind + '/';
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          'user-agent': 'HeartopiaLifeCollectionMonitor/1.0 (+https://heartopia.life/)',
          accept: 'text/html,application/xhtml+xml'
        }
      });
      if (!response.ok) throw new Error(response.status + ' ' + response.statusText);
      return await response.text();
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, attempt * 900));
    }
  }
  throw new Error('Unable to fetch ' + url + ': ' + lastError.message);
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

const [fishHtml, birdsHtml, insectsHtml] = await Promise.all([fetchPage('fish'), fetchPage('birds'), fetchPage('insects')]);
const remote = {
  fish: parseRemoteCollection(fishHtml, 'fish'),
  birds: parseRemoteCollection(birdsHtml, 'birds'),
  insects: parseRemoteCollection(insectsHtml, 'insects')
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
const previous = fs.existsSync(path.join(root, outputFile)) ? read(outputFile) : '';
if (previous === next) {
  console.log('No Heartodex collection change. Fish ' + remote.fish.registered + '/' + local.fish.length + '; birds ' + remote.birds.registered + '/' + local.birds.length + '; insects ' + remote.insects.registered + '/' + local.insects.length + '.');
} else {
  write(outputFile, next);
  console.log('Updated monitor snapshot. Fish ' + remote.fish.registered + '/' + local.fish.length + '; birds ' + remote.birds.registered + '/' + local.birds.length + '; insects ' + remote.insects.registered + '/' + local.insects.length + '.');
}
