import React from 'react';
import { RomGame } from '../types';
import { PixelCartridge } from '../utils/pixelIcons';

interface NfcBootGateProps {
  game: RomGame;
  onStart: () => void;
}

/**
 * Shown right after opening a ?launch= card link, before anything else happens.
 * Browsers only grant fullscreen + unmuted autoplay in direct response to a real user
 * gesture - a card tap that opens this page does NOT count as one on its own, so this one
 * tap is what unlocks fullscreen + the intro video's audio for the rest of the flow.
 */
export const NfcBootGate: React.FC<NfcBootGateProps> = ({ game, onStart }) => {
  const handleTap = async () => {
    const root = document.documentElement;
    try {
      if (!document.fullscreenElement && root.requestFullscreen) {
        await root.requestFullscreen();
      }
    } catch {
      // Fullscreen can be denied/unsupported - continue the flow regardless.
    }
    onStart();
  };

  return (
    <div
      onClick={handleTap}
      className="fixed inset-0 z-[100] bg-[#120024] flex flex-col items-center justify-center gap-6 cursor-pointer font-mono text-[#DFFF00] select-none"
    >
      <div className="flex flex-col items-center gap-3 animate-pulse">
        <PixelCartridge size={56} color="#DFFF00" />
        <h1 className="text-2xl sm:text-3xl font-black uppercase italic tracking-tight">
          ARKADE GEAR
        </h1>
      </div>

      <p className="text-sm sm:text-base font-bold uppercase text-center px-6">
        {game.title}
      </p>

      <div className="border-4 border-[#DFFF00] px-6 py-3 bg-[#1e003b] shadow-[4px_4px_0px_#4B0082]">
        <span className="text-xs sm:text-sm font-black uppercase tracking-widest">
          TAP TO START
        </span>
      </div>
    </div>
  );
};
