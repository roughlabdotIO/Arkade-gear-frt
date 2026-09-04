import React, { useState, useMemo } from 'react';
import { RomGame, EmulatorSystem, SystemId } from '../types';
import { RomCard } from './RomCard';
import { Search, SlidersHorizontal, Heart, Plus } from 'lucide-react';
import { retroAudio } from '../utils/audio';

interface RomLibraryProps {
  roms: RomGame[];
  systems: EmulatorSystem[];
  selectedSystemId: SystemId | 'all';
  onLaunchGame: (game: RomGame) => void;
  onToggleFavorite: (gameId: string) => void;
  onOpenGameDetails: (game: RomGame) => void;
  onOpenImportRom: () => void;
}

export const RomLibrary: React.FC<RomLibraryProps> = ({
  roms,
  systems,
  selectedSystemId,
  onLaunchGame,
  onToggleFavorite,
  onOpenGameDetails,
  onOpenImportRom
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'title' | 'playtime' | 'year'>('title');

  // Extract all unique genres
  const availableGenres = useMemo(() => {
    const genres = new Set<string>();
    roms.forEach(r => genres.add(r.genre));
    return ['ALL', ...Array.from(genres)];
  }, [roms]);

  // System lookup map
  const systemMap = useMemo(() => {
    const map = new Map<SystemId, EmulatorSystem>();
    systems.forEach(s => map.set(s.id, s));
    return map;
  }, [systems]);

  // Filtered & Sorted ROMs
  const filteredRoms = useMemo(() => {
    return roms.filter(game => {
      // System match
      if (selectedSystemId !== 'all' && game.systemId !== selectedSystemId) {
        return false;
      }
      // Favorites filter
      if (onlyFavorites && !game.favorite) {
        return false;
      }
      // Genre filter
      if (selectedGenre !== 'ALL' && game.genre !== selectedGenre) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = game.title.toLowerCase().includes(q);
        const matchSystem = game.systemId.toLowerCase().includes(q);
        const matchGenre = game.genre.toLowerCase().includes(q);
        if (!matchTitle && !matchSystem && !matchGenre) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'playtime') return b.playTimeMinutes - a.playTimeMinutes;
      if (sortBy === 'year') return b.year - a.year;
      return 0;
    });
  }, [roms, selectedSystemId, onlyFavorites, selectedGenre, searchQuery, sortBy]);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 font-mono text-[#DFFF00]">
      {/* Control Strip: Search & Filters */}
      <div className="bg-[#1e003b] border-4 border-[#DFFF00] p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-[4px_4px_0px_#4B0082]">
        {/* Search Bar */}
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#DFFF00]/70">
            <Search size={16} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="SEARCH ROMS / KEYWORDS..."
            className="w-full pl-10 pr-12 py-2 bg-[#120024] border-2 border-[#DFFF00] text-xs text-[#DFFF00] placeholder-[#DFFF00]/40 focus:outline-none focus:bg-[#15002c] font-mono uppercase"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-[#DFFF00] hover:text-[#CCFF00] font-bold"
            >
              [CLEAR]
            </button>
          )}
        </div>

        {/* Filter tags & buttons */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
          {/* Favorites Only Toggle */}
          <button
            onClick={() => {
              retroAudio.playBlip(onlyFavorites ? 400 : 700);
              setOnlyFavorites(!onlyFavorites);
            }}
            className={`flex items-center gap-2 px-3 py-2 border-2 text-xs font-bold uppercase transition-all ${
              onlyFavorites
                ? 'bg-[#DFFF00] text-[#120024] border-[#DFFF00] shadow-[2px_2px_0px_#4B0082]'
                : 'border-[#DFFF00]/60 text-[#DFFF00] bg-[#120024] hover:border-[#DFFF00]'
            }`}
          >
            <Heart size={13} className={onlyFavorites ? 'fill-[#120024]' : ''} />
            <span>FAVORITES</span>
          </button>

          {/* Genre Dropdown */}
          <div className="flex items-center gap-1.5 bg-[#120024] border-2 border-[#DFFF00] px-2.5 py-1.5 text-xs">
            <span className="text-[#DFFF00]/60 hidden sm:inline uppercase">GENRE:</span>
            <select
              value={selectedGenre}
              onChange={(e) => {
                retroAudio.playBlip(500);
                setSelectedGenre(e.target.value);
              }}
              aria-label="Filter by genre"
              className="bg-transparent text-[#DFFF00] font-bold focus:outline-none cursor-pointer uppercase"
            >
              {availableGenres.map(g => (
                <option key={g} value={g} className="bg-[#120024] text-[#DFFF00]">
                  {g}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-1.5 bg-[#120024] border-2 border-[#DFFF00] px-2.5 py-1.5 text-xs">
            <SlidersHorizontal size={13} className="text-[#DFFF00]" />
            <span className="text-[#DFFF00]/60 hidden sm:inline uppercase">SORT:</span>
            <select
              value={sortBy}
              onChange={(e) => {
                retroAudio.playBlip(500);
                setSortBy(e.target.value as 'title' | 'playtime' | 'year');
              }}
              aria-label="Sort games by"
              className="bg-transparent text-[#DFFF00] font-bold focus:outline-none cursor-pointer uppercase"
            >
              <option value="title" className="bg-[#120024] text-[#DFFF00]">NAME (A-Z)</option>
              <option value="playtime" className="bg-[#120024] text-[#DFFF00]">PLAYTIME</option>
              <option value="year" className="bg-[#120024] text-[#DFFF00]">YEAR</option>
            </select>
          </div>
        </div>
      </div>

      {/* Library Overview Header */}
      <div className="flex items-center justify-between text-xs text-[#DFFF00] px-1 font-mono uppercase font-bold">
        <div className="flex items-center gap-2">
          <span className="text-[#DFFF00] tracking-wider">// ROMS CATALOG:</span>
          <span className="text-[#CCFF00]">{filteredRoms.length} GAMES READY</span>
        </div>
        <div className="hidden sm:flex items-center gap-6 text-[10px] text-[#DFFF00]/70">
          <span>STORAGE: 1.2 GB / 642 GB FREE</span>
          <span>AUTOSAVE: ENABLED</span>
        </div>
      </div>

      {/* ROMs Grid */}
      {filteredRoms.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredRoms.map(game => (
            <RomCard
              key={game.id}
              game={game}
              system={systemMap.get(game.systemId)}
              onLaunch={onLaunchGame}
              onToggleFavorite={onToggleFavorite}
              onOpenGameDetails={onOpenGameDetails}
            />
          ))}

          {/* Sleek Dotted Add / Install Core Card */}
          <div
            onClick={() => {
              retroAudio.playCoin();
              onOpenImportRom();
            }}
            className="bg-[#4B0082]/15 border-2 border-dashed border-[#DFFF00]/50 hover:border-[#DFFF00] hover:bg-[#4B0082]/30 p-8 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all min-h-[280px] group text-center select-none"
          >
            <div className="text-4xl text-[#DFFF00]/60 group-hover:text-[#DFFF00] group-hover:scale-110 transition-transform font-black">
              +
            </div>
            <span className="uppercase text-xs text-[#DFFF00]/70 group-hover:text-[#DFFF00] font-bold tracking-wider">
              INSTALL NEW EMULATOR CORE / IMPORT ROM
            </span>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="bg-[#1e003b] border-4 border-[#DFFF00] p-10 text-center space-y-4 my-8">
          <div className="text-4xl text-[#DFFF00] animate-pulse">
            [ ! ]
          </div>
          <h3 className="text-base font-black uppercase text-[#DFFF00] tracking-wider">
            NO MATCHING EMULATION ROMS FOUND
          </h3>
          <p className="text-xs text-[#DFFF00]/70 max-w-md mx-auto leading-relaxed">
            No games match your current filter or search criteria. Try clearing search filters or import a new ROM package into the library.
          </p>
          <div className="pt-2">
            <button
              onClick={() => {
                retroAudio.playCoin();
                onOpenImportRom();
              }}
              className="px-5 py-2.5 bg-[#DFFF00] hover:bg-[#CCFF00] text-[#120024] border-2 border-[#DFFF00] text-xs font-black uppercase inline-flex items-center gap-2 transition-colors shadow-[3px_3px_0px_#4B0082]"
            >
              <Plus size={14} />
              <span>IMPORT NEW ROM (.NES / .GBA / .ZIP)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
