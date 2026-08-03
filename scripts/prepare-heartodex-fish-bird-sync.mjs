import fs from 'node:fs';
import path from 'node:path';
import { readSyncJson, writeSyncJson } from './sync-runtime.mjs';

const root = path.resolve(import.meta.dirname, '..');
const source = 'https://www.heartodex.com/en/';
const fallbackBase = 'https://r.jina.ai/http://www.heartodex.com/en/';
const assetDirectories = { fish: 'peces', birds: 'aves', insects: 'insectos' };
const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const decode = (value) => String(value || '')
  .replace(/&amp;/g, '&')
  .replace(/&quot;/g, '"')
  .replace(/&#39;/g, "'")
  .replace(/&nbsp;/g, ' ');
const text = (value) => decode(String(value || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim());
const slugify = (value) => decode(String(value || '')).toLowerCase()
  .normalize('NFKD')
  .replace(/['’]/g, '')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '');
const assetName = (value) => String(value)
  .replace(/[^a-z0-9]+/gi, '-')
  .replace(/^-|-$/g, '') + '.webp';
const safeError = (error) => String(error?.message || error).replace(/https?:\/\/\S+/g, '[remote URL]');

async function fetchText(url, { attempts = 2, timeout = 45000, headers = {} } = {}) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers,
        signal: AbortSignal.timeout(timeout)
      });
      if (!response.ok) throw new Error(response.status + ' ' + response.statusText);
      return await response.text();
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await sleep(1200 * attempt);
    }
  }
  throw lastError || new Error('request failed');
}

function parseHtmlDetail(kind, item, html) {
  const image = html.match(/<meta property="og:image" content="([^"]+)"/i)?.[1] || item.imageUrl || null;
  const level = Number(html.match(/>Level<\/span>\s*<span[^>]*>(\d+)<\/span>/i)?.[1]);
  const weatherStart = html.search(/>Weather<\/h2>/i);
  const weatherBlock = weatherStart >= 0 ? html.slice(weatherStart, weatherStart + 9000) : '';
  const weather = [...weatherBlock.matchAll(/<span[^>]*>(Rainbow|Sunny|Rainy)<\/span>/gi)].map((match) => match[1]);
  if (!image || !Number.isFinite(level) || !weather.length) {
    throw new Error(kind + '/' + item.slug + ' is missing image, level, or weather');
  }
  return { slug: item.slug, name: item.name, imageUrl: image, level, weather: [...new Set(weather)] };
}

