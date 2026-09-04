import React from 'react';
import { EmulatorSystem, SystemId } from '../types';
import { PixelGamepad, PixelArcadeCabinet, PixelCartridge, PixelDisc, PixelCpu } from '../utils/pixelIcons';
import { retroAudio } from '../utils/audio';

interface SystemsBarProps {
  systems: EmulatorSystem[];
  selectedSystemId: SystemId | 'all';
  onSelectSystem: (id: SystemId | 'all') => void;
  onOpenSystemConfig: (system: EmulatorSystem) => void;
  gameCountsBySystem: Record<string, number>;
}

export const SystemsBar: React.FC<SystemsBarProps> = ({
  systems,
  selectedSystemId,
  onSelectSystem,
  onOpenSystemConfig,
  gameCountsBySystem
}) => {
  const getSystemIcon = (id: SystemId) => {
    switch (id) {
      case 'arcade':
        return <PixelArcadeCabinet size={18} />;
      case 'psx':
        return <PixelDisc size={18} />;
      case 'nes':
      case 'snes':
      case 'gba':
      case 'genesis':
      case 'n64':
      case 'neogeo':
      default:
        return <PixelCartridge size={18} />;
    }
  };

  const selectedSystem = systems.find(s => s.id === selectedSystemId);

  return (
    <section className="bg-[#120024] border-b-4 border-[#DFFF00] p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Systems horizontal tab selector */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#DFFF00] uppercase tracking-widest font-black">
              CONSOLE SELECT:
            </span>
            <span className="text-[10px] text-[#DFFF00]/60 hidden sm:inline uppercase">
              // FILTER ROMS / CONFIGURE ACTIVE CORE
            </span>
          </div>

          {selectedSystem && (
            <button
              onClick={() => {
                retroAudio.playBlip(650);
                onOpenSystemConfig(selectedSystem);
              }}
              className="text-[10px] text-[#DFFF00] bg-[#1e003b] hover:bg-[#DFFF00] hover:text-[#120024] border-2 border-[#DFFF00] px-3 py-1 font-bold uppercase transition-all flex items-center gap-1.5"
            >
              <PixelCpu size={14} color="currentColor" />
              <span>CORE CONFIG: {selectedSystem.shortName}</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
          {/* ALL SYSTEMS BUTTON */}
          <button
            onClick={() => {
              retroAudio.playBlip(500);
              onSelectSystem('all');
            }}
            className={`flex-shrink-0 px-3.5 py-2.5 border-2 text-[10px] font-bold uppercase transition-all flex items-center gap-2.5 ${
              selectedSystemId === 'all'
                ? 'bg-[#DFFF00] text-[#120024] border-[#DFFF00] font-black shadow-[3px_3px_0px_#4B0082]'
                : 'border-[#DFFF00]/50 text-[#DFFF00] bg-[#1e003b] hover:border-[#DFFF00]'
            }`}
          >
            <PixelGamepad size={16} color={selectedSystemId === 'all' ? '#120024' : '#DFFF00'} />
            <span>ALL EMULATORS</span>
            <span
              className={`text-[9px] px-1.5 py-0.5 border ${
                selectedSystemId === 'all'
                  ? 'bg-[#120024] text-[#DFFF00] border-[#120024]'
                  : 'bg-[#4B0082] text-[#DFFF00] border-[#DFFF00]'
              }`}
            >
              {Object.values(gameCountsBySystem).reduce((a: number, b: number) => a + b, 0)}
            </span>
          </button>

          {/* Individual Console Buttons */}
          {systems.map(sys => {
            const isSelected = selectedSystemId === sys.id;
            const count = gameCountsBySystem[sys.id] || 0;

            return (
              <button
                key={sys.id}
                onClick={() => {
                  retroAudio.playBlip(580);
                  onSelectSystem(sys.id);
                }}
                className={`flex-shrink-0 px-3.5 py-2.5 border-2 text-[10px] font-bold uppercase transition-all flex items-center gap-2.5 ${
                  isSelected
                    ? 'bg-[#DFFF00] text-[#120024] border-[#DFFF00] font-black shadow-[3px_3px_0px_#4B0082]'
                    : 'border-[#DFFF00]/50 text-[#DFFF00] bg-[#1e003b] hover:border-[#DFFF00]'
                }`}
              >
                <span className={isSelected ? 'text-[#120024]' : 'text-[#DFFF00]'}>
                  {getSystemIcon(sys.id)}
                </span>
                <span>{sys.shortName}</span>
                <span
                  className={`text-[9px] px-1.5 py-0.5 border ${
                    isSelected
                      ? 'bg-[#120024] text-[#DFFF00] border-[#120024]'
                      : 'bg-[#4B0082] text-[#DFFF00] border-[#DFFF00]'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected System Status Strip */}
        {selectedSystem && (
          <div className="bg-[#1e003b] border-2 border-[#DFFF00] p-3 flex flex-wrap items-center justify-between gap-3 text-[10px] font-mono">
            <div className="flex flex-wrap items-center gap-3 sm:gap-6">
              <div className="flex items-center gap-1.5">
                <span className="text-[#DFFF00]/70 uppercase">SYSTEM:</span>
                <span className="text-[#DFFF00] font-bold">{selectedSystem.name}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[#DFFF00]/70 uppercase">CORE:</span>
                <span className="bg-[#4B0082] text-[#DFFF00] px-2 py-0.5 border border-[#DFFF00] font-bold">
                  {selectedSystem.activeCore}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[#DFFF00]/70 uppercase">BIOS:</span>
                <span
                  className={`px-2 py-0.5 border border-[#DFFF00] font-bold ${
                    selectedSystem.biosStatus === 'VERIFIED'
                      ? 'bg-[#DFFF00] text-[#120024]'
                      : 'bg-[#4B0082] text-[#DFFF00]'
                  }`}
                >
                  {selectedSystem.biosStatus}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="text-[#DFFF00]/70 uppercase">SHADER:</span>
                <span className="text-[#DFFF00] font-bold">{selectedSystem.shader}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[#DFFF00]/70 uppercase">FPS:</span>
                <span className="text-[#CCFF00] font-bold">60.0 LOCKED</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
