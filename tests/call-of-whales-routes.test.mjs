import test from 'node:test';
import assert from 'node:assert/strict';
import { hubConfirmsRoute, parseWhaleEntries, parseWhaleGuide, structureRouteFact } from '../scripts/sync-call-of-whales-routes.mjs';

const labels = ['浅蓝色', '绿色', '橙色', '黄色', '紫色', '黄绿色', '灰色', '青色', '粉色', '天蓝色', '红色', '深蓝色', '银色', '金色', '棕色', '米白色'];
const blocks = labels.map((label) => `<p>${label}喷水小鲸鱼：珊瑚道出口右侧红色珊瑚上</p><p>家具泡泡：小鲸鱼左后方石洞入口</p>`);
const completeHtml = `<!doctype html><html><body>${blocks.reverse().join('')}</body></html>`;

test('parses a contiguous Day 1-16 sequence from newest-first guide markup', () => {
  const entries = parseWhaleEntries(completeHtml);
  assert.equal(entries.length, 16);
  assert.deepEqual(entries.map((entry) => entry.day), Array(16).fill(undefined));
  const parsed = parseWhaleGuide(completeHtml, []);
  assert.deepEqual(parsed.map((entry) => entry.day), Array.from({ length: 16 }, (_, index) => index + 1));
  assert.equal(parsed[10].color, 'Red');
  assert.equal(parsed[15].color, 'Ivory');
});

test('requires exact location and reward bubble facts from the second guide', () => {
  const candidate = parseWhaleEntries('<p>红色喷水小鲸鱼：珊瑚道出口右侧红色珊瑚上</p><p>家具泡泡：小鲸鱼左后方石洞入口</p>')[0];
  assert.equal(hubConfirmsRoute(candidate, '<p>红色喷水小鲸鱼：珊瑚道出口右侧红色珊瑚上</p><p>家具泡泡：小鲸鱼左后方石洞入口</p>'), true);
  assert.equal(hubConfirmsRoute(candidate, '<p>红色喷水小鲸鱼：珊瑚道出口右侧红色珊瑚上</p><p>家具泡泡：小鲸鱼右后方石洞入口</p>'), false);
});

test('rejects unrecognized narrative instead of publishing it as a route fact', () => {
  assert.throws(() => structureRouteFact('请跟着攻略作者的路线走到隐藏位置'), /unrecognized|missing/i);
});
