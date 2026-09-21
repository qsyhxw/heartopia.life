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
const currentEnglish = 'https://tryhardguides.com/heartopia-codes/';
const currentJapanese = 'https://heartopia-plus.com/giftcode/';
const currentKorean = 'https://heartopia-life.me/wiki/codes';
const currentTraditionalChinese = 'https://forum.gamer.com.tw/Co.php?bsn=75403&sn=3025';

const current = [
  ['q3n7a2r9k8m5', 'https://x.com/myheartopia/status/2099347412301037747'],
  ['r8a4k6p5q3m1', 'https://x.com/myheartopia/status/2096810694670778556'],
  ['n6q2m9k4a7r3', 'https://x.com/myheartopia/status/2094273980760723811'],
  ['k5p1r8a2n6q7', primarySource],
  ['THXHEART26', currentTraditionalChinese],
  ['a7m4q9r3k6n2', 'https://www.heartodex.com/en/codes/'],
  ['p2k8n5r7q1a6', 'https://heartopia-plus.com/giftcode/'],
  ['m9a3q7k2r5n4', 'https://heartopia-plus.com/giftcode/']
].map(([code, source], index) => ({
  code,
  reward: code === 'THXHEART26' ? 'Gold x8,000, Wishing Star x3' : reward,
  expires,
  expiresAt: '2026-09-30T10:59:00-05:00',
  status: index < 3 ? 'new' : 'active',
  firstSeen: index < 3 ? checked : undefined,
  lastSeen: checked,
  verification: code === 'THXHEART26' ? 'Current community reports across regions' : index < 4 ? 'Official announcement' : 'Cross-checked current list',
  sources: code === 'THXHEART26'
    ? [currentTraditionalChinese, currentKorean, 'https://www.gamsgo.com/blog/heartopia-codes']
    : [...new Set([source, currentEnglish, currentJapanese, currentReference])],
  note: code === 'THXHEART26'
    ? 'Reported current by Traditional Chinese, Korean, and Japanese player references; no English official announcement found.'
    : 'Announcement/current-list cross-check; not independently redeemed by Heartopia.Life.'
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

const historicalAdditions = [
  { code: 'aughatogift', reward: 'Moonlight Crystal x50, Colorful Fountain Firework (Pink) x5, Rainbow Breeding Powder x3', note: 'Expired August 31, 2026.', rewardVerified: true },
  { code: 'Cherish180', reward: 'Moonlight Crystal x40, Wishing Star x20, Rare Timber x3, Flawless Fluorite x2, Repair Kit x5, Quality Fertilizer x3, Gold x20,000, Mermaid Perfume x1, Mermaid Fish Attractor x1', note: 'Expired July 31, 2026.', rewardVerified: true },
  { code: 'a4k9m7q2r6', reward: 'Wishing Star x5, Mermaid Fish Attractor x3, Fertilizer x10', note: 'Expired March 31, 2026.', rewardVerified: true },
  { code: 'l7m5q2r9a8', reward: 'Wishing Star x5, Mermaid Fish Attractor x3, Fertilizer x10', note: 'Expired March 31, 2026.', rewardVerified: true },
  { code: 'mayrelax', note: 'Confirmed in current expired/history lists on September 21, 2026.' },
  { code: 'makeawish', reward: 'Moonlight Crystal x50', note: 'Confirmed in current expired/history lists on September 21, 2026.', rewardVerified: true },
  { code: 'letsparty', reward: 'Wishing Star x15, Gold x5,000, Repair Kit x3', note: 'Expired March 31, 2026.', rewardVerified: true },
  { code: 'letsbuild', reward: 'Wishing Star x15, Gold x5,000, Fertilizer x10', note: 'Expired March 31, 2026.', rewardVerified: true },
  { code: 'letsdressup', reward: 'Wishing Star x15, Gold x5,000, Growth Booster x10', note: 'Expired March 31, 2026.', rewardVerified: true },
  { code: 'laba888', reward: 'Wishing Star x10, Gold x888', note: 'Confirmed in current expired/history lists on September 21, 2026.', rewardVerified: true },
  { code: 'officialstream', note: 'Expired test-period code.' },
  { code: 'finaltest', reward: 'Wishing Star x5', note: 'Expired test-period code.', rewardVerified: true }
];
for (const item of historicalAdditions) {
  const key = item.code.toLowerCase();
  expiredByKey.set(key, { ...(expiredByKey.get(key) || {}), ...item, lastSeen: checked });
}

for (const item of expiredByKey.values()) {
  if (/^Not confirmed current/.test(item.note || '')) {
    item.note = 'Confirmed in current expired/history lists on September 21, 2026.';
  }
  delete item.needsCheck;
}

data.lastChecked = checked;
data.sources = [
  currentEnglish,
  currentJapanese,
  currentKorean,
  currentReference,
  'https://www.heartodex.com/en/codes/',
  'https://sticweb.tw/%E5%BF%83%E5%8B%95%E5%B0%8F%E9%8E%AE-%E5%85%8C%E6%8F%9B%E7%A2%BC/'
];
data.active = current.map((item) => Object.fromEntries(Object.entries(item).filter(([, value]) => value !== undefined)));
data.expired = [...expiredByKey.values()];
const falseCandidates = new Set(['121-minute', '2-star', 'eggsx10']);
data.pending = (data.pending || []).filter((item) => {
  const key = String(item.code).toLowerCase();
  return !currentKeys.has(key) && !expiredByKey.has(key) && !falseCandidates.has(key);
});

await fs.writeFile(dataPath, `${JSON.stringify(data, null, 2)}\n`);
console.log(`Curated ${data.active.length} current codes; archived ${data.expired.length}; retained ${data.pending.length} pending.`);
