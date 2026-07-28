import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const args = process.argv.slice(2);
const option = (name, fallback = '') => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : fallback;
};
const beforeFile = path.resolve(option('--before', path.join(root, 'data', 'heartopia-events.json')));
const afterFile = path.resolve(option('--after', path.join(root, 'data', 'heartopia-events.json')));
const outputDir = process.env.HEARTOPIA_SYNC_DIR || path.join(root, '.tmp-sync');
const reportFile = path.join(outputDir, 'event-alert.json');
const read = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const clean = (value) => String(value || '').trim();
const publicRecord = (event) => ({
  name: clean(event.name),
  status: clean(event.status),
  type: clean(event.type),
  startDate: clean(event.startDate),
  endDate: clean(event.endDate),
  dateLabel: clean(event.dateLabel),
  siteUrl: `https://heartopia.life/events/${clean(event.localSlug || event.slug)}/`,
});

const before = fs.existsSync(beforeFile) ? read(beforeFile) : { events: [] };
const after = read(afterFile);
const previous = new Map((before.events || []).map((event) => [event.slug, event]));
const current = new Map((after.events || []).map((event) => [event.slug, event]));
const newEvents = [];
const changedEvents = [];

for (const [slug, event] of current) {
  const old = previous.get(slug);
  if (!old) {
    const record = publicRecord(event);
    if (event.status === 'archive') {
      changedEvents.push({ ...record, changes: [{ field: 'catalog', before: 'not tracked', after: 'archived event added' }] });
    } else {
      newEvents.push(record);
    }
    continue;
  }
  const fields = ['name', 'status', 'type', 'startDate', 'endDate', 'dateLabel'];
  const changes = fields
    .filter((field) => clean(old[field]) !== clean(event[field]))
    .map((field) => ({ field, before: clean(old[field]), after: clean(event[field]) }));
  if (changes.length) changedEvents.push({ ...publicRecord(event), changes });
}

const removedEvents = [...previous]
  .filter(([slug]) => !current.has(slug))
  .map(([, event]) => publicRecord(event));
const report = {
  generatedAt: new Date().toISOString(),
  newEvents,
  changedEvents,
  removedEvents,
  hasChanges: Boolean(newEvents.length || changedEvents.length || removedEvents.length),
};
fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(reportFile, `${JSON.stringify(report, null, 2)}\n`);

if (process.env.GITHUB_OUTPUT) {
  fs.appendFileSync(process.env.GITHUB_OUTPUT, [
    `has_changes=${report.hasChanges}`,
    `new_count=${newEvents.length}`,
    `changed_count=${changedEvents.length}`,
    `removed_count=${removedEvents.length}`,
    `report_file=${reportFile}`,
    '',
  ].join('\n'));
}

console.log(`Event changes: ${newEvents.length} new, ${changedEvents.length} changed, ${removedEvents.length} removed.`);
