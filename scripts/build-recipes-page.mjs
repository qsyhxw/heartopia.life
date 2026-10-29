// Refresh event availability without replacing the current, incrementally synced page.
import fs from 'node:fs';
const file='database/recipes/index.html';
const html=fs.readFileSync(file,'utf8');
if(!html.includes('const recipes=')) throw new Error('Missing recipe data');
const updated=html.replace(/("category":"Call of Whales","availability":)"Active Event"/g,'$1"Finished Event"');
fs.writeFileSync(file,updated);
console.log('Recipe event availability refreshed; existing content and integrations preserved.');
