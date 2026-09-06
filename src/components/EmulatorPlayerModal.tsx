import React, { useState, useEffect } from 'react';
import { RomGame, EmulatorSystem, SaveStateSlot } from '../types';
import { PixelCrtMonitor, PixelFloppy } from '../utils/pixelIcons';
import { Play, Pause, FastForward, RotateCcw, Camera, X, Volume2, VolumeX } from 'lucide-react';
import { retroAudio } from '../utils/audio';
import { getBackendOrigin, serverRomUrl } from '../utils/api';

interface EmulatorPlayerModalProps {
  game: RomGame;
  system: EmulatorSystem;
  onClose: () => void;
  onUpdatePlaytime: (gameId: string, addedMinutes: number) => void;
}

export const EmulatorPlayerModal: React.FC<EmulatorPlayerModalProps> = ({
  game,
  system,
  onClose,
  onUpdatePlaytime
}) => {
  const [isPaused, setIsPaused] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState<1 | 2>(1);
  const [crtFilter, setCrtFilter] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<number>(1);
  const [saveSlots] = useState<Record<number, SaveStateSlot>>({
    1: { slot: 1, exists: false },
    2: { slot: 2, exists: false },
    3: { slot: 3, exists: false },
    4: { slot: 4, exists: false },
    5: { slot: 5, exists: false }
  });
  const [isMuted, setIsMuted] = useState(false);

  const canLaunch = Boolean(game.serverFileName) && Boolean(system.coreId);
  const embedSrc = canLaunch
    ? `${getBackendOrigin()}/?system=${encodeURIComponent(system.coreId)}&rom=${encodeURIComponent(serverRomUrl(game.serverFileName!))}`
    : null;

  // Playtime tracker
  useEffect(() => {
    const timer = setInterval(() => {
      onUpdatePlaytime(game.id, 1);
    }, 60000);
    return () => clearInterval(timer);
  }, [game.id, onUpdatePlaytime]);

  return (
    <div className="fixed inset-0 z-50 bg-[#120024]/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto font-mono text-[#DFFF00]">
      <div className="relative w-full max-w-4xl bg-[#1e003b] border-4 border-[#DFFF00] shadow-[8px_8px_0px_#4B0082] flex flex-col my-auto max-h-[96vh]">
        {/* Modal Top Bar */}
        <div className="bg-[#120024] border-b-4 border-[#DFFF00] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <span className="text-[10px] bg-[#DFFF00] text-[#120024] px-2.5 py-0.5 border border-[#DFFF00] font-black uppercase tracking-wider shrink-0">
              {system.shortName}
            </span>
            <h2 className="text-sm sm:text-base font-black text-[#DFFF00] uppercase tracking-tight truncate">
              {game.title}
            </h2>
            <span className="hidden sm:inline text-[10px] text-[#DFFF00]/60">
              [CORE: {system.activeCore}]
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                retroAudio.playCancel();
                onClose();
              }}
              className="p-1.5 border-2 border-[#DFFF00] hover:bg-[#DFFF00] hover:text-[#120024] text-[#DFFF00] transition-colors"
              title="Close Emulator"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Emulator Monitor HUD */}
        <div className="bg-[#120024] border-b-2 border-[#DFFF00]/50 px-4 py-2 flex flex-wrap items-center justify-between text-[10px] text-[#DFFF00] font-mono gap-2">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="text-[#DFFF00]/60">CORE:</span>
              <span className="text-[#CCFF00] font-black">{system.coreId || 'UNAVAILABLE'}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-[#DFFF00] font-bold">
              STATUS:{' '}
              <span className="text-[#CCFF00]">
                {canLaunch ? (isPaused ? 'PAUSED' : 'RUNNING') : 'NO ROM FILE ON SERVER'}
              </span>
            </div>
          </div>
        </div>

        {/* Main Emulator Display Stage */}
        <div className="relative bg-[#0a0014] flex flex-col items-center justify-center p-2 sm:p-4 overflow-hidden">
          <div className="relative w-full max-w-[800px] aspect-[4/3] border-4 border-[#DFFF00] shadow-[0_0_20px_rgba(223,255,0,0.2)] bg-black">
            {embedSrc ? (
              <iframe
                title={`${game.title} emulator`}
                src={embedSrc}
                allow="gamepad; fullscreen; autoplay"
                className="absolute inset-0 w-full h-full border-none"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center px-4">
                <span className="text-xs font-black uppercase text-[#DFFF00]">
                  {system.coreId ? 'No ROM file stored on the server' : 'No emulator core available for this system yet'}
                </span>
                <span className="text-[10px] text-[#DFFF00]/60 max-w-sm">
                  This entry is a demo/catalog placeholder and cannot be launched.
                </span>
              </div>
            )}

            {crtFilter && embedSrc && (
              <div className="absolute inset-0 crt-scanlines crt-flicker pointer-events-none" />
            )}
          </div>
        </div>

        {/* Emulator Control Deck (visual only for now — the real core runs isolated inside the iframe) */}
        <div className="bg-[#1e003b] border-t-4 border-[#DFFF00] p-3.5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <button
                disabled
                title="Coming soon"
                onClick={() => setIsPaused(!isPaused)}
                className="px-3 py-1.5 bg-[#120024] text-[#DFFF00]/40 border-2 border-[#DFFF00]/40 text-xs font-bold flex items-center gap-1.5 cursor-not-allowed"
              >
                {isPaused ? <Play size={12} /> : <Pause size={12} />}
                <span>{isPaused ? 'RESUME' : 'PAUSE'}</span>
              </button>

              <button
                disabled
                title="Coming soon"
                onClick={() => setSpeedMultiplier(speedMultiplier === 1 ? 2 : 1)}
                className="px-3 py-1.5 border-2 border-[#DFFF00]/40 text-xs font-bold flex items-center gap-1.5 bg-[#120024] text-[#DFFF00]/40 cursor-not-allowed"
              >
                <FastForward size={12} />
                <span>SPEED: {speedMultiplier}X</span>
              </button>

              <button
                disabled
                title="Coming soon"
                className="px-3 py-1.5 bg-[#120024] text-[#DFFF00]/40 border-2 border-[#DFFF00]/40 text-xs font-bold flex items-center gap-1.5 cursor-not-allowed"
              >
                <RotateCcw size={12} />
                <span>RESET</span>
              </button>

              <button
                disabled
                title="Coming soon"
                className="px-3 py-1.5 bg-[#120024] text-[#DFFF00]/40 border-2 border-[#DFFF00]/40 text-xs font-bold flex items-center gap-1.5 cursor-not-allowed"
              >
                <Camera size={12} />
                <span className="hidden sm:inline">SCREENSHOT</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  retroAudio.playBlip(600);
                  setCrtFilter(!crtFilter);
                }}
                className={`px-3 py-1.5 border-2 border-[#DFFF00] text-xs font-bold flex items-center gap-1.5 transition-colors ${
                  crtFilter
                    ? 'bg-[#DFFF00] text-[#120024]'
                    : 'bg-[#120024] text-[#DFFF00] hover:bg-[#DFFF00] hover:text-[#120024]'
                }`}
              >
                <PixelCrtMonitor size={14} color={crtFilter ? '#120024' : '#DFFF00'} />
                <span>CRT SCANLINES</span>
              </button>

              <button
                onClick={() => {
                  retroAudio.playBlip(600);
                  setIsMuted(!isMuted);
                }}
                className="p-1.5 border-2 border-[#DFFF00] hover:bg-[#DFFF00] hover:text-[#120024] text-[#DFFF00] transition-colors"
                title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
              >
                {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
              </button>
            </div>
          </div>

          {/* Save State Slots Strip (disabled — not yet wired to the real core) */}
          <div className="bg-[#120024] border-2 border-[#DFFF00]/40 p-2.5 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs opacity-60">
            <div className="flex items-center gap-2.5">
              <span className="text-[#DFFF00] font-black flex items-center gap-1.5 uppercase">
                <PixelFloppy size={14} color="#DFFF00" />
                SAVE SLOT:
              </span>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map(slot => {
                  const isCurrent = selectedSlot === slot;
                  return (
                    <button
                      key={slot}
                      disabled
                      title="Coming soon"
                      onClick={() => setSelectedSlot(slot)}
                      className={`px-2.5 py-1 border-2 font-mono font-bold cursor-not-allowed ${
                        isCurrent
                          ? 'bg-[#4B0082] text-[#DFFF00] border-[#DFFF00]/60'
                          : 'bg-[#1e003b] text-[#DFFF00]/40 border-[#DFFF00]/40'
                      }`}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button disabled title="Coming soon" className="px-3.5 py-1.5 bg-[#4B0082] text-[#DFFF00]/60 border-2 border-[#DFFF00]/40 font-black uppercase text-xs cursor-not-allowed">
                + SAVE STATE
              </button>
              <button disabled title="Coming soon" className="px-3.5 py-1.5 border-2 border-[#DFFF00]/40 font-black uppercase text-xs bg-[#120024] text-[#DFFF00]/30 cursor-not-allowed">
                RESTORE
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
