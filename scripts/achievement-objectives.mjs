export const achievementObjectives = Object.freeze({
  'bird-whisperer': 'Hobby level: Birdwatching Lv. 10',
  'bush-wholesaler': 'Sharing target: 100 D.G. Members; Item: Camouflage Bush',
  'cloud-walker': 'Hidden-phase target: 10 activations; Event: Birdwatching',
  'decisive-moment': 'Single-event target: 10 five-star Info Cards; Event: Birdwatching',
  'harmony-with-breeze': 'Cumulative target: 100 Bird Waves; Activity: Birdwatching Events',
  'joyful-chorus': 'Single-event target: 3 Bird Waves; Event: Birdwatching',
  'animal-keeper': 'Discovery target: Favorite foods for 8 animal groups',
  'animal-neighbor': 'Bond target: Level 10 with 8 animal groups',
  'collector': 'Rank requirement: Expert Collector',
  'dg-member': 'D.G. Member level: 30',
  'pop-star': 'Cumulative target: 100 Home Likes',
  'puzzle-artist': 'Rank requirement: Puzzle Artist',
  'rocket-sponsor': 'Sales income target: 500,000 Gold; Buyer: Gold Merchant Albert Jr.',
  'stardust-collector': 'Collection target: 60 Starfall Shards',
  'fast-flawless': 'Time limit: 60 seconds; Cooking target: 2 five-star dishes',
  'gourmet-diplomat': 'Sharing target: 100 food shares',
  'town-cooking-legend': 'Hobby level: Cooking Lv. 10',
  'bestselling-author': 'Reader target: 1,000 unique purchases across books you created',
  'golden-music-cd': 'Dream milestone: Golden Music CD; Dream: Music',
  'hidden-achievement-1': 'Publishing target: 10 books; Buyer requirement: 200 different players per book',
  'ice-elf': 'Dream milestone: Ice Elf; Dream: Figure Skating',
  'persistent-quill': 'Dream milestone: Master; Dream: Writing',
  'fishing-machine': 'Catch target: 50 fish; Weight requirement: More than 100 kg each',
  'mystic-fisher': 'Hidden-phase target: 10 activations; Event: Fishing',
  'never-empty-handed': 'Hobby level: Fishing Lv. 10',
  'sea-fishing-master': 'Completion target: All Daily Sea Fishing Event titles',
  'shark-frenzy': 'Single-event target: 3 sharks; Shadow requirement: Gold-glowing; Event: Sea Fishing',
  'shoal-caller': 'Single-event target: 3 Shoals; Event: Fishing',
  'shoals-blessing': 'Cumulative target: 100 Shoals; Activity: Fishing Events',
  'starlight-fisher': 'Single-event target: 4 five-star fish; Event: Fishing',
  'strong-sailor': 'Consecutive catch target: 2 fish; Weight requirement: More than 100 kg each',
  'twin-fish-fortune': 'Time limit: 1 minute; Catch target: 2 five-star fish',
  'green-touch': 'Hobby level: Gardening Lv. 10',
  'plentiful-harvest': 'Crop target: One five-star harvest; Activity: Bountiful Harvest',
  'rainbow-luck': 'Single-watering target: 2 Rainbow Hybrid Blessings; Method: Multi-area watering',
  'five-insects-blessing': 'Single-event target: 5 five-star insects; Event: Insect Catching',
  'human-insect-attractor': 'Single-event target: 4 Swarms; Event: Insect Catching',
  'insect-catching-party': 'Sharing target: 100 D.G. Members; Item: Inflatable Insect Attractor',
  'insect-commander': 'Hobby level: Insect Catching Lv. 10',
  'insect-harvester': 'Single-bubble target: 3 insects',
  'mystic-tracker': 'Hidden-phase target: 10 activations; Event: Insect Catching',
  'onsen-mountain-insect-king': 'Completion target: All Bait the Insects Event titles',
  'swarm-commander': 'Cumulative target: 100 Swarms; Activity: Insect Catching Events',
  'ace-cat-servant': 'Hobby level: Cat Caring Lv. 10',
  'ace-dog-trainer': 'Hobby level: Dog Caring Lv. 10',
  'doggie-canteen': 'Feeding target: 3 dogs; Food requirement: Each dog receives a favorite food',
  'meow-meow-canteen': 'Feeding target: 5 cats; Food requirement: Each cat receives a favorite food',
  'beneath-the-meteor-shower': 'Social action: Make a wish with friends; Condition: Beneath a meteor',
  'bold-grimkin': 'Role: Mysterious Grimkin; Action target: Pop 20 Psionic Bubbles; Event: Hide & Seek',
  'foreman-beaver': 'Participation target: 4 Build Challenges; Qualification: Work reaches the Exhibition Phase',
  'logistics-beaver': 'Team resource target: 5,000 Fresh Sprouts; Event: Build Challenge',
  'merge-into-one': 'Role: Mysterious Grimkin; Survival time: 4 minutes without discovery; Event: Hide & Seek',
  'onsen-buddy': 'Social action: Visit an Onsen with friends',
  'quick-draw-starter': 'Role: Investigative Journalist; Discovery target: 3 Mysterious Grimkins; Time limit: 60 seconds; Event: Hide & Seek',
  'rainbow-messenger': 'Sharing target: 50 D.G. Members; Item: Rainbow Bouquet',
  'repair-expert': 'Sharing target: 100 D.G. Members; Item: Repair Kit',
  'romantic-skater': 'Social action: Skate hand-in-hand with a friend; Condition: Meteor shower',
  'sharpshooter-basics': 'Role: Investigative Journalist; Streak target: 2 consecutive Special Photos; Event: Hide & Seek',
  'idea-hamster': 'Dream milestone: Idea Hamster; Dream: Party Artisan',
  'licensed-ready': 'Cumulative target: 60 large pollutants removed; Activity: Ocean Cleanup Events',
  'no-corner-left-behind': 'Hidden-phase target: 10 activations; Event: Ocean Cleanup',
  'ocean-cleanup-expert': 'Hobby level: Ocean Cleaning Lv. 10',
  'party-animal': 'Dream milestone: Party Animal; Dream: Party Player',
  'pumpkinarchy': 'Hobby level: Pumpkin Carving Lv. 5',
  'sand-sculpture-artist': 'Hobby level: Sand Sculpting Lv. 5',
  'snow-king': 'Hobby level: Snow Sculpting Lv. 5',
  'tides-of-life': 'Eco-fish milestone: Tidal Abundance; Location: Any underwater seamount',
});

