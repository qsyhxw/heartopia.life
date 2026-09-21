import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { OFFICIAL_EVENT_IMAGE_HOSTS, VERIFIED_EVENT_ARTWORK_SOURCES } from './event-source-config.mjs';

const root = path.resolve(import.meta.dirname, '..');
const reportFile = process.argv[2];
if (!reportFile || !fs.existsSync(reportFile)) {
  console.log('No discovery report; image download skipped.');
  process.exit(0);
}
const report = JSON.parse(fs.readFileSync(reportFile, 'utf8'));
const targetDir = path.join(root, 'img', 'events');
const manifestFile = path.join(root, 'data', 'heartopia-event-images.json');
fs.mkdirSync(targetDir, { recursive: true });
const extensions = new Map([['image/jpeg', 'jpg'], ['image/png', 'png'], ['image/webp', 'webp']]);
const manifest = fs.existsSync(manifestFile)
  ? JSON.parse(fs.readFileSync(manifestFile, 'utf8'))
  : { schemaVersion: 1, images: {} };
const allowed = (value) => {
  try {
    const host = new URL(value).hostname.toLowerCase();
    return OFFICIAL_EVENT_IMAGE_HOSTS.some((item) => host === item || host.endsWith(`.${item}`));
  } catch { return false; }
};
async function fetchImage(url) {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch(url, {
        headers: { 'user-agent': 'HeartopiaLifeEventImageFetcher/1.0 (+https://heartopia.life/)' },
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      return response;
    } catch (error) {
      lastError = error;
    } finally {
      clearTimeout(timeout);
    }
  }
  throw lastError;
}
let downloaded = 0;
const candidates = new Map(VERIFIED_EVENT_ARTWORK_SOURCES.map((item) => [item.slug, item]));
for (const item of report.officialEventCandidates || []) {
  if (!candidates.has(item.slug)) candidates.set(item.slug, item);
}
for (const item of candidates.values()) {
  if (!item.imageUrl || !allowed(item.imageUrl)) continue;
  try {
    const response = await fetchImage(item.imageUrl);
    const type = (response.headers.get('content-type') || '').split(';')[0].toLowerCase();
    const extension = extensions.get(type);
    if (!extension) throw new Error(`unsupported image type ${type || 'unknown'}`);
    const body = Buffer.from(await response.arrayBuffer());
    if (!body.length || body.length > 8 * 1024 * 1024) throw new Error('invalid image size');
    const sha256 = crypto.createHash('sha256').update(body).digest('hex');
    const relative = `/img/events/${item.slug}.${extension}`;
    const target = path.join(root, relative.slice(1));
    const previous = manifest.images[item.slug];
    const same = previous?.sha256 === sha256 && fs.existsSync(target);
    if (!same) {
      fs.writeFileSync(target, body);
      downloaded += 1;
    }
    if (!same || previous?.path !== relative || previous?.sourceImageUrl !== item.imageUrl) {
      manifest.images[item.slug] = {
        path: relative,
        sourceImageUrl: item.imageUrl,
        sha256,
        updatedAt: report.generatedAt?.slice(0, 10) || new Date().toISOString().slice(0, 10),
      };
    }
  } catch (error) {
    console.log(`::warning::Event image skipped for ${item.title}: ${error.message}`);
  }
}
manifest.updatedAt = Object.values(manifest.images).reduce((latest, item) => item.updatedAt > latest ? item.updatedAt : latest, '');
fs.writeFileSync(manifestFile, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Downloaded ${downloaded} official event image(s).`);
if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `downloaded_count=${downloaded}\n`);
