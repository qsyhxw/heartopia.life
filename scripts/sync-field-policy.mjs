const POLICIES = {
  achievements: new Set(['name', 'group', 'slug', 'image', 'imageUrl', 'status']),
  events: new Set(['slug', 'localSlug', 'local', 'name', 'status', 'type', 'startDate', 'endDate', 'date', 'dateLabel', 'sourceUrl']),
  eventRoutes: new Set(['day', 'id', 'name', 'color', 'location', 'rewardBubble']),
  collections: new Set(['id', 'slug', 'name', 'category', 'image', 'imageUrl', 'level', 'weather', 'location', 'time', 'price', 'marketValue', 'shadow', 'status']),
  crops: new Set(['id', 'slug', 'name', 'category', 'image', 'imageUrl', 'seedPrice', 'growthTime', 'growthMinutes', 'recipes', 'recipeCount', 'status']),
  recipes: new Set(['id', 'slug', 'name', 'category', 'image', 'imageUrl', 'level', 'ingredients', 'market', 'energy', 'eventTokens', 'status', 'availability']),
  wildlife: new Set(['id', 'slug', 'name', 'category', 'image', 'imageUrl', 'location', 'weather', 'favoriteFood', 'status']),
};

export const BLOCKED_REMOTE_FIELDS = new Set([
  'about',
  'description',
  'objective',
  'requirements',
  'guide',
  'steps',
  'tips',
  'translation',
  'summary',
]);

export function pickRemoteFields(dataset, record) {
  const allowed = POLICIES[dataset];
  if (!allowed) throw new Error(`Unknown remote field policy: ${dataset}`);
  const output = {};
  for (const [field, value] of Object.entries(record || {})) {
    const normalized = field.toLowerCase();
    if (BLOCKED_REMOTE_FIELDS.has(normalized)) {
      throw new Error(`Blocked remote field "${field}" in ${dataset}`);
    }
    if (allowed.has(field)) output[field] = value;
  }
  return output;
}

export function assertRemoteFields(dataset, record) {
  const allowed = POLICIES[dataset];
  if (!allowed) throw new Error(`Unknown remote field policy: ${dataset}`);
  const unexpected = Object.keys(record || {}).filter((field) => !allowed.has(field));
  if (unexpected.length) throw new Error(`Unexpected remote fields in ${dataset}: ${unexpected.join(', ')}`);
  return record;
}

export const SYNC_FIELD_POLICY = Object.freeze({
  allowedFacts: ['name', 'number', 'date', 'location', 'weather', 'level', 'price', 'category', 'status', 'image', 'structured names and quantities'],
  blockedNarrative: [...BLOCKED_REMOTE_FIELDS],
  achievementObjectives: 'remote-read-structured-in-memory-raw-discarded',
});
