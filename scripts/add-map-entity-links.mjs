import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const databaseRoots = [
    'database/fish',
    'database/birds',
    'database/wildlife',
    'database/materials'
];
const scriptTag = '<script src="/assets/js/map-entity-links.js?v=20260715b"></script>';
const scriptPattern = /<script\s+src="\/assets\/js\/map-entity-links\.js(?:\?[^"\s>]*)?"\s*><\/script>/i;

function walkForIndexFiles(directory) {
    const absolute = path.join(root, directory);
    if (!fs.existsSync(absolute)) return [];
    const files = [];
    for (const entry of fs.readdirSync(absolute, { withFileTypes: true })) {
        const relative = path.join(directory, entry.name);
        if (entry.isDirectory()) {
            files.push(...walkForIndexFiles(relative));
        } else if (entry.isFile() && entry.name === 'index.html') {
            files.push(relative);
        }
    }
    return files;
}

const targets = [...new Set(databaseRoots.flatMap(walkForIndexFiles))].sort();
let updated = 0;

for (const relative of targets) {
    const target = path.join(root, relative);
    const html = fs.readFileSync(target, 'utf8');
    if (scriptPattern.test(html)) {
        const next = html.replace(scriptPattern, scriptTag);
        if (next !== html) {
            fs.writeFileSync(target, next);
            updated += 1;
        }
        continue;
    }
    if (!/<\/body\s*>/i.test(html)) {
        console.warn(`Skipped ${relative}: no closing body tag.`);
        continue;
    }
    const next = html.replace(/<\/body\s*>/i, `    ${scriptTag}\n</body>`);
    fs.writeFileSync(target, next);
    updated += 1;
}

console.log(`Map entity links attached to ${updated}/${targets.length} database pages.`);
