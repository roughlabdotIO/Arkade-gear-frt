import React, { useState, useEffect } from 'react';
import { EmulatorSystem, RomGame, BiosRecord, ControllerMapping, SystemId } from './types';
import {
  INITIAL_SYSTEMS,
  INITIAL_ROMS,
  INITIAL_BIOS_RECORDS,
  DEFAULT_KEY_MAPPING
} from './data/mockEmulators';
import { Navbar } from './components/Navbar';
import { SystemsBar } from './components/SystemsBar';
import { RomLibrary } from './components/RomLibrary';
import { EmulatorPlayerModal } from './components/EmulatorPlayerModal';
import { ControllerConfigModal } from './components/ControllerConfigModal';
import { BiosManagerModal } from './components/BiosManagerModal';
import { ImportRomModal } from './components/ImportRomModal';
import { CoreSettingsModal } from './components/CoreSettingsModal';
import { GameDetailsModal } from './components/GameDetailsModal';
import { retroAudio } from './utils/audio';
import { PixelGamepad, PixelCrtMonitor, PixelCpu, PixelCartridge } from './utils/pixelIcons';
import { listServerRoms } from './utils/api';
import { detectSystemFromFilename } from './utils/detectSystem';
import { detectRegionFromFilename } from './utils/detectRegion';

