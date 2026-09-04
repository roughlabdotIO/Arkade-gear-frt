import React, { useState } from 'react';
import { EmulatorSystem, ShaderPreset, VideoScale } from '../types';
import { PixelCpu } from '../utils/pixelIcons';
import { X, Check, Sliders, ShieldCheck } from 'lucide-react';
import { retroAudio } from '../utils/audio';

interface CoreSettingsModalProps {
  system: EmulatorSystem;
  onSaveSystem: (updatedSystem: EmulatorSystem) => void;
  onClose: () => void;
}

export const CoreSettingsModal: React.FC<CoreSettingsModalProps> = ({
  system,
  onSaveSystem,
  onClose
}) => {
  const [activeCore, setActiveCore] = useState(system.activeCore);
  const [shader, setShader] = useState<ShaderPreset>(system.shader);
  const [scaling, setScaling] = useState<VideoScale>(system.scaling);
  const [overclock, setOverclock] = useState(system.overclock);
  const [rewindBuffer, setRewindBuffer] = useState(system.rewindBuffer);
  const [audioLatencyMs, setAudioLatencyMs] = useState(system.audioLatencyMs);

  const handleSave = () => {
    retroAudio.playCoin();
    onSaveSystem({
      ...system,
      activeCore,
      shader,
      scaling,
      overclock,
      rewindBuffer,
      audioLatencyMs
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#120024]/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto font-mono text-[#DFFF00]">
      <div className="relative w-full max-w-xl bg-[#1e003b] border-4 border-[#DFFF00] shadow-[8px_8px_0px_#4B0082] my-auto">
        {/* Header */}
        <div className="bg-[#120024] border-b-4 border-[#DFFF00] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <PixelCpu size={22} color="#DFFF00" />
            <h2 className="text-xs sm:text-sm font-black text-[#DFFF00] uppercase tracking-wider">
              {system.shortName} // CORE CONFIGURATION
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

        <div className="p-4 sm:p-6 space-y-4 text-xs">
          {/* Active Core Selection */}
          <div>
            <label className="block text-xs text-[#DFFF00] uppercase font-bold mb-2">
              ACTIVE EMULATOR CORE:
            </label>
            <div className="space-y-1.5">
              {system.availableCores.map(core => {
                const isSelected = activeCore === core;
                return (
                  <button
                    key={core}
                    type="button"
                    onClick={() => {
                      retroAudio.playBlip(600);
                      setActiveCore(core);
                    }}
                    className={`w-full p-2.5 border-2 text-left flex items-center justify-between font-mono transition-colors ${
                      isSelected
                        ? 'bg-[#DFFF00] text-[#120024] font-black border-[#DFFF00] shadow-[3px_3px_0px_#4B0082]'
                        : 'bg-[#120024] text-[#DFFF00] border-[#DFFF00]/40 hover:border-[#DFFF00] hover:bg-[#15002c]'
                    }`}
                  >
                    <span className="font-bold">{core}</span>
                    {isSelected && <span className="text-[9px] bg-[#120024] text-[#DFFF00] px-2 py-0.5 border border-[#120024] font-sans font-black">ACTIVE</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Shaders & Video Scaling */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[#DFFF00] uppercase font-bold mb-1">
                VIDEO SHADER:
              </label>
              <select
                value={shader}
                onChange={(e) => setShader(e.target.value as ShaderPreset)}
                className="w-full px-3 py-2 bg-[#120024] border-2 border-[#DFFF00] text-[#DFFF00] focus:outline-none focus:bg-[#15002c] uppercase font-bold cursor-pointer"
              >
                <option value="CRT-Geom">CRT-Geom (Curved & Scanlines)</option>
                <option value="Scanlines 25%">Scanlines 25% Subtle</option>
                <option value="LCD-Grid">LCD-Grid (Handheld Pixel)</option>
                <option value="Pixel-Perfect">Pixel-Perfect Sharp</option>
                <option value="None">None (Raw Output)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-[#DFFF00] uppercase font-bold mb-1">
                VIDEO SCALING:
              </label>
              <select
                value={scaling}
                onChange={(e) => setScaling(e.target.value as VideoScale)}
                className="w-full px-3 py-2 bg-[#120024] border-2 border-[#DFFF00] text-[#DFFF00] focus:outline-none focus:bg-[#15002c] uppercase font-bold cursor-pointer"
              >
                <option value="1x">1x Native Resolution</option>
                <option value="2x">2x Double Integer Scale</option>
                <option value="3x">3x Triple Integer Scale</option>
                <option value="Full-4:3">Full Window (Aspect 4:3)</option>
              </select>
            </div>
          </div>

          {/* Overclock & Rewind Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                retroAudio.playBlip(550);
                setOverclock(!overclock);
              }}
              className={`p-2.5 border-2 text-left flex items-center justify-between transition-colors ${
                overclock ? 'bg-[#DFFF00] text-[#120024] border-[#DFFF00] font-black' : 'bg-[#120024] text-[#DFFF00] border-[#DFFF00]/50'
              }`}
            >
              <span className="text-[11px] font-bold">CPU OVERCLOCK</span>
              <span className="font-mono">{overclock ? '[ON]' : '[OFF]'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                retroAudio.playBlip(550);
                setRewindBuffer(!rewindBuffer);
              }}
              className={`p-2.5 border-2 text-left flex items-center justify-between transition-colors ${
                rewindBuffer ? 'bg-[#DFFF00] text-[#120024] border-[#DFFF00] font-black' : 'bg-[#120024] text-[#DFFF00] border-[#DFFF00]/50'
              }`}
            >
              <span className="text-[11px] font-bold">REWIND BUFFER</span>
              <span className="font-mono">{rewindBuffer ? '[ON]' : '[OFF]'}</span>
            </button>
          </div>

          {/* Audio Latency Slider */}
          <div className="bg-[#120024] border-2 border-[#DFFF00] p-3.5">
            <div className="flex justify-between text-[#DFFF00] mb-1.5 font-bold">
              <span>AUDIO BUFFER LATENCY:</span>
              <span className="text-[#DFFF00] font-mono font-black">{audioLatencyMs} MS</span>
            </div>
            <input
              type="range"
              min="8"
              max="64"
              step="4"
              value={audioLatencyMs}
              onChange={(e) => setAudioLatencyMs(Number(e.target.value))}
              className="w-full accent-[#DFFF00] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#DFFF00]/50 mt-1 font-mono">
              <span>8ms (Ultra Low)</span>
              <span>32ms (Balanced)</span>
              <span>64ms (Max Buffer)</span>
            </div>
          </div>

          {/* BIOS Status Info */}
          <div className="bg-[#120024] border-2 border-[#DFFF00] p-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShieldCheck size={18} className="text-[#CCFF00]" />
              <div>
                <div className="text-[#DFFF00] font-black">BIOS FIRMWARE: {system.biosFile}</div>
                <div className="text-[10px] text-[#DFFF00]/60">Verified MD5 hash on boot sequence</div>
              </div>
            </div>
            <span className="bg-[#DFFF00] text-[#120024] px-2.5 py-0.5 border border-[#DFFF00] font-black text-[10px]">
              {system.biosStatus}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t-2 border-[#DFFF00]/30">
            <button
              type="button"
              onClick={() => {
                retroAudio.playCancel();
                onClose();
              }}
              className="px-4 py-2 bg-[#120024] hover:bg-[#DFFF00] hover:text-[#120024] text-[#DFFF00] border-2 border-[#DFFF00] text-xs font-bold transition-colors"
            >
              CANCEL
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 bg-[#DFFF00] hover:bg-[#CCFF00] text-[#120024] border-2 border-[#DFFF00] text-xs font-black shadow-[3px_3px_0px_#4B0082] flex items-center gap-2 transition-colors"
            >
              <Check size={13} />
              <span>APPLY CORE SETTINGS</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
