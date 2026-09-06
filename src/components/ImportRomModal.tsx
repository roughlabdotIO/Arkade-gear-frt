import React, { useState } from 'react';
import { RomGame, SystemId, EmulatorSystem } from '../types';
import { PixelCartridge } from '../utils/pixelIcons';
import { X, Upload, Check, AlertCircle } from 'lucide-react';
import { retroAudio } from '../utils/audio';
import { uploadRom } from '../utils/api';
import { detectSystemFromFilename } from '../utils/detectSystem';
import { detectRegionFromFilename } from '../utils/detectRegion';

interface ImportRomModalProps {
  systems: EmulatorSystem[];
  /** When set (a specific console panel is selected, not "all"), imports are pinned to this system instead of guessing it from the filename. */
  lockedSystemId?: SystemId;
  onAddRom: (newRom: RomGame) => void;
  onClose: () => void;
}

export const ImportRomModal: React.FC<ImportRomModalProps> = ({
  systems,
  lockedSystemId,
  onAddRom,
  onClose
}) => {
  const [title, setTitle] = useState('');
  const [systemId, setSystemId] = useState<SystemId>(lockedSystemId ?? 'nes');
  const [region, setRegion] = useState<'USA' | 'EUR' | 'JPN' | 'WORLD'>('USA');
  const [genre, setGenre] = useState('Platformer');
  const [year, setYear] = useState(1990);
  const [size, setSize] = useState('512 KB');
  const [fileName, setFileName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    setFileName(file.name);
    setSelectedFile(file);
    setError(null);

    // derive clean title from filename
    const cleanTitle = file.name
      .replace(/\.[^/.]+$/, '')
      .replace(/_/g, ' ')
      .replace(/\([^)]*\)|\[[^\]]*\]/g, '')
      .trim();

    setTitle(cleanTitle || 'Custom Retro Rom');
    // A console panel already tells us the target system with certainty - don't let a filename
    // guess (e.g. ".zip" matching several systems) override it.
    if (!lockedSystemId) {
      setSystemId(detectSystemFromFilename(file.name));
    }
    setRegion(detectRegionFromFilename(file.name));

    // format file size
    if (file.size > 1024 * 1024) {
      setSize(`${(file.size / (1024 * 1024)).toFixed(1)} MB`);
    } else {
      setSize(`${Math.max(1, Math.round(file.size / 1024))} KB`);
    }

    retroAudio.playBlip(750);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('PLEASE PROVIDE A ROM TITLE');
      retroAudio.playCancel();
      return;
    }
    if (!selectedFile) {
      setError('PLEASE SELECT A ROM FILE');
      retroAudio.playCancel();
      return;
    }

    setError(null);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const uploaded = await uploadRom(selectedFile, setUploadProgress);

      const newRom: RomGame = {
        id: `rom-custom-${Date.now()}`,
        title: title.trim(),
        systemId,
        size: size || '1.0 MB',
        region,
        year: Number(year) || 1992,
        genre,
        rating: 5,
        favorite: true,
        playTimeMinutes: 0,
        saveStatesCount: 0,
        serverFileName: uploaded.name,
        pixelArtIcon: systemId === 'arcade' ? 'arcade' : systemId === 'psx' ? 'disc' : 'cartridge',
        pixelThemeColor: '#dfff00',
        description: `User-imported cartridge for ${systemId.toUpperCase()} system. Ready for emulation.`
      };

      retroAudio.playPowerUp();
      onAddRom(newRom);
      onClose();
    } catch (err) {
      retroAudio.playCancel();
      setError(err instanceof Error ? err.message.toUpperCase() : 'UPLOAD FAILED');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#120024]/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto font-mono text-[#DFFF00]">
      <div className="relative w-full max-w-xl bg-[#1e003b] border-4 border-[#DFFF00] shadow-[8px_8px_0px_#4B0082] my-auto">
        {/* Header */}
        <div className="bg-[#120024] border-b-4 border-[#DFFF00] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <PixelCartridge size={22} color="#DFFF00" />
            <h2 className="text-xs sm:text-sm font-black text-[#DFFF00] uppercase tracking-wider">
              IMPORT & REGISTER ROM // VIRTUAL DRIVE
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

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          {error && (
            <div className="bg-[#120024] border-2 border-[#DFFF00] p-3 text-xs text-[#DFFF00] font-mono flex items-center gap-2 shadow-[2px_2px_0px_#4B0082]">
              <AlertCircle size={14} className="text-[#DFFF00]" />
              <span className="font-bold">{error}</span>
            </div>
          )}

          {/* File Upload Drop Area */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              handleFiles(e.dataTransfer.files);
            }}
            onClick={() => document.getElementById('rom-file-input')?.click()}
            className="border-2 border-dashed border-[#DFFF00] bg-[#120024] p-5 text-center cursor-pointer hover:bg-[#15002c] transition-colors group"
          >
            <input
              id="rom-file-input"
              type="file"
              onChange={(e) => handleFiles(e.target.files)}
              className="hidden"
              accept=".nes,.smc,.sfc,.gba,.bin,.iso,.zip,.md,.z64,.chd"
            />
            <Upload size={24} className="mx-auto text-[#DFFF00] mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-black uppercase text-[#DFFF00] mb-1">
              {fileName ? `LOADED: ${fileName}` : 'CLICK TO BROWSE OR DRAG ROM HERE'}
            </div>
            <p className="text-[10px] text-[#DFFF00]/60 font-mono">
              SUPPORTED: .NES, .SMC, .GBA, .MD, .ISO, .ZIP, .Z64
            </p>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs text-[#DFFF00] uppercase font-bold mb-1">
              GAME TITLE:
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="E.G., CHRONO TRIGGER, MEGA MAN X..."
              className="w-full px-3 py-2 bg-[#120024] border-2 border-[#DFFF00] text-xs text-[#DFFF00] placeholder-[#DFFF00]/40 focus:outline-none focus:bg-[#15002c] font-mono uppercase font-bold"
              required
            />
          </div>

          {/* System & Genre */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[#DFFF00] uppercase font-bold mb-1">
                TARGET EMULATOR:
                {lockedSystemId && (
                  <span className="text-[#CCFF00] normal-case font-normal"> (locked to the selected console panel)</span>
                )}
              </label>
              <select
                value={systemId}
                disabled={Boolean(lockedSystemId)}
                onChange={(e) => setSystemId(e.target.value as SystemId)}
                className="w-full px-3 py-2 bg-[#120024] border-2 border-[#DFFF00] text-xs text-[#DFFF00] focus:outline-none focus:bg-[#15002c] uppercase font-bold cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {systems.map(s => (
                  <option key={s.id} value={s.id} className="bg-[#120024] text-[#DFFF00]">
                    {s.name} ({s.shortName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-[#DFFF00] uppercase font-bold mb-1">
                GENRE:
              </label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full px-3 py-2 bg-[#120024] border-2 border-[#DFFF00] text-xs text-[#DFFF00] focus:outline-none focus:bg-[#15002c] uppercase font-bold cursor-pointer"
              >
                {['Platformer', 'Action Adventure', 'JRPG', 'RPG', 'Fighting', 'Metroidvania', 'Beat-em-up', 'Mode-7 Racing', 'Shmup', 'Puzzle'].map(g => (
                  <option key={g} value={g} className="bg-[#120024] text-[#DFFF00]">
                    {g}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Region & Release Year */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[#DFFF00] uppercase font-bold mb-1">
                REGION:
              </label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value as 'USA' | 'EUR' | 'JPN' | 'WORLD')}
                className="w-full px-3 py-2 bg-[#120024] border-2 border-[#DFFF00] text-xs text-[#DFFF00] focus:outline-none focus:bg-[#15002c] uppercase font-bold cursor-pointer"
              >
                <option value="USA">USA (NTSC-U)</option>
                <option value="EUR">EUROPE (PAL)</option>
                <option value="JPN">JAPAN (NTSC-J)</option>
                <option value="WORLD">WORLD / MULTI</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-[#DFFF00] uppercase font-bold mb-1">
                RELEASE YEAR:
              </label>
              <input
                type="number"
                min="1975"
                max="2008"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#120024] border-2 border-[#DFFF00] text-xs text-[#DFFF00] focus:outline-none focus:bg-[#15002c] font-mono font-bold"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t-2 border-[#DFFF00]/30">
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
              type="submit"
              disabled={isUploading}
              className="px-5 py-2 bg-[#DFFF00] hover:bg-[#CCFF00] disabled:opacity-60 disabled:cursor-not-allowed text-[#120024] border-2 border-[#DFFF00] text-xs font-black shadow-[3px_3px_0px_#4B0082] flex items-center gap-2 transition-colors"
            >
              <Check size={13} />
              <span>{isUploading ? `UPLOADING... ${uploadProgress}%` : 'INSTALL TO LIBRARY'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
