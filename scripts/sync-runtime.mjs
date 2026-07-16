import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const fallback = path.join(os.tmpdir(), 'heartopia-sync');
export const syncDirectory = path.resolve(process.env.HEARTOPIA_SYNC_DIR || fallback);

export function syncPath(file) {
  const target = path.resolve(syncDirectory, file);
  if (target !== syncDirectory && !target.startsWith(`${syncDirectory}${path.sep}`)) {
    throw new Error(`Invalid sync workspace path: ${file}`);
  }
  return target;
}

export function readSyncJson(file) {
  return JSON.parse(fs.readFileSync(syncPath(file), 'utf8'));
}

export function writeSyncJson(file, value) {
  const target = syncPath(file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${JSON.stringify(value, null, 2)}\n`);
}
