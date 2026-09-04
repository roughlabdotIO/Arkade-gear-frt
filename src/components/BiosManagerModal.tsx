import React, { useState } from 'react';
import { BiosRecord } from '../types';
import { PixelCpu } from '../utils/pixelIcons';
import { X, CheckCircle2, AlertTriangle, Upload, HardDrive, RefreshCw } from 'lucide-react';
import { retroAudio } from '../utils/audio';

interface BiosManagerModalProps {
  biosRecords: BiosRecord[];
  onUpdateBios: (updatedRecords: BiosRecord[]) => void;
  onClose: () => void;
}

export const BiosManagerModal: React.FC<BiosManagerModalProps> = ({
  biosRecords,
  onUpdateBios,
  onClose
}) => {
  const [records, setRecords] = useState<BiosRecord[]>(biosRecords);
  const [notification, setNotification] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSimulateInstall = (filename: string) => {
    retroAudio.playSaveChime();
    setRecords(prev =>
      prev.map(b => (b.filename === filename ? { ...b, status: 'VERIFIED' } : b))
    );
    setNotification(`INSTALLED AND VERIFIED MD5: ${filename}`);
  };

  const handleVerifyAll = () => {
    retroAudio.playBlip(700);
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setNotification('ALL BIOS FILES PASSED INTEGRITY CHECK [MD5 OK]');
      retroAudio.playCoin();
    }, 800);
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files) as File[];
    if (files.length > 0) {
      const file = files[0];
      retroAudio.playCoin();
      setNotification(`UPLOADED ${file.name} (${(file.size / 1024).toFixed(1)} KB) - BIOS VALIDATED`);
      setRecords(prev =>
        prev.map(b => (b.filename.toLowerCase() === file.name.toLowerCase() ? { ...b, status: 'VERIFIED' } : b))
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#120024]/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto font-mono text-[#DFFF00]">
      <div className="relative w-full max-w-3xl bg-[#1e003b] border-4 border-[#DFFF00] shadow-[8px_8px_0px_#4B0082] my-auto">
        {/* Header */}
        <div className="bg-[#120024] border-b-4 border-[#DFFF00] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <PixelCpu size={22} color="#DFFF00" />
            <h2 className="text-xs sm:text-sm font-black text-[#DFFF00] uppercase tracking-wider">
              SYSTEM BIOS & FIRMWARE MANAGER
            </h2>
          </div>
          <button
            onClick={() => {
              retroAudio.playCancel();
              onUpdateBios(records);
              onClose();
            }}
            className="p-1.5 border-2 border-[#DFFF00] hover:bg-[#DFFF00] hover:text-[#120024] text-[#DFFF00] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4">
          {notification && (
            <div className="bg-[#120024] border-2 border-[#DFFF00] p-3 text-xs text-[#DFFF00] font-mono flex items-center justify-between shadow-[2px_2px_0px_#4B0082]">
              <span className="font-bold">{notification}</span>
              <button
                onClick={() => setNotification(null)}
                className="text-[#DFFF00] hover:text-[#CCFF00] font-bold"
              >
                [X]
              </button>
            </div>
          )}

          <p className="text-xs text-[#DFFF00]/70 leading-relaxed">
            Certain emulator cores require original console BIOS firmware dumps to boot games accurately and pass hardware security checks.
          </p>

          {/* BIOS Records Table */}
          <div className="border-2 border-[#DFFF00] bg-[#120024] overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#4B0082]/30 border-b-2 border-[#DFFF00] text-[#DFFF00]">
                <tr>
                  <th className="p-2.5 font-bold uppercase">SYSTEM</th>
                  <th className="p-2.5 font-bold uppercase">BIOS FILE</th>
                  <th className="p-2.5 font-bold uppercase">STATUS</th>
                  <th className="p-2.5 font-bold uppercase hidden sm:table-cell">MD5 CHECKSUM</th>
                  <th className="p-2.5 font-bold uppercase text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DFFF00]/20">
                {records.map(b => (
                  <tr key={b.filename} className="hover:bg-[#15002c] transition-colors">
                    <td className="p-2.5 font-bold uppercase text-[#DFFF00]">
                      {b.systemId}
                    </td>
                    <td className="p-2.5 font-mono text-[#DFFF00]/90">
                      <div className="font-black text-[#DFFF00]">{b.filename}</div>
                      <div className="text-[9px] text-[#DFFF00]/60">{b.description}</div>
                    </td>
                    <td className="p-2.5">
                      <span
                        className={`px-2 py-0.5 border font-bold uppercase text-[9px] ${
                          b.status === 'VERIFIED'
                            ? 'bg-[#DFFF00] text-[#120024] border-[#DFFF00]'
                            : b.status === 'OPTIONAL'
                            ? 'bg-[#120024] text-[#DFFF00] border-[#DFFF00]/60'
                            : 'bg-[#4B0082] text-[#DFFF00] border-[#DFFF00]'
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="p-2.5 font-mono text-[#DFFF00]/60 hidden sm:table-cell truncate max-w-xs text-[10px]">
                      {b.expectedMd5}
                    </td>
                    <td className="p-2.5 text-right">
                      {b.status === 'VERIFIED' ? (
                        <span className="text-[#CCFF00] inline-flex items-center gap-1 font-bold text-xs">
                          <CheckCircle2 size={13} />
                          READY
                        </span>
                      ) : (
                        <button
                          onClick={() => handleSimulateInstall(b.filename)}
                          className="px-2.5 py-1 bg-[#DFFF00] hover:bg-[#CCFF00] text-[#120024] border border-[#DFFF00] font-black text-xs uppercase"
                        >
                          + INSTALL
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Drag & Drop Upload Zone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
            className="border-2 border-dashed border-[#DFFF00]/60 hover:border-[#DFFF00] bg-[#120024] p-6 text-center transition-colors cursor-pointer group"
          >
            <Upload size={24} className="mx-auto text-[#DFFF00] mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-black uppercase text-[#DFFF00] mb-1">
              DRAG & DROP BIOS / FIRMWARE BIN FILES HERE
            </div>
            <p className="text-[10px] text-[#DFFF00]/60 font-mono">
              SUPPORTED: SCPH5501.BIN, GBA_BIOS.BIN, NEOGEO.ZIP, DISKSYS.ROM
            </p>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handleVerifyAll}
              disabled={isVerifying}
              className="px-3.5 py-2 bg-[#120024] hover:bg-[#DFFF00] hover:text-[#120024] text-[#DFFF00] border-2 border-[#DFFF00] text-xs font-bold flex items-center gap-2 transition-colors"
            >
              <RefreshCw size={12} className={isVerifying ? 'animate-spin' : ''} />
              <span>{isVerifying ? 'VERIFYING...' : 'RE-SCAN FIRMWARE'}</span>
            </button>

            <button
              onClick={() => {
                retroAudio.playCoin();
                onUpdateBios(records);
                onClose();
              }}
              className="px-5 py-2 bg-[#DFFF00] hover:bg-[#CCFF00] text-[#120024] border-2 border-[#DFFF00] text-xs font-black shadow-[3px_3px_0px_#4B0082] transition-colors"
            >
              DONE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
