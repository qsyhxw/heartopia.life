import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const readJson = (file) => JSON.parse(read(file));
const errors = [];
const notes = [];

function check(condition, message) {
  if (!condition) errors.push(message);
}

function extractJsonBetween(source, start, end, label) {
  const startAt = source.indexOf(start);
  const endAt = startAt < 0 ? -1 : source.indexOf(end, startAt + start.length);
  check(startAt >= 0 && endAt >= 0, `${label}: embedded data marker is missing`);
  if (startAt < 0 || endAt < 0) return [];
  try {
    return JSON.parse(source.slice(startAt + start.length, endAt));
  } catch (error) {
    errors.push(`${label}: embedded data is not valid JSON (${error.message})`);
    return [];
  }
}

function localTarget(url) {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(url, 'https://heartopia.life').pathname);
  } catch {
    return null;
  }
  const relative = pathname.replace(/^\/+/, '');
  if (!relative) return path.join(root, 'index.html');
  const direct = path.join(root, relative);
  if (path.extname(relative)) return direct;
  if (fs.existsSync(direct) && fs.statSync(direct).isFile()) return direct;
  return path.join(direct, 'index.html');
}

const pages = [
  ['tools/index.html', '/tools/'],
  ['tools/search/index.html', '/tools/search/'],
  ['tools/my-progress/index.html', '/tools/my-progress/'],
  ['tools/daily-tasks/index.html', '/tools/daily-tasks/'],
  ['tools/recipe-calculator/index.html', '/tools/recipe-calculator/'],
  ['tools/fish-tracker/index.html', '/tools/fish-tracker/'],
  ['tools/crop-planner/index.html', '/tools/crop-planner/'],
  ['tools/friendship-tracker/index.html', '/tools/friendship-tracker/']
];