function numericFacts(value) {
  return String(value || '')
    .replace(/\b5[\s-]*star\b/gi, 'five-star')
    .match(/\d[\d,]*(?:\.\d+)?/g)?.map((token) => Number(token.replaceAll(',', ''))) || [];
}

const numericOrder = Object.freeze({
  'fast-flawless': [1, 0],
  'strong-sailor': [1, 0],
  'twin-fish-fortune': [1, 0],
});

const ignoredTerms = new Set(['target', 'requirement', 'activity', 'event', 'events', 'level', 'single', 'cumulative', 'action', 'condition', 'role', 'method', 'completion', 'hidden', 'phase', 'time', 'limit', 'hobby', 'dream', 'milestone', 'social', 'sharing', 'collection', 'discovery', 'rank', 'feeding', 'each', 'with', 'all', 'any', 'one', 'more', 'than', 'per', 'the', 'and']);

function semanticTerms(value) {
  return String(value || '').toLowerCase().match(/[a-z][a-z'-]*/g)?.map((term) => term.replace(/ing$/, '').replace(/s$/, '')).filter((term) => term.length > 2 && !ignoredTerms.has(term)) || [];
}

function applyNumericFacts(template, source, slug) {
  const sourceTerms = new Set(semanticTerms(source));
  if (!semanticTerms(template).some((term) => sourceTerms.has(term))) {
    throw new Error(`Achievement meaning changed or could not be verified for ${slug}`);
  }
  const sourceFacts = numericFacts(source);
  const templateFacts = numericFacts(template);
  if (sourceFacts.length !== templateFacts.length) {
    throw new Error(`Achievement fact count changed: expected ${templateFacts.length}, received ${sourceFacts.length}`);
  }
  let index = 0;
  const result = template.replace(/\d[\d,]*(?:\.\d+)?/g, (token) => {
    const templateIndex = index++;
    const sourceIndex = numericOrder[slug]?.[templateIndex] ?? templateIndex;
    const next = sourceFacts[sourceIndex];
    const current = Number(token.replaceAll(',', ''));
    if (next === current) return token;
    return token.includes(',') ? next.toLocaleString('en-US') : String(next);
  });
  return result
    .replace(/\b1 seconds\b/g, '1 second')
    .replace(/\b(\d[\d,]*) minute\b/g, (text, count) => Number(count.replaceAll(',', '')) === 1 ? text : `${count} minutes`);
}

function commonObjectivePattern(raw) {
  let match = raw.match(/^(.+?) Hobby reaches Lv\.?\s*(\d+)\.?$/i);
  if (match) return `Hobby level: ${match[1]} Lv. ${match[2]}`;
  match = raw.match(/^Reach Level (\d+) in (.+?) Hobby\.?$/i);
  if (match) return `Hobby level: ${match[2]} Lv. ${match[1]}`;
  match = raw.match(/^(.+?) Dream reaches (.+?)\.?$/i);
  if (match) return `Dream milestone: ${match[2]}; Dream: ${match[1]}`;
  match = raw.match(/^Share (.+?) with ([\d,]+) D\.G\. Members in total\.?$/i);
  if (match) return `Sharing target: ${match[2]} D.G. Members; Item: ${match[1]}`;
  return '';
}

export function structureAchievementObjective(rawObjective, slug) {
  const raw = String(rawObjective || '').replace(/\s+/g, ' ').trim();
  if (!raw) throw new Error(`Missing remote achievement condition for ${slug}`);
  const template = localAchievementObjective(slug);
  if (template) return applyNumericFacts(template, raw, slug);
  const structured = commonObjectivePattern(raw);
  if (!structured) throw new Error(`Unsupported achievement condition pattern for ${slug}`);
  return structured;
}
export function localAchievementObjective(slug) {
  return achievementObjectives[slug] || '';
}
