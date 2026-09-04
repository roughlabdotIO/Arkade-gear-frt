import React from 'react';
import { RomGame, EmulatorSystem } from '../types';
import {
  PixelHeart,
  PixelCartridge,
  PixelArcadeCabinet,
  PixelDisc,
  PixelTrophy,
  PixelFloppy
} from '../utils/pixelIcons';
import { Play, Clock, HardDrive, Sparkles } from 'lucide-react';
import { retroAudio } from '../utils/audio';

interface RomCardProps {
  game: RomGame;
  system: EmulatorSystem | undefined;
  onLaunch: (game: RomGame) => void;
  onToggleFavorite: (gameId: string) => void;
  onOpenGameDetails: (game: RomGame) => void;
}

export const RomCard: React.FC<RomCardProps> = ({
  game,
  system,
  onLaunch,
  onToggleFavorite,
  onOpenGameDetails
}) => {
  const getCoverVisual = () => {
    switch (game.pixelArtIcon) {
      case 'arcade':
        return <PixelArcadeCabinet size={36} color="#dfff00" />;
      case 'disc':
        return <PixelDisc size={36} color="#dfff00" />;
      case 'trophy':
        return <PixelTrophy size={36} color="#dfff00" />;
      case 'heart':
        return <PixelHeart size={36} color="#dfff00" filled={true} />;
      default:
        return <PixelCartridge size={36} color="#dfff00" />;
    }
  };

  const formatPlaytime = (mins: number) => {
    if (mins < 60) return `${mins}m`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  };

  return (
    <div className="group relative bg-[#1e003b] border-4 border-[#DFFF00] p-4 flex flex-col justify-between transition-all hover:shadow-[6px_6px_0px_#4B0082] overflow-hidden font-mono">
      {/* Top Bar: System Shortname + Region + Favorite */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-[#4B0082] text-[#DFFF00] px-2 py-1 uppercase font-bold tracking-wider">
              {system?.shortName || game.systemId.toUpperCase()}
            </span>
            <span className="text-[9px] border border-[#DFFF00]/40 text-[#DFFF00]/80 px-1.5 py-0.5 uppercase">
              {game.region}
            </span>
            <span className="text-[9px] text-[#DFFF00]/60">
              {game.year}
            </span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              retroAudio.playBlip(game.favorite ? 400 : 800);
              onToggleFavorite(game.id);
            }}
            className="p-1 hover:scale-110 transition-transform text-[#DFFF00]"
            title={game.favorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <PixelHeart size={16} filled={game.favorite} />
          </button>
        </div>

        {/* Pixel Box Art Header */}
        <div 
          onClick={() => onOpenGameDetails(game)}
          className="cursor-pointer relative h-28 bg-[#120024] border-2 border-[#DFFF00] mb-3 overflow-hidden flex flex-col items-center justify-center group-hover:bg-[#15002c] transition-colors"
        >
          {/* Subtle grid backdrop */}
          <div className="absolute inset-0 bg-[radial-gradient(#4B0082_1px,transparent_1px)] [background-size:8px_8px] opacity-50 pointer-events-none" />
          
          <div className="relative z-10 flex flex-col items-center gap-1.5 transition-transform group-hover:scale-105">
            {getCoverVisual()}
            <span className="text-[9px] text-[#DFFF00] tracking-widest uppercase font-bold px-2 py-0.5 bg-[#120024] border border-[#DFFF00]">
              {game.genre}
            </span>
          </div>

          {/* Quick info badges inside cover */}
          <div className="absolute bottom-1 right-1 flex items-center gap-1 text-[8px] text-[#DFFF00] bg-[#120024] px-1.5 py-0.5 border border-[#DFFF00]/60">
            <HardDrive size={10} />
            <span>{game.size}</span>
          </div>
        </div>

        {/* Title & Description */}
        <h3 
          onClick={() => onOpenGameDetails(game)}
          className="text-base font-black uppercase text-[#DFFF00] group-hover:text-[#CCFF00] transition-colors line-clamp-1 mb-1 tracking-tight cursor-pointer"
          title={game.title}
        >
          {game.title}
        </h3>

        <p className="text-[10px] text-[#DFFF00]/70 line-clamp-2 leading-relaxed mb-3">
          {game.description}
        </p>
      </div>

      {/* Footer Stats & Actions */}
      <div className="space-y-3 pt-3 border-t-2 border-[#DFFF00]/30">
        {/* Playtime and Save states */}
        <div className="flex items-center justify-between text-[9px] text-[#DFFF00]/80">
          <div className="flex items-center gap-1.5">
            <Clock size={11} className="text-[#DFFF00]" />
            <span>PLAYTIME: {formatPlaytime(game.playTimeMinutes)}</span>
          </div>
          <div className="flex items-center gap-1 text-[#DFFF00] font-bold">
            <PixelFloppy size={12} color="#DFFF00" />
            <span>{game.saveStatesCount}/5 SAVES</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-5 gap-2">
          <button
            onClick={() => {
              retroAudio.playPowerUp();
              onLaunch(game);
            }}
            className="col-span-4 border-2 border-[#DFFF00] py-2 px-3 font-bold hover:bg-[#DFFF00] hover:text-[#120024] transition-colors uppercase text-xs flex items-center justify-center gap-2 bg-[#120024] text-[#DFFF00]"
          >
            <Play size={12} className="fill-current" />
            <span>LAUNCH SYSTEM</span>
          </button>

          <button
            onClick={() => {
              retroAudio.playBlip(550);
              onOpenGameDetails(game);
            }}
            className="col-span-1 border-2 border-[#DFFF00] hover:bg-[#DFFF00] hover:text-[#120024] text-[#DFFF00] py-2 flex items-center justify-center transition-colors bg-[#120024]"
            title="View Details & Options"
          >
            <Sparkles size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};
