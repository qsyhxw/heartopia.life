import fs from 'node:fs';
import path from 'node:path';
import { OFFICIAL_EVENT_IMAGE_HOSTS } from './event-source-config.mjs';

const root = path.resolve(import.meta.dirname, '..');
const reportFile = process.argv[2];
if (!reportFile || !fs.existsSync(reportFile)) {
  console.log('No discovery report; image download skipped.');
  process.exit(0);
}
const report = JSON.parse(fs.readFileSync(reportFile, 'utf8'));
const targetDir = path.join(root, 'img', 'events');
fs.mkdirSync(targetDir, { recursive: true });
const extensions = new Map([['image/jpeg', 'jpg'], ['image/png', 'png'], ['image/webp', 'webp']]);
const localExists = (slug) => ['jpg', 'jpeg', 'png', 'webp'].some((ext) => fs.existsSync(path.join(targetDir, `${slug}.${ext}`)));
const allowed = (value) => {
  try {
    const host = new URL(value).hostname.toLowerCase();
    return OFFICIAL_EVENT_IMAGE_HOSTS.some((item) => host === item || host.endsWith(`.${item}`));
  } catch { return false; }
};
let downloaded = 0;
for (const item of report.officialEventCandidates || []) {
  if (!item.imageUrl || !allowed(item.imageUrl) || localExists(item.slug)) continue;
  try {
    const response = await fetch(item.imageUrl, { headers: { 'user-agent': 'HeartopiaLifeEventImageFetcher/1.0 (+https://heartopia.life/)' } });
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    const type = (response.headers.get('content-type') || '').split(';')[0].toLowerCase();
    const extension = extensions.get(type);
    if (!extension) throw new Error(`unsupported image type ${type || 'unknown'}`);
    const body = Buffer.from(await response.arrayBuffer());
    if (!body.length || body.length > 8 * 1024 * 1024) throw new Error('invalid image size');
    fs.writeFileSync(path.join(targetDir, `${item.slug}.${extension}`), body);
    downloaded += 1;
  } catch (error) {
    console.log(`::warning::Official image skipped for ${item.title}: ${error.message}`);
  }
}
console.log(`Downloaded ${downloaded} official event image(s).`);
if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `downloaded_count=${downloaded}\n`);
