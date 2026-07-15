import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root = path.resolve(import.meta.dirname, '..');
const fromRoot = (file) => path.join(root, file);
const read = (file) => fs.readFileSync(fromRoot(file), 'utf8');
const readJson = (file) => JSON.parse(read(file));
const titleCase = (value) => String(value || '').replace(/\b\w/g, (letter) => letter.toUpperCase());
const compact = (value) => String(value || '').replace(/\s+/g, ' ').trim();
const collectionId = (value) => compact(value)
    .replace(/[★☆]/g, '')
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '')
    .replace(/\([^)]*\)/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

function catalogEntry(name, image, detail, id) {
    return {
        id: id || collectionId(name),
        name: compact(name),
        image: image || '',
        detail: compact(detail)
    };
}

function readBirds() {
    const html = read('database/birds/index.html');
    const match = html.match(/const birdData=(\[[\s\S]*?\])\s*;const birdLinks/);
    if (!match) throw new Error('Could not read bird data from database/birds/index.html');
    return JSON.parse(match[1]);
}

function readMapLocations() {
    const source = read('assets/js/map-location-finder.js');
    const match = source.match(/const locations = (\[[\s\S]*?\]);\s*\n\s*const typeLabels/);
    if (!match) throw new Error('Could not read map locations from map-location-finder.js');
    return vm.runInNewContext(`(${match[1]})`);
}

const fishSource = readJson('data/heartopia-fish.json');
const insectsSource = readJson('data/heartopia-insects.json');
const wildlifeSource = readJson('data/heartopia-wildlife.json');
const cropsSource = readJson('data/heartopia-crops.json');
const flowersSource = readJson('data/heartopia-flowers.json');
const recipesSource = readJson('data/heartopia-recipes.json');
const achievementsSource = readJson('data/heartopia-achievements.json');
const collectiblesSource = readJson('data/heartopia-collectibles.json');
const itemsSource = readJson('data/heartopia-items.json');
const ingredientsSource = readJson('data/heartopia-ingredients.json');
const npcsSource = readJson('data/heartopia-npcs.json');
const birds = readBirds();
const mapLocations = readMapLocations();

const dates = [
    fishSource.generatedAt,
    insectsSource.generatedAt,
    wildlifeSource.generatedAt,
    cropsSource.generatedAt,
    flowersSource.generatedAt,
    recipesSource.generatedAt,
    achievementsSource.generatedAt
].filter((value) => /^\d{4}-\d{2}-\d{2}$/.test(value)).sort();

const catalog = {
    generatedAt: dates.at(-1) || '',
    fish: {
        items: fishSource.fish.map((fish) => catalogEntry(
            fish.name,
            fish.image,
            `${fish.location || 'Location not listed'}${fish.level ? ` · Lv. ${fish.level}` : ''}${fish.shadow ? ` · ${fish.shadow} shadow` : ''}`
        ))
    },
    insects: {
        items: insectsSource.insects.map((insect) => catalogEntry(
            insect.name,
            insect.image,
            `${insect.location || 'Location not listed'}${insect.level ? ` · Lv. ${insect.level}` : ''}${insect.weather ? ` · ${insect.weather}` : ''}`
        ))
    },
    birds: {
        items: birds.map((bird) => {
            const name = titleCase(bird.name);
            return catalogEntry(
                name,
                bird.img ? `/img/birds/${bird.img}` : '',
                `${bird.location || 'Location not listed'}${bird.level ? ` · Lv. ${bird.level}` : ''}${bird.weather ? ` · ${bird.weather}` : ''}`,
                collectionId(bird.name)
            );
        })
    },
    wildlife: {
        items: wildlifeSource.wildlife.map((animal) => catalogEntry(
            animal.name,
            animal.image,
            `${animal.location || 'Location not listed'}${animal.weather ? ` · ${animal.weather}` : ''}`
        ))
    },
    crops: {
        items: cropsSource.crops.map((crop) => catalogEntry(
            crop.name,
            crop.image,
            `${crop.growthTime || 'Growth time not listed'}${Number.isFinite(crop.seedPrice) ? ` · ${crop.seedPrice} G seed` : ''}`
        ))
    },
    flowers: {
        items: flowersSource.flowers.map((flower) => catalogEntry(
            `${flower.name} ${flower.stars}-Star`,
            flower.image,
            `${flower.color} · ${flower.role || 'Flower form'}`,
            flower.id
        ))
    },
    recipes: {
        items: recipesSource.recipes.map((recipe) => catalogEntry(
            recipe.name,
            recipe.image,
            `Lv. ${recipe.level || 0}${recipe.category ? ` · ${recipe.category}` : ''}${recipe.market?.length ? ` · up to ${recipe.market.at(-1)} G` : ''}`,
            recipe.name
        ))
    },
    achievements: {
        items: achievementsSource.achievements.map((achievement) => catalogEntry(
            achievement.name,
            achievement.image,
            `${achievement.group || 'Achievement'}${achievement.reward ? ` · ${achievement.reward}` : ''}`,
            achievement.name
        ))
    },
    collectibles: {
        items: collectiblesSource.collectibles.map((item) => catalogEntry(
            item.name,
            item.image,
            `${item.location || 'Location not listed'}${Number.isFinite(item.sellValue) ? ` · ${item.sellValue} G` : ''}`,
            item.name
        ))
    },
    items: {
        items: itemsSource.items.map((item) => catalogEntry(
            item.name,
            item.image,
            `${item.category || 'Item'}${item.soldBy ? ` · ${item.soldBy}` : ''}`,
            item.name
        ))
    },
    ingredients: {
        items: ingredientsSource.ingredients.map((ingredient) => catalogEntry(
            ingredient.name,
            ingredient.image,
            `${ingredient.category || 'Ingredient'}${Number.isFinite(ingredient.buyPrice) ? ` · ${ingredient.buyPrice} G` : ''}`,
            ingredient.name
        ))
    },
    npcs: {
        items: npcsSource.npcs.map((npc) => catalogEntry(
            npc.name,
            npc.image,
            `${npc.location || 'Location not listed'}${npc.role ? ` · ${npc.role}` : ''}`,
            npc.name
        ))
    },
    map: {
        items: mapLocations.map((location) => catalogEntry(
            location.name,
            '',
            `${location.area || 'Map location'} · ${location.type || 'location'}`,
            String(location.name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
        ))
    }
};

const output = `/* Generated by scripts/build-progress-catalog.mjs. */\nwindow.heartopiaProgressCatalog = ${JSON.stringify(catalog, null, 2)};\n`;
const destination = fromRoot('assets/js/progress-catalog.js');
if (!fs.existsSync(destination) || fs.readFileSync(destination, 'utf8') !== output) {
    fs.writeFileSync(destination, output);
    console.log(`Built progress catalog with ${Object.values(catalog).reduce((sum, group) => sum + (group.items?.length || 0), 0)} entries.`);
} else {
    console.log('Progress catalog is already current.');
}
