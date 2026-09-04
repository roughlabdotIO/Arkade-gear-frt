export type SystemId = 'nes' | 'snes' | 'gba' | 'genesis' | 'psx' | 'arcade' | 'n64' | 'neogeo';

export type ShaderPreset = 'CRT-Geom' | 'Scanlines 25%' | 'LCD-Grid' | 'Pixel-Perfect' | 'None';

export type VideoScale = '1x' | '2x' | '3x' | 'Full-4:3';

export type BiosStatus = 'VERIFIED' | 'MISSING' | 'OPTIONAL';

export interface EmulatorSystem {
  id: SystemId;
  name: string;
  shortName: string;
  generation: string;
  year: number;
  company: string;
  activeCore: string;
  availableCores: string[];
  biosStatus: BiosStatus;
  biosFile: string;
  fileExtensions: string[];
  accentColor: string;
  badgeBg: string;
  fps: number;
  shader: ShaderPreset;
  scaling: VideoScale;
  overclock: boolean;
  rewindBuffer: boolean;
  audioLatencyMs: number;
  description: string;
}

export interface RomGame {
  id: string;
  title: string;
  systemId: SystemId;
  size: string;
  region: 'USA' | 'EUR' | 'JPN' | 'WORLD';
  year: number;
  genre: string;
  rating: number;
  favorite: boolean;
  playTimeMinutes: number;
  lastPlayed?: string;
  saveStatesCount: number;
  pixelArtIcon: string;
  pixelThemeColor: string;
  description: string;
}

export interface ControllerMapping {
  up: string;
  down: string;
  left: string;
  right: string;
  buttonA: string;
  buttonB: string;
  buttonX: string;
  buttonY: string;
  buttonL: string;
  buttonR: string;
  start: string;
  select: string;
  turboA: string;
  turboB: string;
  deadzone: number;
  turboRateHz: number;
}

export interface SaveStateSlot {
  slot: number;
  exists: boolean;
  timestamp?: string;
  gameScore?: number;
  gameLevel?: number;
}

export interface BiosRecord {
  filename: string;
  systemId: SystemId;
  description: string;
  expectedMd5: string;
  status: BiosStatus;
  fileSizeBytes: number;
}
