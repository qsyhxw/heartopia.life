import { execFile } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const root = process.cwd();
const pagePath = path.join(root, 'database', 'recipes', 'index.html');
const outputPath = path.join(root, 'data', 'recipe-details.json');
const page = fs.readFileSync(pagePath, 'utf8');
const match = page.match(/const recipes=(\[.*?\]);const order=/s);
if (!match) throw new Error('Could not read recipe data from the recipe page.');

const recipes = JSON.parse(match[1]);
const decode = (value) => value
  .replace(/&amp;/g, '&')
  .replace(/&#34;/g, '"')
  .replace(/&#39;/g, "'")
  .replace(/&quot;/g, '"')
  .replace(/\s+/g, ' ')
  .trim();
const slugify = (value) => value
  .toLowerCase()
  .replace(/&/g, ' and ')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/(^-|-$)/g, '');
const text = (value) => decode(value.replace(/<[^>]*>/g, ' '));

function valuesInSection(html, start, endCandidates) {
  const startIndex = html.indexOf(start);
  if (startIndex < 0) return [];
  const endIndexes = endCandidates
    .map((candidate) => html.indexOf(candidate, startIndex + start.length))
    .filter((index) => index >= 0);
  const section = html.slice(startIndex, endIndexes.length ? Math.min(...endIndexes) : startIndex + 30000);
  return [...section.matchAll(/<span class="text-sm text-\[var\(--dark\)\]">\s*\+?([\d,.]+)\s*<\/span>/g)]
    .map((entry) => entry[1].replace(/[,.]/g, ''))
    .map(Number)
    .filter(Number.isFinite);
}

function parse(html, recipe) {
  const ingredientStart = html.indexOf('Required Ingredients </h2>');
  const ingredientSection = ingredientStart >= 0 ? html.slice(ingredientStart, html.indexOf('</main>', ingredientStart)) : '';
  const ingredients = [...ingredientSection.matchAll(/<h4[^>]*>\s*([\s\S]*?)\s*<\/h4>[\s\S]{0,360}?<span[^>]*>\s*x(\d+)\s*<\/span>/g)]
    .map((entry) => ({ name: text(entry[1]), amount: Number(entry[2]) }))
    .filter((ingredient) => ingredient.name && Number.isFinite(ingredient.amount));
  const energy = valuesInSection(html, 'Energy &amp; Buffs </h2>', ['> Market </h2>', '> Event Tokens </h2>', 'Required Ingredients </h2>']);
  const market = valuesInSection(html, '> Market </h2>', ['> Event Tokens </h2>', 'Required Ingredients </h2>']);
  const tokens = valuesInSection(html, '> Event Tokens </h2>', ['Required Ingredients </h2>']);
  return {
    name: recipe.name,
    slug: slugify(recipe.name),
    ingredients,
    energy: energy.slice(0, 5),
    market: market.slice(0, 5),
    eventTokens: tokens.slice(0, 5)
  };
}

async function fetchDetails(recipe) {
  const url = `https://www.heartodex.com/en/recipes/${slugify(recipe.name)}/`;
  try {
    const { stdout } = await execFileAsync('curl.exe', ['-L', '--max-time', '30', '-sS', '-A', 'Mozilla/5.0', url], { maxBuffer: 4 * 1024 * 1024 });
    if (!stdout.includes('<html')) return { name: recipe.name, slug: slugify(recipe.name), ingredients: [], energy: [], market: [], eventTokens: [], error: 'No page data returned' };
    return parse(stdout, recipe);
  } catch (error) {
    return { name: recipe.name, slug: slugify(recipe.name), ingredients: [], energy: [], market: [], eventTokens: [], error: error.message };
  }
}

const concurrency = 3;
const result = [];
for (let index = 0; index < recipes.length; index += concurrency) {
  const batch = await Promise.all(recipes.slice(index, index + concurrency).map(fetchDetails));
  result.push(...batch);
  console.log(`Fetched ${Math.min(index + concurrency, recipes.length)} / ${recipes.length}`);
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(result, null, 2)}\n`);
const withIngredients = result.filter((recipe) => recipe.ingredients.length).length;
const failures = result.filter((recipe) => recipe.error).length;
console.log(`Saved ${result.length} recipes; ${withIngredients} with ingredient lists; ${failures} fetch failures.`);
