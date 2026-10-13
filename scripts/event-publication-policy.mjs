import fs from 'node:fs';
import path from 'node:path';

const artworkAliases = { 'frostspore-butterflies': 'winter-2026' };

export function findLocalEventArtwork(root, event, manifest = {}) {
  const names = [...new Set([event.local || event.localSlug, event.slug, artworkAliases[event.slug]].filter(Boolean))];
  for (const name of names) {
    const mapped = manifest.images?.[name]?.path;
    if (mapped && fs.existsSync(path.join(root, mapped.replace(/^\//, '')))) return mapped;
    for (const extension of ['webp', 'jpg', 'jpeg', 'png']) {
      const relative = `/img/events/${name}.${extension}`;
      if (fs.existsSync(path.join(root, relative.slice(1)))) return relative;
    }
  }
  return '';
}

export function selectPublishableEvents(events, previousEvents, hasArtwork) {
  const known = new Set(previousEvents.flatMap(event => [event.slug, event.localSlug].filter(Boolean)));
  const published = [];
  const pending = [];
  for (const event of events) {
    if (hasArtwork(event)) {
      published.push(event);
    } else if (known.has(event.slug) || known.has(event.local || event.localSlug)) {
      throw new Error(`Published event lost local artwork: ${event.slug}`);
    } else {
      pending.push(event);
    }
  }
  return { published, pending };
}
