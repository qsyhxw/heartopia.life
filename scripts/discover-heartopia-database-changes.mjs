import fs from 'node:fs';
import path from 'node:path';
import { syncPath } from './sync-runtime.mjs';

const root = path.resolve(import.meta.dirname, '..');
const args = process.argv.slice(2);
const option = (name, fallback = '') => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : fallback;
};
const beforeFile = path.resolve(option('--before', syncPath('database-discovery-before.json')));
const snapshotFile = path.resolve(option('--snapshot', syncPath('database-discovery-snapshot.json')));
const reportFile = path.resolve(option('--report', syncPath('database-discovery-report.json')));
const sourceBase = 'https://www.heartodex.com';

const allCollections = [
  { key: 'fish', label: 'Fish', remotePath: 'fish', file: 'data/heartopia-fish.json', array: 'fish' },
  { key: 'birds', label: 'Birds', remotePath: 'birds', file: 'data/heartopia-birds.json', array: 'birds' },
  { key: 'insects', label: 'Insects', remotePath: 'insects', file: 'data/heartopia-insects.json', array: 'insects' },
  { key: 'wildlife', label: 'Wildlife', remotePath: 'wild-animals', file: 'data/heartopia-wildlife.json', array: 'wildlife' },
  { key: 'crops', label: 'Crops', remotePath: 'crops', file: 'data/heartopia-crops.json', array: 'crops' },
  { key: 'recipes', label: 'Recipes', remotePath: 'recipes', file: 'data/heartopia-recipes.json', array: 'recipes' },
  { key: 'achievements', label: 'Achievements', remotePath: 'achievements', file: 'data/heartopia-achievements.json', array: 'achievements' },
  { key: 'items', label: 'Items', remotePath: 'items', file: 'data/heartopia-items.json', array: 'items' },
  { key: 'ingredients', label: 'Ingredients', remotePath: 'ingredients', file: 'data/heartopia-ingredients.json', array: 'ingredients' },
  { key: 'collectibles', label: 'Collectibles', remotePath: 'collectibles', file: 'data/heartopia-collectibles.json', array: 'collectibles' },
  { key: 'npcs', label: 'NPCs', remotePath: 'npcs', file: 'data/heartopia-npcs.json', array: 'npcs' },
];
const requestedCollections = new Set(
  String(process.env.HEARTOPIA_DISCOVERY_COLLECTIONS || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean),
);
const collections = requestedCollections.size
  ? allCollections.filter((collection) => requestedCollections.has(collection.key))
  : allCollections;