for (const [file, route] of pages) {
  const html = read(file);
  const markup = html.replace(/<script\b[\s\S]*?<\/script>/gi, '');
  check(html.includes('G-FRJ91G3VRR'), `${route}: GA measurement ID is missing`);
  check(html.includes('https://s.nitropay.com/ads-2368.js'), `${route}: NitroPay global script is missing`);
  check(
    html.includes(`rel="canonical" href="https://heartopia.life${route}"`) ||
      html.includes(`href="https://heartopia.life${route}" rel="canonical"`),
    `${route}: canonical URL is missing or incorrect`
  );
  check((markup.match(/<h1\b/gi) || []).length === 1, `${route}: expected exactly one H1`);

  const ids = [...markup.matchAll(/\bid=["']([^"']+)["']/gi)].map((match) => match[1]);
  const duplicates = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
  check(!duplicates.length, `${route}: duplicate IDs: ${duplicates.join(', ')}`);

  for (const match of html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      JSON.parse(match[1]);
    } catch (error) {
      errors.push(`${route}: invalid JSON-LD (${error.message})`);
    }
  }

  const refs = [...markup.matchAll(/\b(?:href|src)=["'](\/[^"'#?]*)[^"']*["']/gi)].map((match) => match[1]);
  for (const ref of new Set(refs)) {
    const target = localTarget(ref);
    check(!target || fs.existsSync(target), `${route}: missing local target ${ref}`);
  }
}

const fishSource = readJson('data/heartopia-fish.json').fish;
const fishHtml = read('tools/fish-tracker/index.html');
const fishTool = extractJsonBetween(fishHtml, 'window.heartopiaFishData = ', ';</script>', 'Fish Tracker');
check(fishTool.length === fishSource.length, `Fish Tracker: ${fishTool.length} entries, expected ${fishSource.length}`);
check(fishHtml.includes(`id="total-count">${fishSource.length}`), 'Fish Tracker: initial total is stale');
check(
  JSON.stringify(fishTool.map((item) => item.name).sort()) === JSON.stringify(fishSource.map((item) => item.name).sort()),
  'Fish Tracker: names differ from the central fish catalog'
);
check(read('assets/js/fish-tracker.js').includes("heartopia.collection.fish"), 'Fish Tracker: shared progress key is missing');

const recipeSource = readJson('data/heartopia-recipes.json').recipes;
const expectedRecipes = recipeSource
  .filter((recipe) => recipe.ingredients.length && recipe.market.length === 4)
  .map(({ name, ingredients, market }) => ({ name, ingredients, market }));
const recipeTool = extractJsonBetween(
  read('tools/recipe-calculator/index.html'),
  'const recipes=',
  ';const search=',
  'Recipe Calculator'
);
check(recipeTool.length === expectedRecipes.length, `Recipe Calculator: ${recipeTool.length} entries, expected ${expectedRecipes.length}`);
check(JSON.stringify(recipeTool) === JSON.stringify(expectedRecipes), 'Recipe Calculator: embedded recipes differ from central data');

const cropSource = readJson('data/heartopia-crops.json').crops;
const expectedCrops = cropSource.map((crop) => ({
  id: crop.id,
  name: crop.name,
  price: crop.seedPrice,
  time: crop.growthTime,
  minutes: crop.growthMinutes,
  uses: crop.recipeCount
}));
const cropTool = extractJsonBetween(read('tools/crop-planner/index.html'), 'const crops=', ';const crop=', 'Crop Planner');
check(cropTool.length === cropSource.length, `Crop Planner: ${cropTool.length} entries, expected ${cropSource.length}`);
check(JSON.stringify(cropTool) === JSON.stringify(expectedCrops), 'Crop Planner: embedded crops differ from central data');

const npcSource = readJson('data/heartopia-npcs.json').npcs;
const npcPage = read('tools/friendship-tracker/index.html');
const npcScript = read('assets/js/npc-visit-tracker.js');
check(npcSource.length === 19, `NPC Tracker: central catalog currently has ${npcSource.length}, expected 19`);
check(npcScript.includes("fetch('/data/heartopia-npcs.json'"), 'NPC Tracker: central NPC fetch is missing');
check(npcScript.includes("heartopia.collection.npcs"), 'NPC Tracker: shared progress key is missing');
for (const staleName of ['Jake', 'Garrick', 'Nellie', 'Morning (6 AM - 12 PM)']) {
  check(!npcPage.includes(staleName) && !npcScript.includes(staleName), `NPC Tracker: stale content remains (${staleName})`);
}

const searchIndex = readJson('data/heartopia-search-index.json');
check(searchIndex.count === searchIndex.entries.length, 'Universal Search: declared count differs from entry count');

const progressSource = read('assets/js/progress-catalog.js');
const progressStart = progressSource.indexOf('window.heartopiaProgressCatalog = ');
const progressEnd = progressSource.lastIndexOf(';');
let progressCatalog = {};
try {
  progressCatalog = JSON.parse(progressSource.slice(progressStart + 'window.heartopiaProgressCatalog = '.length, progressEnd));
} catch (error) {
  errors.push(`My Progress: embedded data is not valid JSON (${error.message})`);
}
check(Object.keys(progressCatalog).filter((key) => key !== 'generatedAt').length === 13, 'My Progress: expected 13 collection categories');

const achievementSource = readJson('data/heartopia-achievements.json').achievements;
const progressAchievements = progressCatalog.achievements?.items || [];
const progressDashboard = read('assets/js/my-progress-dashboard.js');
const progressAchievementTotal = Number(progressDashboard.match(/id: 'achievements'[\s\S]*?total: (\d+)/)?.[1] || 0);
const hubAchievementTotal = Number(readJson('data/heartopia-hub-totals.json').totals?.achievements || 0);
check(progressAchievements.length === achievementSource.length, `Achievements: My Progress catalog has ${progressAchievements.length}, expected ${achievementSource.length}`);
check(progressAchievementTotal === achievementSource.length, `Achievements: dashboard total is ${progressAchievementTotal}, expected ${achievementSource.length}`);
check(hubAchievementTotal === achievementSource.length, `Achievements: database hub total is ${hubAchievementTotal}, expected ${achievementSource.length}`);
for (const achievement of achievementSource) {
  const image = achievement.image?.startsWith('/') ? path.join(root, achievement.image.slice(1)) : null;
  check(image && fs.existsSync(image), `Achievements: missing local image for ${achievement.name}`);
}

notes.push(`Fish Tracker: ${fishTool.length}/${fishSource.length}`);
notes.push(`Recipe Calculator: ${recipeTool.length}/${recipeSource.length} calculable recipes`);
notes.push(`Crop Planner: ${cropTool.length}/${cropSource.length}`);
notes.push(`NPC Visit Tracker: ${npcSource.length}`);
notes.push(`Universal Search: ${searchIndex.entries.length}`);
notes.push(`My Progress: ${Object.keys(progressCatalog).filter((key) => key !== 'generatedAt').length} categories`);
notes.push(`Achievements: ${achievementSource.length}/${progressAchievements.length} with local images`);

if (errors.length) {
  console.error(`Tools audit failed with ${errors.length} issue(s):`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exitCode = 1;
} else {
  console.log(`Tools audit passed for ${pages.length} pages.`);
  notes.forEach((note) => console.log(`- ${note}`));
}
