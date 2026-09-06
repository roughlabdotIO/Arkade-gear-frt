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
  if (ext === '.zip') return 'arcade';
  return 'nes';
}
