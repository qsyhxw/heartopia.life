import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const data = JSON.parse(fs.readFileSync(path.join(root, 'data', 'heartopia-call-of-whales-routes.json'), 'utf8'));
const pages = [
  ['ja', path.join(root, 'ja', 'events', 'call-of-whales', 'index.html')],
  ['zh-Hant', path.join(root, 'zh-tw', 'events', 'call-of-whales', 'index.html')],
];

for (const [locale, file] of pages) {
  test(locale + ' Call of Whales page matches the shared route data', () => {
    const html = fs.readFileSync(file, 'utf8');
    const section = html.match(/<section id="whale-locations"[\s\S]*?<\/section>/)?.[0] || '';
    assert.ok(section);
    for (const route of data.routes) assert.match(section, new RegExp('id="' + route.id + '"'));
    assert.equal((section.match(/data-whale-check=/g) || []).length, data.routes.length);
    const schemaMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    assert.ok(schemaMatch);
    const graph = JSON.parse(schemaMatch[1])['@graph'];
    const page = graph.find((item) => item['@type'] === 'WebPage');
    const list = graph.find((item) => item['@type'] === 'ItemList');
    assert.equal(page.dateModified, data.updatedAt);
    assert.equal(list.numberOfItems, data.routes.length);
    assert.equal(list.itemListElement.length, data.routes.length);
  });
}