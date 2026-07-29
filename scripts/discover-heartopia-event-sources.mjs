import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { EVENT_DISCOVERY_SOURCES, OFFICIAL_EVENT_IMAGE_HOSTS } from './event-source-config.mjs';

const root = path.resolve(import.meta.dirname, '..');
const args = process.argv.slice(2);
const option = (name, fallback = '') => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : fallback;
};
const outputDir = process.env.HEARTOPIA_SYNC_DIR || path.join(root, '.tmp-sync');
const beforeFile = path.resolve(option('--before', path.join(outputDir, 'official-signals-before.json')));
const snapshotFile = path.join(outputDir, 'official-signals-current.json');
const reportFile = path.join(outputDir, 'event-source-discovery.json');
const now = new Date();
const eventWords = /\b(event|collaboration|collab|season|festival|fashionwave|challenge|celebration|limited[- ]time|concert|party)\b/i;
const updateWords = /\b(update|version|patch|maintenance|announcement|release notes?)\b/i;
const ignoredWords = /\b(beta|test access|installation guide|privacy|terms|support|download|pre-register)\b/i;

const clean = (value) => String(value || '')
  .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
  .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
  .replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
const slugify = (value) => clean(value).toLowerCase().normalize('NFKD')
  .replace(/[’']/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const hash = (value) => crypto.createHash('sha256').update(String(value)).digest('hex').slice(0, 20);
const dateFrom = (value) => clean(value).match(/(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2}(?:,?\s+\d{4})?|\d{4}[./-]\d{1,2}[./-]\d{1,2}/i)?.[0] || '';

function absoluteUrl(value, baseUrl) {
  try {
    const url = new URL(value, baseUrl);
    return /^https?:$/.test(url.protocol) ? url.href : '';
  } catch { return ''; }
}

function officialImage(value, baseUrl) {
  const url = absoluteUrl(value, baseUrl);
  if (!url) return '';
  const host = new URL(url).hostname.toLowerCase();
  return OFFICIAL_EVENT_IMAGE_HOSTS.some((allowed) => host === allowed || host.endsWith(`.${allowed}`)) ? url : '';
}

async function fetchText(source) {
  const headers = { 'user-agent': 'HeartopiaLifeEventDiscovery/1.0 (+https://heartopia.life/)', accept: 'text/html,text/plain' };
  try {
    const response = await fetch(source.url, { headers, redirect: 'follow' });
    if (response.ok) return { text: await response.text(), transport: 'direct' };
    throw new Error(`${response.status} ${response.statusText}`);
  } catch (directError) {
    const url = new URL(source.url);
    const reader = await fetch(`https://r.jina.ai/http://${url.host}${url.pathname}${url.search}`, { headers: { ...headers, accept: 'text/plain' } });
    if (!reader.ok) throw new Error(`direct: ${directError.message}; reader: ${reader.status}`);
    return { text: await reader.text(), transport: 'reader' };
  }
}

function record(source, title, url, context, imageUrl = '') {
  const normalizedTitle = clean(title);
  if (normalizedTitle.length < 4 || normalizedTitle.length > 140 || /^home|latest news|more$/i.test(normalizedTitle)) return null;
  const slug = slugify(normalizedTitle.replace(/^heartopia\s*[x:-]?\s*/i, ''));
  return {
    id: hash(`${source.id}:${slug}:${url}`), sourceId: source.id, sourceLabel: source.label,
    sourceKind: source.kind, title: normalizedTitle, slug, date: dateFrom(context), url,
    imageUrl: source.kind === 'official' ? officialImage(imageUrl, source.url) : '',
    signalType: eventWords.test(normalizedTitle) ? 'event' : updateWords.test(normalizedTitle) ? 'update' : 'announcement',
    eventLikely: eventWords.test(normalizedTitle) && !ignoredWords.test(normalizedTitle),
  };
}

function parse(html, source) {
  const found = [];
  if (/<a\b/i.test(html)) {
    const re = /<a\b[^>]*href=(["'])([^"']+)\1[^>]*>([\s\S]*?)<\/a>/gi;
    for (const match of html.matchAll(re)) {
      const url = absoluteUrl(match[2], source.url);
      if (!url) continue;
      const block = match[3];
      const title = block.match(/<h[1-6]\b[^>]*>([\s\S]*?)<\/h[1-6]>/i)?.[1]
        || block.match(/\b(?:title|alt)=(["'])(.*?)\1/i)?.[2] || block;
      const context = html.slice(Math.max(0, match.index - 500), match.index + match[0].length + 500);
      const image = block.match(/<img\b[^>]*(?:src|data-src)=(["'])(.*?)\1/i)?.[2]
        || context.match(/<img\b[^>]*(?:src|data-src)=(["'])(.*?)\1/i)?.[2] || '';
      const item = record(source, title, url, context, image);
      if (item) found.push(item);
    }
  } else {
    for (const match of html.matchAll(/\[([^\]\n]{4,140})\]\((https?:\/\/[^)\s]+)\)/g)) {
      const context = html.slice(Math.max(0, match.index - 300), match.index + match[0].length + 300);
      const item = record(source, match[1], match[2], context);
      if (item) found.push(item);
    }
  }
  return [...new Map(found.map((item) => [item.url || `${item.slug}:${item.date}`, item])).values()].slice(0, 100);
}

function parseOfficialFeed(text, source) {
  const payload = JSON.parse(text);
  const articles = payload?.data?.list;
  if (!Array.isArray(articles)) throw new Error('Official news feed returned no article list.');
  return articles.map((article) => {
    const articleId = clean(article.article_id);
    const url = articleId
      ? `https://heartopia.xd.com/news?language=en_US&id=${encodeURIComponent(articleId)}`
      : source.url;
    return record(
      source,
      article.title,
      url,
      [article.time, article.create_time, article.update_time].filter(Boolean).join(' '),
      article.cover_obj?.url || article.cover || '',
    );
  }).filter(Boolean);
}

function officialRevisionSignal(html, source) {
  const markers = [
    html.match(/Build by[^<\n]+/i)?.[0],
    html.match(/updatedAt["': ]+(\d{10,})/i)?.[1],
    ...[...html.matchAll(/(?:src|href)=(["'])(https:\/\/[^"']+(?:\.js|\.css|\.png|\.jpg|\.webp))\1/gi)].map((match) => match[2]),
  ].filter(Boolean).sort();
  const revision = hash(markers.join('|') || clean(html).slice(0, 5000));
  const item = record(source, `${source.label} page revision`, source.url, '');
  item.id = hash(`${source.id}:revision:${revision}`);
  item.signalType = 'source-update';
  item.eventLikely = false;
  return item;
}


const sourceResults = [];
const signals = [];
for (const source of EVENT_DISCOVERY_SOURCES) {
  try {
    const fetched = await fetchText(source);
    const parsed = source.format === 'json'
      ? parseOfficialFeed(fetched.text, source)
      : parse(fetched.text, source);
    if (source.kind === 'official' && source.revisionOnly) {
      parsed.length = 0;
      parsed.push(officialRevisionSignal(fetched.text, source));
    }
    signals.push(...parsed);
    sourceResults.push({ id: source.id, label: source.label, ok: true, transport: fetched.transport, records: parsed.length });
  } catch (error) {
    sourceResults.push({ id: source.id, label: source.label, ok: false, records: 0, error: error.message });
    console.log(`::warning::${source.label} unavailable: ${error.message}`);
  }
}
if (!sourceResults.some((source) => source.ok)) throw new Error('All Heartopia event discovery sources failed.');

const hadBaseline = fs.existsSync(beforeFile);
const previous = hadBaseline ? JSON.parse(fs.readFileSync(beforeFile, 'utf8')) : { signals: [] };
const previousIds = new Set((previous.signals || []).map((signal) => signal.id));
const previousSourceIds = new Set((previous.signals || []).map((signal) => signal.sourceId));
const newSignals = hadBaseline
  ? signals.filter((signal) => previousSourceIds.has(signal.sourceId) && !previousIds.has(signal.id))
  : [];
const recent = (date) => {
  const parsed = new Date(date);
  return !date || Number.isNaN(parsed.valueOf()) || parsed >= new Date(now.valueOf() - 180 * 86400000);
};
const catalogSlugs = signals
  .filter((signal) => signal.sourceKind === 'catalog' && signal.slug.length >= 5)
  .map((signal) => signal.slug);
const matchesCatalog = (signal) => catalogSlugs.some((catalogSlug) => (
  signal.slug === catalogSlug
  || signal.slug.includes(catalogSlug)
  || catalogSlug.includes(signal.slug)
));
const officialEventCandidates = signals
  .filter((signal) => signal.sourceKind === 'official' && recent(signal.date))
  .filter((signal) => signal.eventLikely || matchesCatalog(signal))
  .map(({ title, slug, date, url, imageUrl, sourceId }) => ({ title, slug, date, url, imageUrl, sourceId }));
const report = { generatedAt: now.toISOString(), firstRun: !hadBaseline, sources: sourceResults, newSignals, officialEventCandidates };

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(snapshotFile, `${JSON.stringify({ generatedAt: report.generatedAt, signals }, null, 2)}\n`);
fs.writeFileSync(reportFile, `${JSON.stringify(report, null, 2)}\n`);
if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, [
  `report_file=${reportFile}`, `snapshot_file=${snapshotFile}`,
  `official_signal_count=${newSignals.filter((signal) => signal.sourceKind === 'official').length}`,
  `source_warning_count=${sourceResults.filter((source) => !source.ok).length}`, '',
].join('\n'));
console.log(`Event source discovery: ${sourceResults.filter((source) => source.ok).length}/${EVENT_DISCOVERY_SOURCES.length} sources, ${newSignals.length} new signals.`);
