import React, { useState } from 'react';
import { RomGame, EmulatorSystem, SystemId } from '../types';
import {
  PixelCartridge,
  PixelArcadeCabinet,
  PixelDisc,
  PixelFloppy,
  PixelHeart
} from '../utils/pixelIcons';
import { X, Play, Trash2, Clock, HardDrive, Calendar, Globe, Cpu, Pencil, Check } from 'lucide-react';
import { retroAudio } from '../utils/audio';

interface GameDetailsModalProps {
  game: RomGame;
  system: EmulatorSystem | undefined;
  systems: EmulatorSystem[];
  onLaunch: (game: RomGame) => void;
  onToggleFavorite: (gameId: string) => void;
  onDeleteRom: (gameId: string) => void;
  onUpdateRom: (updatedRom: RomGame) => void;
  onClose: () => void;
}

export const GameDetailsModal: React.FC<GameDetailsModalProps> = ({
  game,
  system,
  systems,
  onLaunch,
  onToggleFavorite,
  onDeleteRom,
  onUpdateRom,
  onClose
}) => {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(game.title);
  const [editSystemId, setEditSystemId] = useState<SystemId>(game.systemId);
  const [editRegion, setEditRegion] = useState(game.region);
  const [editYear, setEditYear] = useState(game.year);
  const [editGenre, setEditGenre] = useState(game.genre);

  const startEditing = () => {
    setEditTitle(game.title);
    setEditSystemId(game.systemId);
    setEditRegion(game.region);
    setEditYear(game.year);
    setEditGenre(game.genre);
    setIsEditing(true);
    retroAudio.playBlip(600);
  };

  const saveEdits = () => {
    onUpdateRom({
      ...game,
      title: editTitle.trim() || game.title,
      systemId: editSystemId,
      region: editRegion,
      year: Number(editYear) || game.year,
      genre: editGenre
    });
    setIsEditing(false);
    retroAudio.playPowerUp();
  };

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
        <div className="bg-[#120024] border-b-4 border-[#DFFF00] px-4 py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <span className="text-[10px] bg-[#DFFF00] text-[#120024] px-2.5 py-0.5 border border-[#DFFF00] font-black uppercase shrink-0">
              {system?.shortName || game.systemId.toUpperCase()}
            </span>
            {isEditing ? (
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="min-w-0 flex-1 px-2 py-1 bg-[#1e003b] border-2 border-[#DFFF00] text-xs text-[#DFFF00] uppercase font-black tracking-wider focus:outline-none"
              />
            ) : (
              <h2 className="text-xs sm:text-sm font-black text-[#DFFF00] uppercase tracking-wider truncate">
                {game.title}
              </h2>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {!isEditing && (
              <button
                onClick={startEditing}
                className="p-1.5 border-2 border-[#DFFF00] hover:bg-[#DFFF00] hover:text-[#120024] text-[#DFFF00] transition-colors"
                title="Edit metadata"
              >
                <Pencil size={14} />
              </button>
            )}
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

              {isEditing ? (
                <div className="grid grid-cols-2 gap-2.5 text-xs font-mono bg-[#120024] border-2 border-[#DFFF00] p-3">
                  <div>
                    <label className="block text-[9px] text-[#DFFF00]/60 uppercase font-bold mb-1">SYSTEM:</label>
                    <select
                      value={editSystemId}
                      onChange={(e) => setEditSystemId(e.target.value as SystemId)}
                      className="w-full px-2 py-1.5 bg-[#1e003b] border-2 border-[#DFFF00] text-[#DFFF00] uppercase font-bold cursor-pointer focus:outline-none"
                    >
                      {systems.map(s => (
                        <option key={s.id} value={s.id} className="bg-[#120024] text-[#DFFF00]">
                          {s.shortName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[9px] text-[#DFFF00]/60 uppercase font-bold mb-1">REGION:</label>
                    <select
                      value={editRegion}
                      onChange={(e) => setEditRegion(e.target.value as RomGame['region'])}
                      className="w-full px-2 py-1.5 bg-[#1e003b] border-2 border-[#DFFF00] text-[#DFFF00] uppercase font-bold cursor-pointer focus:outline-none"
                    >
                      <option value="USA">USA (NTSC-U)</option>
                      <option value="EUR">EUROPE (PAL)</option>
                      <option value="JPN">JAPAN (NTSC-J)</option>
                      <option value="WORLD">WORLD / MULTI</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[9px] text-[#DFFF00]/60 uppercase font-bold mb-1">YEAR:</label>
                    <input
                      type="number"
                      value={editYear}
                      onChange={(e) => setEditYear(Number(e.target.value))}
                      className="w-full px-2 py-1.5 bg-[#1e003b] border-2 border-[#DFFF00] text-[#DFFF00] font-bold focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] text-[#DFFF00]/60 uppercase font-bold mb-1">GENRE:</label>
                    <input
                      type="text"
                      value={editGenre}
                      onChange={(e) => setEditGenre(e.target.value)}
                      className="w-full px-2 py-1.5 bg-[#1e003b] border-2 border-[#DFFF00] text-[#DFFF00] uppercase font-bold focus:outline-none"
                    />
                  </div>

                  <div className="col-span-2 flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => {
                        retroAudio.playCancel();
                        setIsEditing(false);
                      }}
                      className="px-3 py-1.5 bg-[#1e003b] text-[#DFFF00] border-2 border-[#DFFF00] text-[10px] font-bold uppercase"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveEdits}
                      className="px-3 py-1.5 bg-[#DFFF00] text-[#120024] border-2 border-[#DFFF00] text-[10px] font-black uppercase flex items-center gap-1.5"
                    >
                      <Check size={12} />
                      Save
                    </button>
                  </div>
                </div>
              ) : (
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
              )}

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
