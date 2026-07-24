import test from 'node:test';
import assert from 'node:assert/strict';
import { UnmappedRouteTermError, hubConfirmsRoute, parseWhaleEntries, parseWhaleGuide, resolveWhaleColor, structureRouteFact } from '../scripts/sync-call-of-whales-routes.mjs';

const labels = ['浅蓝色', '绿色', '橙色', '黄色', '紫色', '黄绿色', '灰色', '青色', '粉色', '天蓝色', '蓝紫色', '深蓝色', '银色', '金色', '棕色', '米白色'];
const blocks = labels.map((label) => `<p>${label}喷水小鲸鱼：珊瑚道出口右侧红色珊瑚上</p><p>家具泡泡：小鲸鱼左后方石洞入口</p>`);
const completeHtml = `<!doctype html><html><body>${blocks.reverse().join('')}</body></html>`;

test('parses a contiguous Day 1-16 sequence from newest-first guide markup', () => {
  const entries = parseWhaleEntries(completeHtml);
  assert.equal(entries.length, 16);
  assert.deepEqual(entries.map((entry) => entry.day), Array(16).fill(undefined));
  const parsed = parseWhaleGuide(completeHtml, []);
  assert.deepEqual(parsed.map((entry) => entry.day), Array.from({ length: 16 }, (_, index) => index + 1));
  assert.equal(parsed[10].color, 'Blue-Purple');
  assert.equal(parsed[15].color, 'Ivory');
});

test('requires exact location and reward bubble facts from the second guide', () => {
  const candidate = parseWhaleEntries('<p>蓝紫喷水小鲸鱼：鲸落 封住的洞口 蓝紫珊瑚上</p><p>家具泡泡：鲸落 头骨右上方</p>')[0];
  assert.equal(hubConfirmsRoute(candidate, '<p>蓝紫喷水小鲸鱼：鲸落 封住的洞口 蓝紫珊瑚上</p><p>家具泡泡：鲸落 头骨右上方</p>'), true);
  assert.equal(hubConfirmsRoute(candidate, '<p>蓝紫喷水小鲸鱼：鲸落 封住的洞口 蓝紫珊瑚上</p><p>家具泡泡：鲸落 头骨左侧</p>'), false);
});

test('rejects unrecognized narrative instead of publishing it as a route fact', () => {
  assert.throws(() => structureRouteFact('请跟着攻略作者的路线走到隐藏位置'), /unrecognized|unmapped|missing/i);
});

test('derives unseen compound colors without a hard-coded day map', () => {
  assert.deepEqual(resolveWhaleColor('红橙色'), { color: 'Red-Orange', unknownTokens: [] });
  assert.deepEqual(resolveWhaleColor('深蓝色'), { color: 'Deep Blue', unknownTokens: [] });
  assert.deepEqual(resolveWhaleColor('梦幻蓝色'), { color: '', unknownTokens: ['梦幻蓝'] });
});

test('retains unknown whale candidates so automation cannot silently skip them', () => {
  const candidate = parseWhaleEntries('<p>梦幻蓝喷水小鲸鱼：珊瑚道出口右侧红色珊瑚上</p><p>家具泡泡：小鲸鱼左后方石洞入口</p>')[0];
  assert.ok(candidate);
  assert.equal(candidate.color, '');
  assert.deepEqual(candidate.unknownColorTokens, ['梦幻蓝']);
});

test('does not treat two unparseable guide facts as an exact match', () => {
  const candidate = parseWhaleEntries('<p>红橙喷水小鲸鱼：未知海域神秘地点</p><p>家具泡泡：另一处未知地点</p>')[0];
  assert.equal(hubConfirmsRoute(candidate, '<p>红橙喷水小鲸鱼：未知海域神秘地点</p><p>家具泡泡：另一处未知地点</p>'), false);
});

test('reports unmapped route terms for private review', () => {
  assert.throws(
    () => structureRouteFact('鲸落神秘拱门右侧'),
    (error) => error instanceof UnmappedRouteTermError && error.terms.includes('神秘拱门'),
  );
});

test('structures the verified Day 12 seafloor coral and stone gate route', () => {
  assert.equal(
    structureRouteFact('鲸落 右侧地面蓝紫珊瑚里'),
    'Area: Whalefall; landmark: blue-purple coral on the seafloor; position: right side.',
  );
  assert.equal(
    structureRouteFact('鲸落 左下方 石门里'),
    'Area: Whalefall; landmark: stone gate; position: lower-left side.',
  );
});

test('structures the verified Day 13 whale skeleton route', () => {
  assert.equal(
    structureRouteFact('鲸落 遗骸左眼眶'),
    'Area: Whalefall; landmark: left eye socket of the whale skeleton.',
  );
  assert.equal(
    structureRouteFact('鲸落 遗骸下'),
    'Area: Whalefall; landmark: beneath the whale skeleton.',
  );
});


test('structures the verified Day 14 Jellyfish Cave route', () => {
  const candidate = parseWhaleEntries('<p>黑色喷水小鲸鱼：从鲸落 进 水母洞穴的 入口处 珊瑚上</p><p>家具泡泡：水母洞穴里</p>')[0];
  const hub = '<p>黑色喷水小鲸鱼：从鲸落 进 水母洞穴的 入口处 珊瑚上</p><p>家具泡泡：水母洞穴里</p>';

  assert.equal(candidate.color, 'Black');
  assert.equal(hubConfirmsRoute(candidate, hub), true);
  assert.equal(
    structureRouteFact(candidate.locationZh),
    'Area: Whalefall; landmark: coral at the entrance to Jellyfish Cave.',
  );
  assert.equal(
    structureRouteFact(candidate.bubbleZh),
    'Landmark: Jellyfish Cave interior.',
  );
});