const decode = (value = '') => value
  .replace(/&amp;/g, '&')
  .replace(/&quot;/g, '"')
  .replace(/&#39;/g, "'")
  .replace(/&apos;/g, "'")
  .replace(/&nbsp;/g, ' ')
  .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
  .replace(/&#x([\da-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)));
const text = (value = '') => decode(value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim());
const slugify = (value = '') => decode(String(value)).toLowerCase()
  .normalize('NFKD')
  .replace(/['’]/g, '')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '');
const normalizeName = (value = '') => decode(String(value)).toLowerCase()
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/['’]/g, '')
  .replace(/[^a-z0-9]+/g, ' ')
  .trim();
const attrs = (tag) => Object.fromEntries(
  [...tag.matchAll(/([:\w-]+)\s*=\s*(["'])([\s\S]*?)\2/g)]
    .map((match) => [match[1].toLowerCase(), decode(match[3])]),
);
const readJson = (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const writeJson = (file, value) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
};
const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function fetchText(url, { attempts = 1, timeout = 30000 } = {}) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetch(url, {
        headers: {
          'user-agent': 'HeartopiaLifeDiscoveryMonitor/1.1 (+https://heartopia.life/)',
          accept: 'text/html,text/plain,application/xhtml+xml',
        },
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      return await response.text();
    } catch (error) {
      lastError = error;
      await sleep(attempt * 900);
    } finally {
      clearTimeout(timer);
    }
  }
  throw lastError || new Error('request failed');
}

async function fetchListing(remotePath) {
  const directUrl = `${sourceBase}/en/${remotePath}/`;
  const fallbackDir = process.env.HEARTOPIA_DISCOVERY_FALLBACK_DIR;
  const fallbackFile = fallbackDir ? path.join(fallbackDir, `${remotePath}.md`) : '';
  if (process.env.HEARTOPIA_DISCOVERY_FORCE_PROXY === '1' && fallbackFile && fs.existsSync(fallbackFile)) {
    return { content: fs.readFileSync(fallbackFile, 'utf8'), format: 'markdown' };
  }
  let directError;
  if (process.env.HEARTOPIA_DISCOVERY_FORCE_PROXY !== '1') {
    try {
      const content = await fetchText(directUrl, {
        attempts: process.env.GITHUB_ACTIONS ? 1 : 3,
        timeout: 18000,
      });
      return { content, format: 'html' };
    } catch (error) {
      directError = error;
    }
  }
  try {
    if (fallbackFile && fs.existsSync(fallbackFile)) {
      return { content: fs.readFileSync(fallbackFile, 'utf8'), format: 'markdown' };
    }
    const proxyUrl = `https://r.jina.ai/http://www.heartodex.com/en/${remotePath}/`;
    const content = await fetchText(proxyUrl, { attempts: 2, timeout: 45000 });
    return { content, format: 'markdown' };
  } catch (proxyError) {
    const message = `${directError?.message || 'direct request skipped'}; ${proxyError?.message || 'fallback request failed'}`;
    throw new Error(message.replace(/https?:\/\/\S+/g, '[remote URL]'));
  }
}
function parseMarkdownListing(markdown, remotePath) {
  const registeredMatch = markdown.match(/(\d{1,4})\s*Registered/i);
  const items = new Map();
  const escapedPath = remotePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const linkPattern = new RegExp(
    `https?:\\/\\/(?:www\\.)?heartodex\\.com\\/en\\/${escapedPath}\\/([^\\s)\\]?#]+)\\)`,
    'gi',
  );
  for (const match of markdown.matchAll(linkPattern)) {
    const slug = slugify(match[1]);
    const prefix = markdown.slice(Math.max(0, match.index - 1400), match.index);
    const imageAlts = [...prefix.matchAll(/!\[Image\s+\d+:\s*([^\]]+)\]/gi)];
    const headings = [...prefix.matchAll(/###\s+([^\n\[\]]+)/g)];
    const rawName = imageAlts.at(-1)?.[1] || headings.at(-1)?.[1] || '';
    const name = text(rawName.replace(/\s+(?:Location|Level|Category|Seller|Price|Schedule|Weather)\b[\s\S]*$/i, ''));
    if (!slug || !name || name.length > 140) continue;
    items.set(slug, { slug, name });
  }
  const entries = [...items.values()].sort((a, b) => a.slug.localeCompare(b.slug));
  const registered = registeredMatch ? Number(registeredMatch[1]) : entries.length;
  if (!entries.length) throw new Error('parsed zero entity links from text fallback');
  if (registeredMatch && entries.length !== registered) {
    throw new Error(`registered counter is ${registered}, but ${entries.length} text entity links were parsed`);
  }
  return { count: registered, entries };
}
function parseListing(payload, remotePath) {
  if (payload.format === 'markdown') return parseMarkdownListing(payload.content, remotePath);
  const html = payload.content;
  const registeredMatch = html.match(/(\d{1,4})\s*Registered/i);
  const items = new Map();
  const escapedPath = remotePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const cardPattern = new RegExp(
    `<a\\b[^>]*href=(["'])(?:https?:\\/\\/www\\.heartodex\\.com)?\\/en\\/${escapedPath}\\/([^"'/?#]+)[^"']*\\1[^>]*>([\\s\\S]*?)<\\/a>`,
    'gi',
  );
  for (const match of html.matchAll(cardPattern)) {
    const slug = slugify(match[2]);
    const block = match[3];
    const imageTag = block.match(/<img\b[^>]*>/i)?.[0] || '';
    const image = attrs(imageTag);
    const heading = block.match(/<h[1-6]\b[^>]*>([\s\S]*?)<\/h[1-6]>/i)?.[1];
    const name = text(heading || image.alt || block);
    if (!slug || !name || name.length > 140) continue;
    items.set(slug, { slug, name });
  }
  const entries = [...items.values()].sort((a, b) => a.slug.localeCompare(b.slug));
  const registered = registeredMatch ? Number(registeredMatch[1]) : entries.length;
  if (!entries.length) throw new Error('parsed zero entity links');
  if (registeredMatch && entries.length !== registered) {
    throw new Error(`registered counter is ${registered}, but ${entries.length} unique entity links were parsed`);
  }
  return { count: registered, entries };
}

function localEntries(config) {
  const data = readJson(config.file);
  const rows = data[config.array];
  if (!Array.isArray(rows)) throw new Error(`${config.file} does not contain ${config.array}[]`);
  const entries = new Map();
  for (const row of rows) {
    const name = String(row.name || row.label || '').trim();
    const slug = slugify(row.sourceSlug || row.slug || row.id || name);
    if (name && slug) entries.set(slug, { slug, name });
  }
  return [...entries.values()].sort((a, b) => a.slug.localeCompare(b.slug));
}

function compareEntries(previousEntries, currentEntries) {
  const previous = new Map(previousEntries.map((entry) => [entry.slug, entry]));
  const current = new Map(currentEntries.map((entry) => [entry.slug, entry]));
  return {
    added: currentEntries.filter((entry) => !previous.has(entry.slug)),
    removed: previousEntries.filter((entry) => !current.has(entry.slug)),
    renamed: currentEntries
      .filter((entry) => (
        previous.has(entry.slug)
        && normalizeName(previous.get(entry.slug).name) !== normalizeName(entry.name)
      ))
      .map((entry) => ({
        slug: entry.slug,
        before: previous.get(entry.slug).name,
        after: entry.name,
      })),
  };
}

const previousSnapshot = fs.existsSync(beforeFile) ? JSON.parse(fs.readFileSync(beforeFile, 'utf8')) : null;
const snapshot = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  collections: {},
};
const report = {
  schemaVersion: 1,
  generatedAt: snapshot.generatedAt,
  firstRun: !previousSnapshot,
  changes: [],
  warnings: [],
};

for (const config of collections) {
  try {
    const local = localEntries(config);
    const html = await fetchListing(config.remotePath);
    const remote = parseListing(html, config.remotePath);
    const localComparison = compareEntries(local, remote.entries);
    const previous = previousSnapshot?.collections?.[config.key];
    const remoteComparison = previous
      ? compareEntries(previous.entries || [], remote.entries)
      : localComparison;
    const previousCount = Number(previous?.count || 0);
    const dropRatio = previousCount > 0 && remote.count < previousCount
      ? (previousCount - remote.count) / previousCount
      : 0;

    snapshot.collections[config.key] = {
      label: config.label,
      count: remote.count,
      entries: remote.entries,
      localCount: local.length,
    };
    if (remoteComparison.added.length || remoteComparison.removed.length || remoteComparison.renamed.length) {
      report.changes.push({
        key: config.key,
        label: config.label,
        previousCount: previous ? previousCount : local.length,
        currentCount: remote.count,
        added: remoteComparison.added,
        removed: remoteComparison.removed,
        renamed: remoteComparison.renamed,
        pendingLocal: localComparison.added,
      });
    }
    if (dropRatio > 0.1) {
      report.warnings.push({
        key: config.key,
        label: config.label,
        message: `Remote count dropped ${Math.round(dropRatio * 100)}%; automatic publishing must remain blocked.`,
      });
    }
  } catch (error) {
    report.warnings.push({
      key: config.key,
      label: config.label,
      message: String(error.message || error).replace(/https?:\/\/\S+/g, '[remote URL]'),
    });
  }
  await sleep(250);
}

report.checkedCount = Object.keys(snapshot.collections).length;
report.changeCount = report.changes.reduce(
  (total, change) => total + change.added.length + change.removed.length + change.renamed.length,
  0,
);
report.hasChanges = report.changeCount > 0;
report.hasWarnings = report.warnings.length > 0;
writeJson(snapshotFile, snapshot);
writeJson(reportFile, report);

if (process.env.GITHUB_OUTPUT) {
  fs.appendFileSync(process.env.GITHUB_OUTPUT, [
    `has_changes=${report.hasChanges}`,
    `has_warnings=${report.hasWarnings}`,
    `change_count=${report.changeCount}`,
    `warning_count=${report.warnings.length}`,
    `checked_count=${report.checkedCount}`,
    `snapshot_file=${snapshotFile}`,
    `report_file=${reportFile}`,
    '',
  ].join('\n'));
}

console.log(
  `Database discovery checked ${report.checkedCount}/${collections.length} collections: `
  + `${report.changeCount} changes, ${report.warnings.length} warnings.`,
);
if (!report.checkedCount) process.exitCode = 1;
