import React, { useState } from 'react';
import { RomGame, EmulatorSystem } from '../types';
import {
  PixelCartridge,
  PixelArcadeCabinet,
  PixelDisc,
  PixelFloppy,
  PixelHeart
} from '../utils/pixelIcons';
import { X, Play, Trash2, Clock, HardDrive, Calendar, Globe, Cpu } from 'lucide-react';
import { retroAudio } from '../utils/audio';

interface GameDetailsModalProps {
  game: RomGame;
  system: EmulatorSystem | undefined;
  onLaunch: (game: RomGame) => void;
  onToggleFavorite: (gameId: string) => void;
  onDeleteRom: (gameId: string) => void;
  onClose: () => void;
}

export const GameDetailsModal: React.FC<GameDetailsModalProps> = ({
  game,
  system,
  onLaunch,
  onToggleFavorite,
  onDeleteRom,
  onClose
}) => {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const getCoverVisual = () => {
    switch (game.pixelArtIcon) {
      case 'arcade':
        return <PixelArcadeCabinet size={54} color="#DFFF00" />;
      case 'disc':
        return <PixelDisc size={54} color="#DFFF00" />;
      default:
        return <PixelCartridge size={54} color="#DFFF00" />;
    }
  };

  const formatPlaytime = (mins: number) => {
    if (mins < 60) return `${mins} MINS`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h} HRS ${m} MINS`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#120024]/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto font-mono text-[#DFFF00]">
      <div className="relative w-full max-w-2xl bg-[#1e003b] border-4 border-[#DFFF00] shadow-[8px_8px_0px_#4B0082] my-auto">
        {/* Header */}
        <div className="bg-[#120024] border-b-4 border-[#DFFF00] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-[10px] bg-[#DFFF00] text-[#120024] px-2.5 py-0.5 border border-[#DFFF00] font-black uppercase">
              {system?.shortName || game.systemId.toUpperCase()}
            </span>
            <h2 className="text-xs sm:text-sm font-black text-[#DFFF00] uppercase tracking-wider truncate">
              {game.title}
            </h2>
          </div>
          <button
            onClick={() => {
              retroAudio.playCancel();
              onClose();
            }}
            className="p-1.5 border-2 border-[#DFFF00] hover:bg-[#DFFF00] hover:text-[#120024] text-[#DFFF00] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4">
          {/* Cover & Quick Specs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Box Art / Pixel Icon Frame */}
            <div className="bg-[#120024] border-2 border-[#DFFF00] p-6 flex flex-col items-center justify-center gap-2.5 text-center shadow-[4px_4px_0px_#4B0082]">
              {getCoverVisual()}
              <span className="text-[10px] text-[#DFFF00] uppercase font-black tracking-wider mt-1">
                {game.genre}
              </span>
              <button
                onClick={() => {
                  retroAudio.playBlip(game.favorite ? 400 : 800);
                  onToggleFavorite(game.id);
                }}
                className="mt-1 flex items-center gap-1.5 text-xs text-[#DFFF00]/80 hover:text-[#DFFF00] font-bold"
              >
                <PixelHeart size={14} filled={game.favorite} />
                <span>{game.favorite ? 'FAVORITE' : 'ADD TO FAVS'}</span>
              </button>
            </div>

            {/* Specs & Metadata */}
            <div className="sm:col-span-2 space-y-3">
              <p className="text-xs text-[#DFFF00]/80 leading-relaxed font-sans">
                {game.description}
              </p>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="bg-[#120024] border-2 border-[#DFFF00] p-2.5 flex items-center gap-2">
                  <Globe size={14} className="text-[#DFFF00]" />
                  <div>
                    <div className="text-[9px] text-[#DFFF00]/60 uppercase">REGION:</div>
                    <div className="text-[#DFFF00] font-black">{game.region}</div>
                  </div>
                </div>

                <div className="bg-[#120024] border-2 border-[#DFFF00] p-2.5 flex items-center gap-2">
                  <Calendar size={14} className="text-[#DFFF00]" />
                  <div>
                    <div className="text-[9px] text-[#DFFF00]/60 uppercase">YEAR:</div>
                    <div className="text-[#DFFF00] font-black">{game.year}</div>
                  </div>
                </div>

                <div className="bg-[#120024] border-2 border-[#DFFF00] p-2.5 flex items-center gap-2">
                  <HardDrive size={14} className="text-[#DFFF00]" />
                  <div>
                    <div className="text-[9px] text-[#DFFF00]/60 uppercase">ROM SIZE:</div>
                    <div className="text-[#DFFF00] font-black">{game.size}</div>
                  </div>
                </div>

                <div className="bg-[#120024] border-2 border-[#DFFF00] p-2.5 flex items-center gap-2">
                  <Clock size={14} className="text-[#DFFF00]" />
                  <div>
                    <div className="text-[9px] text-[#DFFF00]/60 uppercase">TOTAL PLAYED:</div>
                    <div className="text-[#CCFF00] font-black">{formatPlaytime(game.playTimeMinutes)}</div>
                  </div>
                </div>
              </div>

              {/* Core & Shader info */}
              <div className="bg-[#120024] border-2 border-[#DFFF00] p-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Cpu size={14} className="text-[#DFFF00]" />
                  <span className="text-[#DFFF00]/60 uppercase text-[10px]">ACTIVE CORE:</span>
                  <span className="text-[#DFFF00] font-mono font-bold">{system?.activeCore}</span>
                </div>
                <div className="text-[#DFFF00]/70 font-mono text-[10px]">
                  {system?.shader}
                </div>
              </div>
            </div>
          </div>

          {/* Save States Preview List */}
          <div className="border-2 border-[#DFFF00] bg-[#120024] p-3.5 shadow-[3px_3px_0px_#4B0082]">
            <div className="text-xs text-[#DFFF00] font-black mb-2 flex items-center gap-2 uppercase">
              <PixelFloppy size={14} color="#DFFF00" />
              <span>SAVED BATTERY & SRAM STATES (SLOTS 1-5):</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs font-mono">
              {[1, 2, 3, 4, 5].map(slot => {
                const hasSave = slot <= game.saveStatesCount;
                return (
                  <div
                    key={slot}
                    className={`p-2 border-2 text-center ${
                      hasSave ? 'bg-[#4B0082] border-[#DFFF00] text-[#DFFF00]' : 'bg-[#1e003b] border-[#DFFF00]/40 text-[#DFFF00]/40'
                    }`}
                  >
                    <div className="font-black text-xs">SLOT {slot}</div>
                    <div className="text-[9px] font-bold mt-0.5">
                      {hasSave ? 'ACTIVE' : 'EMPTY'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t-2 border-[#DFFF00]/30">
            {confirmDelete ? (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#DFFF00]">CONFIRM DELETE?</span>
                <button
                  onClick={() => {
                    retroAudio.playCancel();
                    onDeleteRom(game.id);
                    onClose();
                  }}
                  className="px-3 py-1.5 bg-[#4B0082] hover:bg-[#6A0DAD] text-[#DFFF00] border-2 border-[#DFFF00] text-xs font-black transition-colors"
                >
                  YES, DELETE
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="px-2.5 py-1.5 bg-[#120024] text-[#DFFF00] border border-[#DFFF00] text-xs"
                >
                  CANCEL
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  retroAudio.playCancel();
                  setConfirmDelete(true);
                }}
                className="px-3.5 py-2 bg-[#120024] hover:bg-[#4B0082] text-[#DFFF00] border-2 border-[#DFFF00] text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Trash2 size={13} />
                <span>DELETE ROM</span>
              </button>
            )}

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => {
                  retroAudio.playCancel();
                  onClose();
                }}
                className="px-4 py-2 bg-[#120024] hover:bg-[#DFFF00] hover:text-[#120024] text-[#DFFF00] border-2 border-[#DFFF00] text-xs font-bold transition-colors"
              >
                CLOSE
              </button>
              <button
                onClick={() => {
                  retroAudio.playPowerUp();
                  onLaunch(game);
                  onClose();
                }}
                className="px-5 py-2 bg-[#DFFF00] hover:bg-[#CCFF00] text-[#120024] border-2 border-[#DFFF00] text-xs font-black shadow-[3px_3px_0px_#4B0082] flex items-center gap-2 transition-colors"
              >
                <Play size={13} className="fill-[#120024]" />
                <span>LAUNCH GAME IN EMU</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
