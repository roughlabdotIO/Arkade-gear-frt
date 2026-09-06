import { SystemId } from '../types';

/** Guess the system id from a ROM filename's extension. */
export function detectSystemFromFilename(name: string): SystemId {
  const ext = name.slice(name.lastIndexOf('.')).toLowerCase();
  if (ext === '.nes' || ext === '.fds') return 'nes';
  if (ext === '.smc' || ext === '.sfc' || ext === '.fig') return 'snes';
  if (ext === '.gba' || ext === '.agb') return 'gba';
  if (ext === '.md' || ext === '.gen' || ext === '.smd') return 'genesis';
  if (ext === '.iso' || ext === '.cue' || ext === '.chd') return 'psx';
  if (ext === '.z64' || ext === '.n64' || ext === '.v64') return 'n64';
  if (ext === '.neo') return 'neogeo';
  // .zip is a generic archive extension used by many systems' ROM sets (not just arcade) - can't
  // guess the system from it alone, so it falls through to the default below like any unknown extension.
  return 'nes';
}
