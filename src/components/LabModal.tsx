import React, { useEffect, useState } from 'react';
import { RomGame } from '../types';
import { X, FlaskConical, CreditCard, Check, AlertCircle, Loader2 } from 'lucide-react';
import { retroAudio } from '../utils/audio';
import { getReaderStatus, writeCard } from '../utils/cardWriter';

interface LabModalProps {
  roms: RomGame[];
  onClose: () => void;
}

type WriteState = 'idle' | 'waiting-for-card' | 'success' | 'error';

export const LabModal: React.FC<LabModalProps> = ({ roms, onClose }) => {
  const launchableRoms = roms.filter(r => Boolean(r.serverFileName));
  const [selectedRomId, setSelectedRomId] = useState(launchableRoms[0]?.id ?? '');
  const [readerOnline, setReaderOnline] = useState<boolean | null>(null);
  const [readerName, setReaderName] = useState<string | null>(null);
  const [writeState, setWriteState] = useState<WriteState>('idle');
  const [resultMessage, setResultMessage] = useState('');

  useEffect(() => {
    getReaderStatus().then(status => {
      setReaderOnline(status.ok);
      setReaderName(status.reader || null);
      if (!status.ok) setResultMessage(status.error || 'Reader not available');
    });
  }, []);

  const selectedRom = launchableRoms.find(r => r.id === selectedRomId);

  const handleWrite = async () => {
    if (!selectedRom?.serverFileName) return;
    const launchUrl = `${window.location.origin}${window.location.pathname}?launch=${encodeURIComponent(selectedRom.serverFileName)}`;

    retroAudio.playBlip(600);
    setWriteState('waiting-for-card');
    setResultMessage('');

    const result = await writeCard(launchUrl);

    if (result.ok) {
      retroAudio.playPowerUp();
      setWriteState('success');
      setResultMessage(`UID ${result.uid} - ${result.bytesWritten} bytes written`);
    } else {
      retroAudio.playCancel();
      setWriteState('error');
      setResultMessage(result.error || 'Write failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#120024]/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto font-mono text-[#DFFF00]">
      <div className="relative w-full max-w-xl bg-[#1e003b] border-4 border-[#DFFF00] shadow-[8px_8px_0px_#4B0082] my-auto">
        {/* Header */}
        <div className="bg-[#120024] border-b-4 border-[#DFFF00] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <FlaskConical size={20} color="#DFFF00" />
            <h2 className="text-xs sm:text-sm font-black text-[#DFFF00] uppercase tracking-wider">
              LAB // WRITE PHYSICAL CARD
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
          {/* Reader status */}
          <div
            className={`border-2 p-2.5 text-[10px] font-bold uppercase flex items-center gap-2 ${
              readerOnline
                ? 'border-[#CCFF00] text-[#CCFF00] bg-[#120024]'
                : 'border-[#DFFF00]/50 text-[#DFFF00]/70 bg-[#120024]'
            }`}
          >
            <CreditCard size={14} />
            {readerOnline === null && <span>Checking for card reader...</span>}
            {readerOnline === true && <span>Reader connected: {readerName}</span>}
            {readerOnline === false && (
              <span>No reader found - start card-writer/server.py on this PC first</span>
            )}
          </div>

          {launchableRoms.length === 0 ? (
            <p className="text-xs text-[#DFFF00]/70">
              No launchable ROMs in the library yet - import one first.
            </p>
          ) : (
            <>
              {/* Game selector */}
              <div>
                <label className="block text-xs text-[#DFFF00] uppercase font-bold mb-1">
                  GAME TO WRITE:
                </label>
                <select
                  value={selectedRomId}
                  onChange={(e) => {
                    setSelectedRomId(e.target.value);
                    setWriteState('idle');
                    setResultMessage('');
                  }}
                  className="w-full px-3 py-2 bg-[#120024] border-2 border-[#DFFF00] text-xs text-[#DFFF00] focus:outline-none focus:bg-[#15002c] uppercase font-bold cursor-pointer"
                >
                  {launchableRoms.map(r => (
                    <option key={r.id} value={r.id} className="bg-[#120024] text-[#DFFF00]">
                      {r.title} ({r.systemId.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              {/* Write action + status */}
              <div className="bg-[#120024] border-2 border-[#DFFF00] p-4 text-center space-y-3">
                {writeState === 'waiting-for-card' ? (
                  <div className="flex flex-col items-center gap-2 text-[#CCFF00]">
                    <Loader2 size={24} className="animate-spin" />
                    <span className="text-xs font-black uppercase animate-pulse">
                      Tap a blank NFC card on the reader...
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={handleWrite}
                    disabled={!readerOnline || !selectedRom}
                    className="w-full px-5 py-2.5 bg-[#DFFF00] hover:bg-[#CCFF00] disabled:opacity-40 disabled:cursor-not-allowed text-[#120024] border-2 border-[#DFFF00] text-xs font-black shadow-[3px_3px_0px_#4B0082] flex items-center justify-center gap-2 transition-colors"
                  >
                    <CreditCard size={14} />
                    <span>WRITE TO CARD</span>
                  </button>
                )}

                {writeState === 'success' && (
                  <div className="flex items-center justify-center gap-1.5 text-[#CCFF00] text-[10px] font-bold">
                    <Check size={14} />
                    <span>{resultMessage}</span>
                  </div>
                )}
                {writeState === 'error' && (
                  <div className="flex items-center justify-center gap-1.5 text-[#DFFF00] text-[10px] font-bold">
                    <AlertCircle size={14} />
                    <span>{resultMessage}</span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
