import { execFile } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const root = process.cwd();
const groups = {
  Collections: ['Puzzle Artist', 'Collector', 'Stardust Collector', 'Animal Keeper', 'D.G. Member', 'Pop Star', 'Rocket Sponsor', 'Animal Neighbor'],
  Fishing: ["Shoal's Blessing", 'Fishing Machine', 'Twin Fish Fortune', 'Sea Fishing Master', 'Shoal Caller', 'Shark Frenzy', 'Mystic Fisher', 'Starlight Fisher', 'Never Empty-Handed', 'Strong Sailor'],
  Cooking: ['Town Cooking Legend', 'Gourmet Diplomat', 'Fast & Flawless'],
  Gardening: ['Green Touch', 'Rainbow Luck', 'Plentiful Harvest'],
  'Pet Hobby': ['Meow-Meow Canteen', 'Doggie Canteen', 'Ace Cat Servant', 'Ace Dog Trainer'],
  'Insect Catching': ['Human Insect Attractor', 'Five Insects Blessing', 'Insect Commander', 'Swarm Commander', 'Insect Harvester', 'Insect Catching Party', 'Mystic Tracker', 'Onsen Mountain Insect King'],
  Birdwatching: ['Joyful Chorus', 'Bush Wholesaler', 'Decisive Moment', 'Harmony with Breeze', 'Bird Whisperer', 'Cloud Walker'],
  'Special Hobbies': ['Party Animal', 'Sand Sculpture Artist', 'Pumpkinarchy', 'Idea Hamster', 'Snow King'],
  Dreams: ['Bestselling Author', 'Golden Music CD', 'Ice Elf', 'Hidden Achievement 1', 'Persistent Quill'],
  Social: ['Onsen Buddy', 'Romantic Skater', 'Beneath the Meteor Shower', 'Logistics Beaver', 'Foreman Beaver', 'Merge into One', 'Repair Expert', 'Bold Grimkin', 'Sharpshooter Basics', 'Quick Draw Starter', 'Rainbow Messenger']
};

const slug = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const clean = (value) => value.replace(/<[^>]*>/g, ' ').replace(/&amp;/g, '&').replace(/&#34;/g, '"').replace(/\s+/g, ' ').trim();
const achievements = Object.entries(groups).flatMap(([group, names]) => names.map((name) => ({ name, group, slug: slug(name) })));
if (achievements.length !== 63) throw new Error(`Expected 63 achievements, got ${achievements.length}`);

function parse(html, achievement) {
  const objectiveStart = html.indexOf('Objective </h2>');
  const objectiveEnd = html.indexOf('Achievement Reward', objectiveStart);
  const objective = objectiveStart >= 0 && objectiveEnd > objectiveStart ? clean(html.slice(objectiveStart + 'Objective </h2>'.length, objectiveEnd)) : '';
  const rewardStart = html.indexOf('unlocked title </span>');
  const rewardMatch = rewardStart >= 0 ? html.slice(rewardStart, rewardStart + 500).match(/<span[^>]*>\s*[\"\u201c]?\s*([^<\"\u201d]+?)\s*[\"\u201d]?\s*<\/span>/i) : null;
  return { ...achievement, objective, reward: rewardMatch ? clean(rewardMatch[1]) : '' };
}

async function fetchDetail(achievement) {
  const url = `https://www.heartodex.com/en/achievements/${achievement.slug}/`;
  try {
    const { stdout } = await execFileAsync('curl.exe', ['-L', '--max-time', '30', '-sS', '-A', 'Mozilla/5.0', url], { maxBuffer: 3 * 1024 * 1024 });
    return stdout.includes('<html') ? parse(stdout, achievement) : { ...achievement, objective: '', reward: '', error: 'No page data returned' };
  } catch (error) {
    return { ...achievement, objective: '', reward: '', error: error.message };
  }
}

const result = [];
for (let index = 0; index < achievements.length; index += 3) {
  result.push(...await Promise.all(achievements.slice(index, index + 3).map(fetchDetail)));
  console.log(`Fetched ${Math.min(index + 3, achievements.length)} / ${achievements.length}`);
}

fs.writeFileSync(path.join(root, 'data', 'achievement-details.json'), `${JSON.stringify(result, null, 2)}\n`);
console.log(`Saved ${result.length} achievements; ${result.filter((item) => item.objective).length} with objectives; ${result.filter((item) => item.error).length} fetch failures.`);
