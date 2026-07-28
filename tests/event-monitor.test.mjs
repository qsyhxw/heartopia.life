import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const root = path.resolve(import.meta.dirname, '..');
const detector = path.join(root, 'scripts', 'detect-heartopia-event-changes.mjs');

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
