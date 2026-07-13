import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const write = (file, value) => fs.writeFileSync(path.join(root, file), value);
const escape = (value) => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const readiness = JSON.parse(read('data/monitor/heartodex-sync-readiness.json'));
let changes = 0;

if (readiness.ready.fish.length) {
  const file = 'database/fish/index.html';
  let html = read(file);
  const rows = readiness.ready.fish.map((fish) => `<tr><td class="px-4 py-2 font-medium">${escape(fish.name)}</td><td class="px-4 py-2 text-cozy-wood">Check in game</td><td class="px-4 py-2">${fish.level}</td><td class="px-4 py-2 text-cozy-wood">Check in game</td><td class="px-4 py-2 text-cozy-wood">Auto-synced (location pending)</td><td class="px-4 py-2 text-cozy-wood">${escape(fish.weather.join(', '))}; Check in game</td><td class="px-4 py-2 text-cozy-wood">Check in game</td><td class="px-4 py-2 text-cozy-wood text-xs">Detected automatically. Confirm location, time, shadow, and value in game.</td></tr>`).join('');
  const block = `<!-- AUTO-SYNC:UNVERIFIED:FISH:START --><section id="auto-synced-fish" class="mb-12"><h2 class="font-display text-2xl font-bold mb-2">New Fish: Conditions Pending</h2><p class="text-sm text-cozy-wood mb-4">Newly detected entries with verified level, weather, and local image. Check the game for remaining conditions.</p><div class="overflow-x-auto"><table class="w-full text-sm"><tbody class="divide-y divide-cozy-peach/20">${rows}</tbody></table></div></section><!-- AUTO-SYNC:UNVERIFIED:FISH:END -->`;
  const marker = '<!-- ===== SPECIAL COLLABORATION FISH ===== -->';
  if (!html.includes(marker)) throw new Error('Fish insertion marker not found');
  html = html.includes('AUTO-SYNC:UNVERIFIED:FISH:START')
    ? html.replace(/<!-- AUTO-SYNC:UNVERIFIED:FISH:START -->[\s\S]*?<!-- AUTO-SYNC:UNVERIFIED:FISH:END -->/, block)
    : html.replace(marker, `${block}\n${marker}`);
  write(file, html);
  changes += readiness.ready.fish.length;
}

if (readiness.ready.birds.length) {
  const file = 'database/birds/index.html';
  let html = read(file);
  const marker = /const birdData=(\[[\s\S]*?\])\s*;const birdLinks/;
  const match = html.match(marker);
  if (!match) throw new Error('birdData marker not found');
  const birds = JSON.parse(match[1]);
  const known = new Set(birds.map((bird) => bird.name));
  for (const bird of readiness.ready.birds) {
    const name = bird.name.toLowerCase();
    if (!known.has(name)) birds.push({ name, level: bird.level, weather: bird.weather.join(', '), time: 'Check in game', location: 'Check in game', category: 'Auto-synced (location pending)', img: bird.name.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') + '.webp' });
  }
  html = html.replace(marker, `const birdData=${JSON.stringify(birds, null, 2)}\n;const birdLinks`);
  write(file, html);
  changes += readiness.ready.birds.length;
}

if (readiness.ready.insects?.length) {
  const file = 'data/heartopia-insects.json';
  const data = JSON.parse(read(file));
  const known = new Set(data.insects.map((insect) => insect.name.toLowerCase()));
  for (const insect of readiness.ready.insects) {
    if (known.has(insect.name.toLowerCase())) continue;
    data.insects.push({
      slug: insect.name.toLowerCase(),
      name: insect.name,
      level: insect.level,
      weather: insect.weather.join(', '),
      schedule: 'Check in game',
      location: 'Check in game',
      category: 'Auto-synced (location pending)',
      image: insect.image,
      imageSourceName: insect.name
    });
    known.add(insect.name.toLowerCase());
    changes += 1;
  }
  data.count = data.insects.length;
  data.generatedAt = new Date().toISOString().slice(0, 10);
  write(file, JSON.stringify(data, null, 2) + '\n');
}

console.log(`Applied ${changes} auto-synced entries.`);
