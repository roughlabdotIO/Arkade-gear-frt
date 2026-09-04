import React from 'react';
import { PixelGamepad, PixelSound, PixelCrtMonitor, PixelCpu, PixelCartridge } from '../utils/pixelIcons';
import { retroAudio } from '../utils/audio';

interface NavbarProps {
  crtEnabled: boolean;
  onToggleCrt: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenControllerConfig: () => void;
  onOpenBiosManager: () => void;
  onOpenImportRom: () => void;
  totalGames: number;
  totalSystems: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  crtEnabled,
  onToggleCrt,
  isMuted,
  onToggleMute,
  onOpenControllerConfig,
  onOpenBiosManager,
  onOpenImportRom,
  totalGames,
  totalSystems
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#120024]/95 backdrop-blur-sm border-b-4 border-[#DFFF00] px-4 sm:px-6 py-4 shadow-[0_6px_0px_#4B0082]">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand & System Title */}
        <div className="flex flex-col w-full md:w-auto">
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#DFFF00]/80 font-mono font-bold">
            System.Management.v1.0
          </span>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter uppercase italic text-[#DFFF00] sleek-title">
              arkade GEAR
            </h1>
            <span className="text-[9px] bg-[#4B0082] text-[#DFFF00] px-2 py-0.5 border border-[#DFFF00] uppercase font-bold tracking-widest hidden sm:inline">
              PRO CORE
            </span>
          </div>
        </div>

        {/* Telemetry Status and Controls */}
        <div className="flex flex-wrap items-center justify-end gap-3 w-full md:w-auto">
          {/* Status Badges */}
          <div className="flex items-center gap-2">
            <div className="bg-[#DFFF00] text-[#120024] px-3 py-1 text-xs font-black uppercase tracking-wider">
              STABLE
            </div>
            <div className="border-2 border-[#DFFF00] px-3 py-1 text-xs font-bold text-[#DFFF00] bg-[#1e003b]">
              CPU 24%
            </div>
            <div className="text-[10px] text-[#DFFF00]/70 font-mono hidden lg:block">
              UPTIME: 124:08:42
            </div>
          </div>

          <div className="h-6 w-0.5 bg-[#4B0082] hidden sm:block" />

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* CRT Toggle */}
            <button
              onClick={() => {
                retroAudio.playBlip(700);
                onToggleCrt();
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase transition-all ${
                crtEnabled
                  ? 'bg-[#DFFF00] text-[#120024] border-2 border-[#DFFF00]'
                  : 'border-2 border-[#DFFF00]/60 text-[#DFFF00] hover:border-[#DFFF00]'
              }`}
              title="Toggle CRT Scanlines"
            >
              <PixelCrtMonitor size={14} color={crtEnabled ? '#120024' : '#DFFF00'} />
              <span>CRT: {crtEnabled ? 'ON' : 'OFF'}</span>
            </button>

            {/* Audio Toggle */}
            <button
              onClick={() => {
                retroAudio.playBlip(600);
                onToggleMute();
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 border-2 text-[10px] font-bold uppercase transition-all ${
                !isMuted
                  ? 'border-[#DFFF00] text-[#DFFF00] hover:bg-[#DFFF00] hover:text-[#120024]'
                  : 'border-[#4B0082] text-[#DFFF00]/50'
              }`}
            >
              <PixelSound size={14} muted={isMuted} />
              <span className="hidden sm:inline">{!isMuted ? 'SFX ON' : 'MUTED'}</span>
            </button>

            {/* Controller Config */}
            <button
              onClick={() => {
                retroAudio.playBlip(550);
                onOpenControllerConfig();
              }}
              className="flex items-center gap-1.5 px-3 py-1 border-2 border-[#DFFF00] hover:bg-[#DFFF00] hover:text-[#120024] text-[#DFFF00] text-[10px] font-bold uppercase transition-colors"
            >
              <PixelGamepad size={14} color="currentColor" />
              <span>CONTROLS</span>
            </button>

            {/* BIOS Manager */}
            <button
              onClick={() => {
                retroAudio.playBlip(550);
                onOpenBiosManager();
              }}
              className="flex items-center gap-1.5 px-3 py-1 border-2 border-[#DFFF00] hover:bg-[#DFFF00] hover:text-[#120024] text-[#DFFF00] text-[10px] font-bold uppercase transition-colors"
            >
              <PixelCpu size={14} color="currentColor" />
              <span>BIOS</span>
            </button>

            {/* Add ROM Button */}
            <button
              onClick={() => {
                retroAudio.playCoin();
                onOpenImportRom();
              }}
              className="flex items-center gap-1.5 px-3.5 py-1 bg-[#DFFF00] hover:bg-[#CCFF00] text-[#120024] border-2 border-[#DFFF00] text-[10px] font-black uppercase shadow-[2px_2px_0px_#4B0082] transition-all"
            >
              <PixelCartridge size={14} color="#120024" />
              <span>+ ADD ROM</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
