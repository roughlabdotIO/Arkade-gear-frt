import { RomGame } from '../types';

type Region = RomGame['region'];

// No-Intro/GoodTools naming convention tags, e.g. "Sonic 2 (USA).md" or "Sonic 2 (W) [!].bin".
// Deliberately excludes ambiguous tags like "NTSC"/"PAL" (both cover more than one region).
const REGION_TOKENS: Record<string, Region> = {
  usa: 'USA',
  us: 'USA',
  u: 'USA',
  europe: 'EUR',
  eu: 'EUR',
  e: 'EUR',
  japan: 'JPN',
  jpn: 'JPN',
  jp: 'JPN',
  j: 'JPN',
  world: 'WORLD',
  w: 'WORLD'
};

/** Guess a ROM's region from (parenthesized) or [bracketed] tags in its filename. Falls back to WORLD when absent or ambiguous (multiple distinct regions listed). */
export function detectRegionFromFilename(name: string): Region {
  const groups = Array.from(name.matchAll(/[([]([^)\]]+)[)\]]/g)).map(m => m[1]);
  const found = new Set<Region>();

  for (const group of groups) {
    for (const rawToken of group.split(',')) {
      const region = REGION_TOKENS[rawToken.trim().toLowerCase()];
      if (region) found.add(region);
    }
  }

  return found.size === 1 ? [...found][0] : 'WORLD';
}