export default function App() {
  // Systems & ROM State
  const [systems, setSystems] = useState<EmulatorSystem[]>(() => {
    const saved = localStorage.getItem('arkade_gear_systems');
    return saved ? JSON.parse(saved) : INITIAL_SYSTEMS;
  });

  const [roms, setRoms] = useState<RomGame[]>(() => {
    const saved = localStorage.getItem('arkade_gear_roms');
    const parsed: RomGame[] = saved ? JSON.parse(saved) : INITIAL_ROMS;
    // Drop any leftover mock/demo entries (they never have a serverFileName) from previously cached state.
    return parsed.filter(r => Boolean(r.serverFileName));
  });

  const [biosRecords, setBiosRecords] = useState<BiosRecord[]>(() => {
    const saved = localStorage.getItem('arkade_gear_bios');
    return saved ? JSON.parse(saved) : INITIAL_BIOS_RECORDS;
  });

  const [controllerMapping, setControllerMapping] = useState<ControllerMapping>(() => {
    const saved = localStorage.getItem('arkade_gear_controls');
    return saved ? JSON.parse(saved) : DEFAULT_KEY_MAPPING;
  });

  // UI States
  const [selectedSystemId, setSelectedSystemId] = useState<SystemId | 'all'>('all');
  const [crtEnabled, setCrtEnabled] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Modals
  const [runningGame, setRunningGame] = useState<RomGame | null>(null);
  const [selectedGameForDetails, setSelectedGameForDetails] = useState<RomGame | null>(null);
  const [selectedSystemForConfig, setSelectedSystemForConfig] = useState<EmulatorSystem | null>(null);
  const [isControllerConfigOpen, setIsControllerConfigOpen] = useState<boolean>(false);
  const [isBiosManagerOpen, setIsBiosManagerOpen] = useState<boolean>(false);
  const [isImportRomOpen, setIsImportRomOpen] = useState<boolean>(false);

  // Persist state updates to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('arkade_gear_systems', JSON.stringify(systems));
    } catch {}
  }, [systems]);

  useEffect(() => {
    try {
      localStorage.setItem('arkade_gear_roms', JSON.stringify(roms));
    } catch {}
  }, [roms]);

  useEffect(() => {
    try {
      localStorage.setItem('arkade_gear_bios', JSON.stringify(biosRecords));
    } catch {}
  }, [biosRecords]);

  useEffect(() => {
    try {
      localStorage.setItem('arkade_gear_controls', JSON.stringify(controllerMapping));
    } catch {}
  }, [controllerMapping]);

  // Reconcile library with ROMs actually stored on the backend
  useEffect(() => {
    listServerRoms()
      .then(serverRoms => {
        setRoms(prev => {
          const known = new Set(prev.map(r => r.serverFileName).filter(Boolean));
          const additions: RomGame[] = serverRoms
            .filter(sr => !known.has(sr.name))
            .map(sr => {
              const cleanTitle = sr.name
                .replace(/\.[^/.]+$/, '')
                .replace(/_/g, ' ')
                .trim();
              return {
                id: `rom-server-${sr.name}`,
                title: cleanTitle || sr.name,
                systemId: detectSystemFromFilename(sr.name),
                size: sr.size > 1024 * 1024
                  ? `${(sr.size / (1024 * 1024)).toFixed(1)} MB`
                  : `${Math.max(1, Math.round(sr.size / 1024))} KB`,
                region: detectRegionFromFilename(sr.name),
                year: new Date().getFullYear(),
                genre: 'Uncategorized',
                rating: 0,
                favorite: false,
                playTimeMinutes: 0,
                saveStatesCount: 0,
                serverFileName: sr.name,
                pixelArtIcon: 'cartridge',
                pixelThemeColor: '#dfff00',
                description: 'Imported from the server ROM library.'
              };
            });
          return additions.length > 0 ? [...additions, ...prev] : prev;
        });
      })
      .catch(() => {
        // Backend unreachable (e.g. offline dev) - keep whatever is already in the local library.
      });
  }, []);

  // Audio mute handler
  const handleToggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    retroAudio.setMuted(nextMute);
  };

  // ROM actions
  const handleToggleFavorite = (gameId: string) => {
    setRoms(prev =>
      prev.map(r => (r.id === gameId ? { ...r, favorite: !r.favorite } : r))
    );
  };

  const handleAddRom = (newRom: RomGame) => {
    setRoms(prev => [newRom, ...prev]);
  };

  const handleDeleteRom = (gameId: string) => {
    setRoms(prev => prev.filter(r => r.id !== gameId));
    if (selectedGameForDetails?.id === gameId) {
      setSelectedGameForDetails(null);
    }
  };

  const handleUpdatePlaytime = (gameId: string, addedMinutes: number) => {
    setRoms(prev =>
      prev.map(r =>
        r.id === gameId
          ? {
              ...r,
              playTimeMinutes: r.playTimeMinutes + addedMinutes,
              lastPlayed: 'Just now'
            }
          : r
      )
    );
  };

  const handleSaveSystem = (updatedSystem: EmulatorSystem) => {
    setSystems(prev =>
      prev.map(s => (s.id === updatedSystem.id ? updatedSystem : s))
    );
  };

  // Count games per system
  const gameCountsBySystem = roms.reduce((acc, game) => {
    acc[game.systemId] = (acc[game.systemId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-[#120024] text-[#DFFF00] font-mono relative selection:bg-[#DFFF00] selection:text-[#120024] pb-16">
      {/* Optional Global Subtle CRT Scanlines */}
      {crtEnabled && (
        <div className="fixed inset-0 crt-scanlines crt-flicker pointer-events-none z-30" />
      )}

      {/* Top Navbar */}
      <Navbar
        crtEnabled={crtEnabled}
        onToggleCrt={() => setCrtEnabled(!crtEnabled)}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onOpenControllerConfig={() => setIsControllerConfigOpen(true)}
        onOpenBiosManager={() => setIsBiosManagerOpen(true)}
        onOpenImportRom={() => setIsImportRomOpen(true)}
        totalGames={roms.length}
        totalSystems={systems.length}
      />

      {/* Hero Welcome & Storage Management Bar */}
      <section className="bg-[#1e003b] border-b-4 border-[#DFFF00] px-4 py-5 shadow-[inset_0_0_30px_rgba(18,0,36,0.8)]">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6">
          <div className="space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] bg-[#DFFF00] text-[#120024] font-black px-2.5 py-0.5 uppercase tracking-widest">
                CORE SYSTEM V1.0 // ONLINE
              </span>
              <span className="text-[10px] border border-[#DFFF00]/50 text-[#DFFF00] px-2 py-0.5 font-bold uppercase">
                LOW-LATENCY WEBAUDIO & CANVAS
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight uppercase italic text-[#DFFF00]">
              SELECT EMULATOR & LAUNCH RETRO ARCHITECTURE
            </h2>
            <p className="text-xs text-[#DFFF00]/70 max-w-2xl leading-relaxed">
              Arkade Gear multi-system 8-bit hub: manage battery saves, remap gamepad controls, verify BIOS signatures, and execute games inside high-precision emulator cores.
            </p>
          </div>

          {/* Sleek Storage Status & Hardware Widget */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 shrink-0">
            {/* Storage Status (from Sleek Interface design) */}
            <div className="p-3.5 border-l-4 border-[#DFFF00] bg-[#4B0082]/30 min-w-[240px]">
              <div className="flex justify-between items-center text-xs mb-1.5 opacity-90 uppercase font-black tracking-wider text-[#DFFF00]">
                <span>Storage Status</span>
                <span className="text-[#CCFF00]">65% USED</span>
              </div>
              <div className="w-full h-3 border-2 border-[#DFFF00] p-0.5 bg-[#120024]">
                <div className="h-full bg-[#DFFF00] w-[65%]" />
              </div>
              <div className="flex justify-between text-[10px] mt-1.5 text-[#DFFF00]/70 font-mono">
                <span className="uppercase">642 GB Free</span>
                <span>1 TB Total</span>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="bg-[#120024] border-2 border-[#DFFF00] p-3 text-xs font-mono text-[#DFFF00] flex items-center justify-around sm:justify-start gap-4">
              <div className="text-center">
                <div className="text-[9px] text-[#DFFF00]/60 uppercase">CORES</div>
                <div className="text-[#DFFF00] text-sm font-black">{systems.length}</div>
              </div>
              <div className="h-6 w-0.5 bg-[#4B0082]" />
              <div className="text-center">
                <div className="text-[9px] text-[#DFFF00]/60 uppercase">ROMS</div>
                <div className="text-[#DFFF00] text-sm font-black">{roms.length}</div>
              </div>
              <div className="h-6 w-0.5 bg-[#4B0082]" />
              <div className="text-center">
                <div className="text-[9px] text-[#DFFF00]/60 uppercase">FPS</div>
                <div className="text-[#CCFF00] text-sm font-black">60.0</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Consoles & Systems Selector */}
      <SystemsBar
        systems={systems}
        selectedSystemId={selectedSystemId}
        onSelectSystem={setSelectedSystemId}
        onOpenSystemConfig={(system) => setSelectedSystemForConfig(system)}
        gameCountsBySystem={gameCountsBySystem}
      />

      {/* ROM Library Grid */}
      <main className="pb-8">
        <RomLibrary
          roms={roms}
          systems={systems}
          selectedSystemId={selectedSystemId}
          onLaunchGame={(game) => setRunningGame(game)}
          onToggleFavorite={handleToggleFavorite}
          onOpenGameDetails={(game) => setSelectedGameForDetails(game)}
          onOpenImportRom={() => setIsImportRomOpen(true)}
        />
      </main>

      {/* Sleek Interface Bottom Control Bar & Insert Coin Strip */}
      <footer className="fixed bottom-0 left-0 right-0 z-30 bg-[#120024] border-t-4 border-[#DFFF00] px-4 sm:px-6 py-2.5 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs font-mono select-none shadow-[0_-4px_0px_#4B0082]">
        <div className="flex flex-wrap items-center gap-4 sm:gap-8 text-[10px] sm:text-xs uppercase font-bold tracking-widest text-[#DFFF00]">
          <div>[A] SELECT</div>
          <div>[B] BACK</div>
          <div>[X] DETAILS</div>
          <div>[Y] OPTIONS</div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-3 text-[10px] text-[#DFFF00]/60">
            <span>CORE: ACTIVE</span>
            <span>•</span>
            <span>BUFFER: 16MS</span>
          </div>

          <button
            onClick={() => retroAudio.playCoin()}
            className="bg-[#CCFF00] hover:bg-[#DFFF00] text-[#120024] px-4 py-1 font-black text-xs sm:text-sm italic uppercase tracking-wider shadow-[2px_2px_0px_#4B0082] transition-all cursor-pointer active:translate-y-0.5"
          >
            INSERT COIN TO CONTINUE
          </button>
        </div>
      </footer>

      {/* Active Running Emulator Modal */}
      {runningGame && (
        <EmulatorPlayerModal
          game={runningGame}
          system={systems.find(s => s.id === runningGame.systemId) || systems[0]}
          onClose={() => setRunningGame(null)}
          onUpdatePlaytime={handleUpdatePlaytime}
        />
      )}

      {/* Game Details & Save States Modal */}
      {selectedGameForDetails && (
        <GameDetailsModal
          game={selectedGameForDetails}
          system={systems.find(s => s.id === selectedGameForDetails.systemId)}
          onLaunch={(game) => setRunningGame(game)}
          onToggleFavorite={handleToggleFavorite}
          onDeleteRom={handleDeleteRom}
          onClose={() => setSelectedGameForDetails(null)}
        />
      )}

      {/* Core Configuration Modal */}
      {selectedSystemForConfig && (
        <CoreSettingsModal
          system={selectedSystemForConfig}
          onSaveSystem={handleSaveSystem}
          onClose={() => setSelectedSystemForConfig(null)}
        />
      )}

      {/* Controller Remapper Modal */}
      {isControllerConfigOpen && (
        <ControllerConfigModal
          mapping={controllerMapping}
          onSaveMapping={setControllerMapping}
          onClose={() => setIsControllerConfigOpen(false)}
        />
      )}

      {/* BIOS & Firmware Manager Modal */}
      {isBiosManagerOpen && (
        <BiosManagerModal
          biosRecords={biosRecords}
          onUpdateBios={setBiosRecords}
          onClose={() => setIsBiosManagerOpen(false)}
        />
      )}

      {/* Import / Upload ROM Modal */}
      {isImportRomOpen && (
        <ImportRomModal
          systems={systems}
          onAddRom={handleAddRom}
          onClose={() => setIsImportRomOpen(false)}
        />
      )}
    </div>
  );
}
