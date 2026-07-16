import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const page = fs.readFileSync(path.join(root, 'database', 'birds', 'index.html'), 'utf8');
const match = page.match(/const birdData=(\[[\s\S]*?\])\s*;const birdLinks/);
if (!match) throw new Error('Could not read birdData from database/birds/index.html');

const entries = JSON.parse(match[1]);
const target = path.join(root, 'data', 'heartopia-birds.json');
const prior = fs.existsSync(target) ? JSON.parse(fs.readFileSync(target, 'utf8')) : null;
const generatedAt = prior && JSON.stringify(prior.birds) === JSON.stringify(entries)
  ? prior.generatedAt
  : new Date().toISOString().slice(0, 10);

fs.writeFileSync(target, `${JSON.stringify({ generatedAt, count: entries.length, birds: entries }, null, 2)}\n`);
console.log(`Built local bird data with ${entries.length} entries.`);
