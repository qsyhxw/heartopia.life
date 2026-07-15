import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

const root = path.resolve(import.meta.dirname, '..');
const assetRoot = path.join(root, 'assets', 'js');
const ignoredDirectories = new Set(['.git', 'node_modules']);
const hashCache = new Map();

function walk(directory) {
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...walk(target));
    else if (entry.isFile() && entry.name.endsWith('.html')) files.push(target);
  }
  return files;
}

function versionFor(relativeAsset) {
  const normalized = relativeAsset.replace(/\\/g, '/');
  if (hashCache.has(normalized)) return hashCache.get(normalized);

  const target = path.resolve(assetRoot, normalized);
  if (!target.startsWith(`${assetRoot}${path.sep}`) || !fs.existsSync(target)) {
    throw new Error(`Missing local script referenced by a page: /assets/js/${normalized}`);
  }

  const source = fs.readFileSync(target, 'utf8').replace(/\r\n/g, '\n');
  const version = createHash('sha256').update(source).digest('hex').slice(0, 12);
  hashCache.set(normalized, version);
  return version;
}

const scriptPattern = /(<script\b[^>]*\bsrc\s*=\s*)(["'])\/assets\/js\/([A-Za-z0-9._/-]+\.js)(?:\?v=[^"']*)?\2/gi;
let changedPages = 0;
let versionedReferences = 0;

for (const file of walk(root)) {
  const source = fs.readFileSync(file, 'utf8');
  const output = source.replace(scriptPattern, (match, prefix, quote, asset) => {
    versionedReferences += 1;
    return `${prefix}${quote}/assets/js/${asset}?v=${versionFor(asset)}${quote}`;
  });

  if (output !== source) {
    fs.writeFileSync(file, output);
    changedPages += 1;
  }
}

console.log(`Versioned ${versionedReferences} local script reference(s); updated ${changedPages} page(s).`);
