import fs from 'node:fs';
import path from 'node:path';
import { achievementObjectives, localAchievementObjective } from './achievement-objectives.mjs';

const root = path.resolve(import.meta.dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const write = (file, value) => fs.writeFileSync(path.join(root, file), value);
const source = JSON.parse(read('data/heartopia-achievements.json'));
const achievements = source.achievements || [];
const slugs = new Set(achievements.map((entry) => entry.slug));
const missing = achievements.filter((entry) => !localAchievementObjective(entry.slug));
const stale = Object.keys(achievementObjectives).filter((slug) => !slugs.has(slug));

if (achievements.length !== 67 || missing.length || stale.length) {
  throw new Error(`Objective map mismatch: entries=${achievements.length}, missing=${missing.map((x) => x.slug)}, stale=${stale}`);
}

for (const entry of achievements) {
  entry.objective = localAchievementObjective(entry.slug);
  entry.version = 'Locally structured condition';
}
source.generatedAt = new Date().toISOString().slice(0, 10);
source.count = achievements.length;
write('data/heartopia-achievements.json', JSON.stringify(source, null, 2) + '\n');

const pageFile = 'guides/achievements/index.html';
let page = read(pageFile);
const embedded = `const achievements=${JSON.stringify(achievements)},store=`;
if (!/const achievements=\[[\s\S]*?\],store=/.test(page)) throw new Error('Achievement page data block was not found');
page = page
  .replace(/const achievements=\[[\s\S]*?\],store=/, embedded)
  .replace(/with verified objectives/g, 'with structured achievement conditions')
  .replace(/with locally reviewed objectives/g, 'with structured achievement conditions')
  .replace(/Updated: \d{4}-\d{2}-\d{2}/, `Updated: ${source.generatedAt}`)
  .replace(/"dateModified":"\d{4}-\d{2}-\d{2}"/, `"dateModified":"${source.generatedAt}"`);
write(pageFile, page);

console.log(`Applied ${achievements.length} locally structured achievement conditions.`);
