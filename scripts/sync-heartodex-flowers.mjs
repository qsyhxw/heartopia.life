import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const sourceUrl = 'https://www.heartodex.com/en/flowers/';
const sourceHost = 'https://www.heartodex.com';
const today = () => new Date().toISOString().slice(0, 10);
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const readJson = (file) => JSON.parse(read(file));
const write = (file, value) => {
  const target = path.join(root, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, value);
};

const pairings = [
  { id: '1-1', parents: [1, 1], label: '1-star + 1-star', outcomes: [1, 2], result: '1 to 2 stars', use: 'Starter bed and first hybrid attempts.' },
  { id: '1-2', parents: [1, 2], label: '1-star + 2-star', outcomes: [1, 2], result: '1 to 2 stars', use: 'Keep a lower-tier hybrid loop active.' },
  { id: '2-2', parents: [2, 2], label: '2-star + 2-star', outcomes: [2, 3], result: '2 to 3 stars', use: 'Work toward a 3-star form.' },
  { id: '2-3', parents: [2, 3], label: '2-star + 3-star', outcomes: [2, 3], result: '2 to 3 stars', use: 'Maintain a 2 to 3-star breeding bed.' },
  { id: '3-3', parents: [3, 3], label: '3-star + 3-star', outcomes: [3, 4], result: '3 to 4 stars', use: 'Work toward a 4-star form.' },
  { id: '3-4', parents: [3, 4], label: '3-star + 4-star', outcomes: [3, 4], result: '3 to 4 stars', use: 'Maintain a 3 to 4-star breeding bed.' },
  { id: '4-4', parents: [4, 4], label: '4-star + 4-star', outcomes: [4, 5], result: '4 to 5 stars', use: 'Your route to a 5-star crystal flower.' }
];

const forms = [
  { id: 'red-flower-1-star', name: 'Red Flower', color: 'Red', stars: 1, asset: 'rojo1', file: 'Red-Flower-1-Star.webp', role: 'Starter color form' },
  { id: 'yellow-flower-1-star', name: 'Yellow Flower', color: 'Yellow', stars: 1, asset: 'amarilla1', file: 'Yellow-Flower-1-Star.webp', role: 'Starter color form' },
  { id: 'white-flower-1-star', name: 'White Flower', color: 'White', stars: 1, asset: 'blanca1', file: 'White-Flower-1-Star.webp', role: 'Starter color form' },
  { id: 'pink-flower-2-star', name: 'Pink Flower', color: 'Pink', stars: 2, asset: 'rosado2', file: 'Pink-Flower-2-Star.webp', role: 'Hybrid color form' },
  { id: 'orange-flower-2-star', name: 'Orange Flower', color: 'Orange', stars: 2, asset: 'naranjo2', file: 'Orange-Flower-2-Star.webp', role: 'Hybrid color form' },
  { id: 'black-flower-3-star', name: 'Black Flower', color: 'Black', stars: 3, asset: 'negro3', file: 'Black-Flower-3-Star.webp', role: 'Hybrid color form' },
  { id: 'peach-flower-3-star', name: 'Peach Flower', color: 'Peach', stars: 3, asset: 'durazno3', file: 'Peach-Flower-3-Star.webp', role: 'Hybrid color form' },
  { id: 'blue-flower-4-star', name: 'Blue Flower', color: 'Blue', stars: 4, asset: 'azul4', file: 'Blue-Flower-4-Star.webp', role: 'High-tier hybrid form' },
  { id: 'green-flower-4-star', name: 'Green Flower', color: 'Green', stars: 4, asset: 'verde4', file: 'Green-Flower-4-Star.webp', role: 'High-tier hybrid form' },
  { id: 'crystal-flower-5-star', name: 'Crystal Flower', color: 'Crystal', stars: 5, asset: 'cristal5', file: 'Crystal-Flower-5-Star.webp', role: 'Maximum documented flower tier' }
];

