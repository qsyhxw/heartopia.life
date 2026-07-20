import fs from 'node:fs';
import path from 'node:path';
import { assertRemoteFields, BLOCKED_REMOTE_FIELDS, SYNC_FIELD_POLICY } from './sync-field-policy.mjs';

const root = path.resolve(import.meta.dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const readJson = (file) => JSON.parse(read(file));

const eventData = readJson('data/heartopia-events.json');
for (const event of eventData.events || []) assertRemoteFields('events', event);
const whaleRouteData = readJson('data/heartopia-call-of-whales-routes.json');
for (const route of whaleRouteData.routes || []) assertRemoteFields('eventRoutes', route);

const activeAutoSyncScripts = [
  'scripts/monitor-heartodex-collections.mjs',
  'scripts/prepare-heartodex-fish-bird-sync.mjs',
  'scripts/apply-heartodex-fish-bird-sync.mjs',
  'scripts/sync-insect-database.mjs',
  'scripts/sync-heartodex-wildlife.mjs',
  'scripts/sync-heartodex-crops.mjs',
  'scripts/sync-heartodex-flowers.mjs',
  'scripts/sync-heartodex-recipes.mjs',
  'scripts/sync-heartodex-achievements.mjs',
  'scripts/sync-heartodex-events.mjs',
  'scripts/sync-call-of-whales-routes.mjs',
];

const retiredMonitorArtifacts = [
  'data/monitor/heartodex-collections.json',
  'data/monitor/heartodex-sync-readiness.json',
  'data/monitor/heartodex-events.json',
];
for (const file of retiredMonitorArtifacts) {
  if (fs.existsSync(path.join(root, file))) throw new Error(`Public monitor artifact must not exist: ${file}`);
}
if (read('.github/workflows/monitor-heartodex-collections.yml').includes('data/monitor/')) {
  throw new Error('Collection workflow still stages public monitor artifacts.');
}

const blockedPublicFields = new Set(['source', 'sourceUrl', 'imageUrl']);
function auditPublicValue(value, location) {
  if (Array.isArray(value)) return value.forEach((item, index) => auditPublicValue(item, `${location}[${index}]`));
  if (!value || typeof value !== 'object') return;
  for (const [field, nested] of Object.entries(value)) {
    if (blockedPublicFields.has(field)) throw new Error(`Public data contains ${field}: ${location}.${field}`);
    auditPublicValue(nested, `${location}.${field}`);
  }
}
for (const name of fs.readdirSync(path.join(root, 'data')).filter((name) => /^heartopia-.*\.json$/.test(name))) {
  auditPublicValue(readJson(`data/${name}`), `data/${name}`);
}

const retiredAchievementArtifacts = [
  'data/achievement-details.json',
  'scripts/sync-achievement-details.mjs',
];
for (const file of retiredAchievementArtifacts) {
  if (fs.existsSync(path.join(root, file))) {
    throw new Error(`Retired raw Objective artifact must not exist: ${file}`);
  }
}
const extractionPatterns = [...BLOCKED_REMOTE_FIELDS].map((field) => ({
  field,
  pattern: new RegExp(`(?:detail|section|between)\\s*\\([^\\n]{0,180}["']${field}["']`, 'i'),
}));

for (const file of activeAutoSyncScripts) {
  const source = read(file);
  for (const { field, pattern } of extractionPatterns) {
    if (pattern.test(source)) throw new Error(`${file} extracts blocked remote narrative field: ${field}`);
  }
}

const achievementSync = read('scripts/sync-heartodex-achievements.mjs');
if (!achievementSync.includes('const objective = structureAchievementObjective(remoteObjective(html), item.slug)')) {
  throw new Error('Achievement objectives do not pass through the structured fact parser.');
}
if (/objective\s*:\s*remoteObjective|rawObjective\s*[,}]/.test(achievementSync)) {
  throw new Error('Raw achievement Objective text can be persisted.');
}

console.log(JSON.stringify({
  ok: true,
  policy: SYNC_FIELD_POLICY,
  auditedEventRecords: (eventData.events || []).length,
  auditedWhaleRoutes: (whaleRouteData.routes || []).length,
  auditedScripts: activeAutoSyncScripts,
}, null, 2));
