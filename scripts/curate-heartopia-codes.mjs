import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const dataPath = path.join(root, 'data', 'heartopia-codes.json');
const data = JSON.parse(await fs.readFile(dataPath, 'utf8'));
const checked = '2026-09-21';
const reward = 'Wishing Star x3, Dye x2, Flawless Fluorite x1';
const expires = 'Sep 30, 2026 at 10:59 (UTC-5)';
const primarySource = 'https://w.twstalker.com/MyHeartopia';
const currentReference = 'https://hatopedia.com/';

const current = [
  ['q3n7a2r9k8m5', 'https://x.com/myheartopia/status/2099347412301037747'],
  ['r8a4k6p5q3m1', 'https://x.com/myheartopia/status/2096810694670778556'],
  ['n6q2m9k4a7r3', 'https://x.com/myheartopia/status/2094273980760723811'],
  ['k5p1r8a2n6q7', primarySource],
  ['a7m4q9r3k6n2', 'https://www.heartodex.com/en/codes/'],
  ['p2k8n5r7q1a6', 'https://heartopia-plus.com/giftcode/'],
  ['m9a3q7k2r5n4', 'https://heartopia-plus.com/giftcode/']
].map(([code, source], index) => ({
  code,
  reward,
  expires,
  expiresAt: '2026-09-30T10:59:00-05:00',
  status: index < 3 ? 'new' : 'active',
  firstSeen: index < 3 ? checked : undefined,
  lastSeen: checked,
  verification: index < 4 ? 'Official announcement' : 'Cross-checked current list',
  sources: [...new Set([source, currentReference])],
  note: 'Announcement/current-list cross-check; not independently redeemed by Heartopia.Life.'
}));

const currentKeys = new Set(current.map((item) => item.code.toLowerCase()));
const expiredByKey = new Map((data.expired || []).map((item) => [String(item.code).toLowerCase(), item]));
for (const item of data.active || []) {
  const key = String(item.code).toLowerCase();
  if (currentKeys.has(key)) continue;
  expiredByKey.set(key, {
    ...item,
    status: undefined,
    note: 'Not confirmed current in the September 21 review; do not treat as active.',
    lastSeen: checked
  });
}

data.lastChecked = checked;
data.sources = [
  'https://x.com/myheartopia/status/2099347412301037747',
  'https://x.com/myheartopia/status/2096810694670778556',
  'https://x.com/myheartopia/status/2094273980760723811',
  primarySource,
  'https://www.heartodex.com/en/codes/',
  'https://heartopia-plus.com/giftcode/',
  currentReference
];
data.active = current.map((item) => Object.fromEntries(Object.entries(item).filter(([, value]) => value !== undefined)));
data.expired = [...expiredByKey.values()];
data.pending = (data.pending || []).filter((item) => !currentKeys.has(String(item.code).toLowerCase()));

await fs.writeFile(dataPath, `${JSON.stringify(data, null, 2)}\n`);
console.log(`Curated ${data.active.length} current codes; archived ${data.expired.length}; retained ${data.pending.length} pending.`);
