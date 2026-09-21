import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const root = path.resolve(import.meta.dirname, '..');
const detector = path.join(root, 'scripts', 'detect-heartopia-event-changes.mjs');
const discovery = path.join(root, 'scripts', 'discover-heartopia-event-sources.mjs');

test('every published event guide has local artwork', () => {
  const events = JSON.parse(fs.readFileSync(path.join(root, 'data', 'heartopia-events.json'), 'utf8')).events;
  const aliases = {
    'my-little-pony': 'my-little-pony-collaboration',
    'winter-frost-season': 'winter-2026',
    'sanrio-characters': 'sanrio-characters-collaboration',
    'frostspore-butterflies': 'winter-2026',
  };
  const missing = events.filter((event) => {
    const slug = aliases[event.slug] || event.localSlug || event.slug;
    return !['webp', 'jpg', 'jpeg', 'png'].some((extension) => fs.existsSync(path.join(root, 'img', 'events', `${slug}.${extension}`)));
  }).map((event) => event.slug);
  assert.deepEqual(missing, []);
});

test('public event image manifest omits blocked source-page fields', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'data', 'heartopia-event-images.json'), 'utf8'));
  for (const [slug, image] of Object.entries(manifest.images || {})) {
    assert.equal(Object.hasOwn(image, 'sourceUrl'), false, `${slug} exposes sourceUrl`);
    assert.equal(Object.hasOwn(image, 'source'), false, `${slug} exposes source`);
    assert.equal(Object.hasOwn(image, 'imageUrl'), false, `${slug} exposes imageUrl`);
  }
});

test('official Steam RSS extracts an internal event candidate and artwork', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'heartopia-steam-event-'));
  const fixture = path.join(temp, 'steam.xml');
  fs.writeFileSync(fixture, `<?xml version="1.0"?><rss><channel><item>
    <title>Flash Update on September 2 (UTC-5)</title>
    <description><![CDATA[<p>A new round of Party Festival will be available from September 19, 06:00 to October 9, 05:59 (Server Time).</p>]]></description>
    <link><![CDATA[https://store.steampowered.com/news/app/4025700/view/123]]></link>
    <pubDate>Wed, 02 Sep 2026 08:00:02 +0000</pubDate>
    <enclosure url="https://clan.fastly.steamstatic.com/images/1/party.jpg" type="image/jpeg" />
  </item></channel></rss>`);
  const result = spawnSync(process.execPath, [discovery, '--parse-steam-fixture', fixture], { cwd: root, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  const parsed = JSON.parse(result.stdout);
  assert.equal(parsed.candidates[0].title, 'Party Festival');
  assert.equal(parsed.candidates[0].slug, 'party-festival-september-2026');
  assert.equal(parsed.candidates[0].endDate, 'October 9, 2026');
  assert.match(parsed.candidates[0].imageUrl, /party\.jpg$/);
  fs.rmSync(temp, { recursive: true, force: true });
});

test('official X mirror extracts Burger Bliss dates and original image', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'heartopia-x-event-'));
  const fixture = path.join(temp, 'tweet.json');
  fs.writeFileSync(fixture, JSON.stringify({ tweet: {
    url: 'https://x.com/MyHeartopia/status/123',
    text: '🍔 "Burger Bliss" Event Coming Soon!\n\nEvent Period\nSeptember 19, 6:00 AM - October 12, 5:59 AM (Server Time)',
    created_at: 'Sat Sep 12 09:00:11 +0000 2026',
    author: { screen_name: 'MyHeartopia' },
    media: { photos: [{ url: 'https://pbs.twimg.com/media/example.jpg?name=orig' }] },
  } }));
  const result = spawnSync(process.execPath, [discovery, '--parse-fx-fixture', fixture], { cwd: root, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  const parsed = JSON.parse(result.stdout);
  assert.equal(parsed.candidates[0].title, 'Burger Bliss');
  assert.equal(parsed.candidates[0].startDate, 'September 19, 2026');
  assert.equal(parsed.candidates[0].imageUrl, 'https://pbs.twimg.com/media/example.jpg?name=orig');
  fs.rmSync(temp, { recursive: true, force: true });
});

test('event source parser accepts the reader markdown fallback', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'heartopia-event-source-'));
  const fixture = path.join(temp, 'events.md');
  fs.writeFileSync(fixture, [
    '[![Image 2: New Collaboration](https://example.com/new.webp) Active Now Collaboration Aug 1 → Aug 20, 2026 ## New Collaboration View Details](http://www.heartodex.com/en/events/new-collaboration)',
    '[![Image 3: Older Event](https://example.com/old.webp) 2026 Past Event ### Older Event Jul 1 – Jul 8](http://www.heartodex.com/en/events/older-event)',
  ].join('\n'));
  const syncScript = path.join(root, 'scripts', 'sync-heartodex-events.mjs');
  const result = spawnSync(process.execPath, [syncScript, '--parse-fixture', fixture], {
    cwd: root,
    encoding: 'utf8',
  });
  assert.equal(result.status, 0, result.stderr);
  const events = JSON.parse(result.stdout);
  assert.equal(events.length, 2);
  assert.equal(events[0].status, 'active');
  assert.equal(events[0].type, 'Collaboration');
  assert.equal(events[1].status, 'archive');
  fs.rmSync(temp, { recursive: true, force: true });
});

test('event detector alerts only for new active or upcoming events', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'heartopia-event-monitor-'));
  const before = path.join(temp, 'before.json');
  const after = path.join(temp, 'after.json');
  fs.writeFileSync(before, JSON.stringify({
    events: [{ slug: 'known', localSlug: 'known', name: 'Known', status: 'upcoming' }],
  }));
  fs.writeFileSync(after, JSON.stringify({
    events: [
      { slug: 'known', localSlug: 'known', name: 'Known', status: 'active' },
      { slug: 'new', localSlug: 'new', name: 'New Event', status: 'upcoming' },
      { slug: 'archive', localSlug: 'archive', name: 'Old Archive', status: 'archive' },
    ],
  }));

  const result = spawnSync(process.execPath, [detector, '--before', before, '--after', after], {
    cwd: root,
    env: { ...process.env, HEARTOPIA_SYNC_DIR: temp },
    encoding: 'utf8',
  });
  assert.equal(result.status, 0, result.stderr);
  const report = JSON.parse(fs.readFileSync(path.join(temp, 'event-alert.json'), 'utf8'));
  assert.deepEqual(report.newEvents.map((event) => event.name), ['New Event']);
  assert.equal(report.changedEvents.length, 2);
  assert.equal(report.changedEvents[0].changes[0].field, 'status');
  assert.equal(report.changedEvents[1].changes[0].field, 'catalog');
  fs.rmSync(temp, { recursive: true, force: true });
});
