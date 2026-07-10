import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const write = (file, content) => fs.writeFileSync(path.join(root, file), content);
const fish = JSON.parse(read('data/heartopia-fish.json')).fish;
const byName = new Map(fish.map(item => [item.name, item]));
const esc = value => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const replaceAll = (file, pairs) => {
  let html = read(file);
  for (const [from, to] of pairs) {
    if (html.includes(from))
    html = html.replaceAll(from, to);
  }
  write(file, html);
};

replaceAll('hobbies/index.html', [[
  'oceans. Master line tension and hunt for rare Rainbow Fish!',
  'oceans. Master line tension and plan your catch around location, weather, and time.'
]]);
replaceAll('guides/hidden-achievements/index.html', [[
  'Fish N Chips at 5★ sells for 2,480G. Rainbow Fish sells for 5,000G raw. Sell consistently every day.',
  'Fish N Chips at 5★ sells for 2,480G. Use the Fish Prices table to check current high-value catches before selling. Sell consistently every day.'
]]);
replaceAll('progression/money-making/index.html', [
  ['farming. From jam profits to Rainbow Fish — maximize every sale!', 'farming. From jam profits to high-value catches — maximize every sale!'],
  ['<div class="text-xs text-cozy-wood">Rainbow Fish</div>', '<div class="text-xs text-cozy-wood">High-value fish</div>'],
  ['🌈 Rainbow Fish — 5,000 Gold Each!', '🌈 Rainbow Weather Fishing'],
  ['During <strong>rainbow weather</strong>, go to <strong>Starlight Sea</strong> and use\n                        <strong>premium bait</strong>. Rainbow Fish sell for an incredible 5,000 Gold each!', 'During <strong>rainbow weather</strong>, target the highest Fishing Level fish you can reach. Bluefin Tuna is at <strong>Zephyr Sea</strong> (Level 9, Day or Dawn), while Swordfish is at <strong>Whale Sea</strong> (Level 10, Day or Dawn).']
]);
replaceAll('guides/money-making/index.html', [[
  '<h4 class="font-bold text-blue-800 mb-2">The Rainbow Fish Jackpot 🌈</h4>\n                            <p class="text-sm text-gray-700">Always keep an eye out for "Rainbow" weather events. Run immediately to the Starlight Sea during a rainbow to catch the elusive Rainbow Fish. Highly sought after, they boast an incredibly high base sell value.</p>',
  '<h4 class="font-bold text-blue-800 mb-2">Rainbow Weather Fishing 🌈</h4>\n                            <p class="text-sm text-gray-700">During Rainbow weather, target the highest Fishing Level fish you can reach. Bluefin Tuna appears at Zephyr Sea (Level 9, Day or Dawn), while Swordfish appears at Whale Sea (Level 10, Day or Dawn).</p>'
]]);

let fishing = read('hobbies/fishing/index.html');
const locations = `                            <tr>
                                <td class="px-4 py-2 font-medium">🌅 Zephyr Sea</td>
                                <td class="px-4 py-2 text-cozy-wood">Ocean</td>
                                <td class="px-4 py-2 text-cozy-wood">Bluefin Tuna (Lv9, Rainbow, Day/Dawn)</td>
                            </tr>
                            <tr>
                                <td class="px-4 py-2 font-medium">🌿 Meadow Lake</td>
                                <td class="px-4 py-2 text-cozy-wood">Lake</td>
                                <td class="px-4 py-2 text-cozy-wood">Butterfly Koi (Lv4, Rainy/Rainbow)</td>
                            </tr>`;
fishing = fishing.replace(/                            <tr>\r?\n                                <td class="px-4 py-2 font-medium">✨ Starlight Sea<\/td>[\s\S]*?                            <\/tr>\r?\n                            <tr>\r?\n                                <td class="px-4 py-2 font-medium">🔒 Secret Pond<\/td>[\s\S]*?                            <\/tr>/, locations);
const makeRows = names => names.map((name, index) => {
  const item = byName.get(name);
  return `                            <tr${index === 0 ? ' class="bg-yellow-50"' : ''}>
                                <td class="px-4 py-2 font-medium">${esc(item.name)}</td>
                                <td class="px-4 py-2 text-cozy-wood">${esc(item.location)}</td>
                                <td class="px-4 py-2 text-cozy-wood">${item.level}</td>
                                <td class="px-4 py-2 text-cozy-wood">${esc(item.time)}</td>
                            </tr>`;
}).join('\n');
const rainbowStart = fishing.indexOf('            <!-- RAINBOW WEATHER FISH -->');
const rareStart = fishing.indexOf('            <!-- RARE FISH -->');
const rainbowBodyStart = fishing.indexOf('<tbody class="divide-y divide-cozy-peach/20">', rainbowStart);
const rainbowBodyEnd = fishing.indexOf('                        </tbody>', rainbowBodyStart);
if (rainbowStart < 0 || rareStart < 0 || rainbowBodyStart < 0 || rainbowBodyEnd < 0) throw new Error('Could not locate rainbow table');
fishing = fishing.slice(0, rainbowBodyStart) + '<tbody class="divide-y divide-cozy-peach/20">\n' + makeRows(['Bluefin Tuna', 'Swordfish', 'Smooth Hammerhead', 'Butterfly Koi', 'Golden King Crab']) + '\n' + fishing.slice(rainbowBodyEnd);
const rareBodyStart = fishing.indexOf('<tbody class="divide-y divide-cozy-peach/20">', rareStart);
const rareBodyEnd = fishing.indexOf('                        </tbody>', rareBodyStart);
const rareRows = ['Bluefin Tuna', 'Swordfish', 'Smooth Hammerhead', 'Butterfly Koi', 'Golden King Crab', 'Ocean Sunfish'].map((name, index) => {
  const item = byName.get(name);
  return `                            <tr${index === 0 ? ' class="bg-yellow-50/50"' : ''}>
                                <td class="px-4 py-2 font-medium">${esc(item.name)}</td>
                                <td class="px-4 py-2 text-cozy-wood">${esc(item.location)}</td>
                                <td class="px-4 py-2 text-cozy-wood">Level ${item.level}; ${esc(item.weather)}; ${esc(item.time)}</td>
                            </tr>`;
}).join('\n');
if (rareBodyStart < 0 || rareBodyEnd < 0) throw new Error('Could not locate rare table');
fishing = fishing.slice(0, rareBodyStart) + '<tbody class="divide-y divide-cozy-peach/20">\n' + rareRows + '\n' + fishing.slice(rareBodyEnd);
fishing = fishing.replaceAll('Drop everything and head to Bill\'s boat!', 'Open the fish database to compare every current Rainbow-weather target.')
  .replaceAll('• Essential for Rainbow Fish hunting', '• Useful when targeting fish with specific weather conditions')
  .replaceAll('heartopia rainbow fish, ', '');
write('hobbies/fishing/index.html', fishing);
console.log('Refreshed legacy fish references.');