const tools = [
  { id: 'rainbow-bag', name: 'Rainbow Bag', asset: 'bolsaarcoiris', file: 'Rainbow-Bag.webp', effect: 'Guarantees a successful hybridization check.' },
  { id: 'rainbow-bouquet', name: 'Rainbow Bouquet', asset: 'ramoarcoiris', file: 'Rainbow-Bouquet.webp', effect: 'Can trigger the Rainbow Bag effect when watering ready flowers.' }
];

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function request(url) {
  let error;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(url, { headers: { 'user-agent': 'HeartopiaLifeFlowerSync/1.0 (+https://heartopia.life/)' } });
      if (!response.ok) throw new Error(`Remote request failed with status ${response.status}`);
      return response;
    } catch (caught) {
      error = caught;
      await new Promise((done) => setTimeout(done, attempt * 700));
    }
  }
  throw error;
}

function assetUrl(html, asset) {
  const pattern = new RegExp(`(\\/_astro\\/${escapeRegExp(asset)}\\.[^"'\\s?]+\\.webp)`, 'i');
  const match = html.match(pattern);
  if (!match) throw new Error(`Could not locate ${asset} image in the public flower guide`);
  return `${sourceHost}${match[1]}`;
}

async function download(url, file) {
  const response = await request(url);
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('image')) throw new Error(`Unexpected remote image content type: ${contentType}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.length < 1000) throw new Error('Downloaded flower image is unexpectedly small');
  const target = path.join(root, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  if (!fs.existsSync(target) || !fs.readFileSync(target).equals(buffer)) fs.writeFileSync(target, buffer);
}

const page = await (await request(sourceUrl)).text();
for (const item of [...forms, ...tools]) {
  await download(assetUrl(page, item.asset), `img/flowers/${item.file}`);
}

function breedingSource(stars) {
  if (stars === 1) return 'Starter tier or a 1-star compatible breeding result';
  if (stars === 2) return 'Possible result from a compatible 1-star pairing';
  if (stars === 3) return 'Possible result from a compatible 2-star pairing';
  if (stars === 4) return 'Possible result from a compatible 3-star pairing';
  return 'Possible result from a 4-star + 4-star pairing';
}

function useFor(stars) {
  if (stars === 1) return 'Use as a starting parent in a same-species flower bed.';
  if (stars < 5) return `Use as a compatible parent while working toward a ${stars + 1}-star result.`;
  return '5-star flowers do not provide seeds. Harvest them to reopen a breeding tile.';
}

const flowers = forms.map((form) => ({
  id: form.id,
  name: form.name,
  color: form.color,
  stars: form.stars,
  role: form.role,
  breedingSource: breedingSource(form.stars),
  parentPairs: pairings.filter((pair) => pair.outcomes.includes(form.stars)).map((pair) => pair.label),
  possibleResults: pairings.filter((pair) => pair.outcomes.includes(form.stars)).map((pair) => pair.result),
  conditions: ['Same flower species', 'Mature and ready flowers', 'Daily check after server reset'],
  use: useFor(form.stars),
  image: `/img/flowers/${form.file}`
}));

const data = {
  generatedAt: today(),
  count: flowers.length,
  rules: {
    resetTime: 'After 6:00 AM server time',
    sameSpecies: 'Only flowers of the same type can crossbreed.',
    colorRule: 'Color does not determine whether a seed appears. Star compatibility controls the breeding range.',
    starRule: 'Use equal stars or a one-star difference. A gap of two or more stars cannot crossbreed.',
    watering: 'More people watering ready flowers can improve the chance of success, with up to five helpers.',
    layout: 'A 3 by 3 bed keeps parent pairs readable. A highest-star center flower can reach the eight surrounding flowers.',
    maxTier: '5-star flowers do not provide seeds.'
  },
  pairings,
  flowers,
  tools: tools.map((item) => ({ id: item.id, name: item.name, effect: item.effect, image: `/img/flowers/${item.file}` }))
};

const output = 'data/heartopia-flowers.json';
const prior = fs.existsSync(path.join(root, output)) ? readJson(output) : null;
const comparable = JSON.stringify({ count: data.count, rules: data.rules, pairings: data.pairings, flowers: data.flowers, tools: data.tools });
const previousComparable = prior ? JSON.stringify({ count: prior.count, rules: prior.rules, pairings: prior.pairings, flowers: prior.flowers, tools: prior.tools }) : '';
if (comparable === previousComparable && prior?.generatedAt) data.generatedAt = prior.generatedAt;
write(output, `${JSON.stringify(data, null, 2)}\n`);

console.log(`Synced ${flowers.length} documented flower forms and ${tools.length} flower tools.`);