function parseMarkdownDetail(kind, item, markdown) {
  const images = [...markdown.matchAll(/!\[Image\s+\d+:\s*([^\]]+)\]\(([^)\s]+)\)/gi)];
  const image = images.find((match) => slugify(match[1]) === item.slug)?.[2]
    || images.find((match) => !/heartodex logo/i.test(match[1]))?.[2]
    || item.imageUrl
    || null;
  const level = Number(markdown.match(/\bLevel\s+(\d+)\b/i)?.[1]);
  const weatherStart = markdown.search(/^##\s+Weather\s*$/im);
  const remaining = weatherStart >= 0 ? markdown.slice(weatherStart) : '';
  const nextHeading = remaining.slice(3).search(/^##\s+/m);
  const weatherBlock = nextHeading >= 0 ? remaining.slice(0, nextHeading + 3) : remaining;
  const weather = [...weatherBlock.matchAll(/\b(Rainbow|Sunny|Rainy)\b/gi)]
    .map((match) => match[1][0].toUpperCase() + match[1].slice(1).toLowerCase());
  if (!image || !Number.isFinite(level) || !weather.length) {
    throw new Error(kind + '/' + item.slug + ' text fallback is missing image, level, or weather');
  }
  return {
    slug: item.slug,
    name: item.name,
    imageUrl: new URL(image, 'https://www.heartodex.com').href.replace(/^http:/, 'https:'),
    level,
    weather: [...new Set(weather)]
  };
}

async function detail(kind, item) {
  let directError;
  if (process.env.HEARTOPIA_DETAILS_FORCE_PROXY !== '1') {
    try {
      const html = await fetchText(source + kind + '/' + item.slug + '/', {
        attempts: process.env.GITHUB_ACTIONS ? 1 : 3,
        timeout: 25000,
        headers: {
          'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36 HeartopiaLifeAutoSync/1.1',
          accept: 'text/html,application/xhtml+xml',
          'accept-language': 'en-US,en;q=0.9'
        }
      });
      return parseHtmlDetail(kind, item, html);
    } catch (error) {
      directError = error;
    }
  }

  const fallbackDir = process.env.HEARTOPIA_DETAILS_FALLBACK_DIR;
  const fallbackFile = fallbackDir ? path.join(fallbackDir, 'heartodex-detail-' + kind + '-' + item.slug + '.md') : '';
  try {
    const markdown = fallbackFile && fs.existsSync(fallbackFile)
      ? fs.readFileSync(fallbackFile, 'utf8')
      : await fetchText(fallbackBase + kind + '/' + item.slug + '/', {
        attempts: 2,
        timeout: 45000,
        headers: {
          'user-agent': 'HeartopiaLifeAutoSync/1.1 (+https://heartopia.life/)',
          accept: 'text/plain,text/markdown;q=0.9,*/*;q=0.8'
        }
      });
    console.warn('Direct detail unavailable for ' + kind + '/' + item.slug + '; using validated text fallback.');
    return parseMarkdownDetail(kind, item, markdown);
  } catch (fallbackError) {
    throw new Error(kind + '/' + item.slug + ' detail failed: ' + safeError(directError || 'direct skipped') + '; fallback: ' + safeError(fallbackError));
  }
}

function rawAssetFallback(kind, imageUrl) {
  try {
    const url = new URL(imageUrl);
    if (!/(^|\.)heartodex\.com$/i.test(url.hostname) || !url.pathname.includes('/_astro/')) return null;
    const filename = path.posix.basename(url.pathname).replace(/_[A-Za-z0-9]+(?=\.webp$)/i, '');
    const directory = assetDirectories[kind];
    return directory
      ? 'https://raw.githubusercontent.com/deskoxp/htpimagstor/main/webcms/' + directory + '/' + filename
      : null;
  } catch {
    return null;
  }
}

async function downloadImage(kind, item) {
  const candidates = [...new Set([item.imageUrl, rawAssetFallback(kind, item.imageUrl)].filter(Boolean))];
  let lastError;
  for (const url of candidates) {
    for (let attempt = 1; attempt <= 2; attempt += 1) {
      try {
        const response = await fetch(url, {
          headers: { 'user-agent': 'HeartopiaLifeAutoSync/1.1 (+https://heartopia.life/)' },
          signal: AbortSignal.timeout(30000)
        });
        if (!response.ok) throw new Error('image returned ' + response.status);
        const bytes = Buffer.from(await response.arrayBuffer());
        if (bytes.length < 100 || bytes.subarray(0, 4).toString() !== 'RIFF' || bytes.subarray(8, 12).toString() !== 'WEBP') {
          throw new Error('image is not a valid WebP');
        }
        const target = path.join(root, 'img', kind, assetName(item.name));
        fs.mkdirSync(path.dirname(target), { recursive: true });
        fs.writeFileSync(target, bytes);
        return '/img/' + kind + '/' + path.basename(target);
      } catch (error) {
        lastError = error;
        if (attempt < 2) await sleep(1000 * attempt);
      }
    }
  }
  throw new Error('image download failed: ' + safeError(lastError || 'no image candidate'));
}

const snapshot = readSyncJson('collections.json');
const output = { source, ready: { fish: [], birds: [], insects: [] }, blocked: { fish: [], birds: [], insects: [] } };
for (const kind of ['fish', 'birds', 'insects']) {
  for (const item of snapshot.collections[kind].pendingReview.remoteAdded) {
    try {
      const parsed = await detail(kind, item);
      parsed.image = await downloadImage(kind, parsed);
      output.ready[kind].push(parsed);
    } catch (error) {
      const message = safeError(error);
      output.blocked[kind].push({ slug: item.slug, name: item.name, error: message });
      console.warn('Blocked ' + kind + '/' + item.slug + ': ' + message);
    }
  }
}
writeSyncJson('readiness.json', output);
const blocked = output.blocked.fish.length + output.blocked.birds.length + output.blocked.insects.length;
const ready = output.ready.fish.length + output.ready.birds.length + output.ready.insects.length;
console.log('Prepared ' + ready + ' additions; ' + blocked + ' additions blocked by required-field validation.');
if (blocked) process.exitCode = 2;