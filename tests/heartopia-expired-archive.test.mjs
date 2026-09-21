import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const data = JSON.parse(fs.readFileSync(new URL('../data/heartopia-codes.json', import.meta.url), 'utf8'));
const currentPage = fs.readFileSync(new URL('../codes/index.html', import.meta.url), 'utf8');
const archivePage = fs.readFileSync(new URL('../codes/expired/index.html', import.meta.url), 'utf8');

test('current page stays short and links to the complete archive', () => {
  const section = currentPage.match(/<section id="expired-codes"[\s\S]*?<\/section>/)?.[0] || '';
  assert.ok(section.includes('/codes/expired/'));
  assert.ok((section.match(/data-copy-code=/g) || []).length <= 8);
});

test('archive contains every expired code and no active code cards', () => {
  for (const item of data.expired) assert.ok(archivePage.includes(`data-expired-code="${item.code.toLowerCase()}"`));
  for (const item of data.active) assert.ok(!archivePage.includes(`data-expired-code="${item.code.toLowerCase()}"`));
});
