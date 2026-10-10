import React from 'react';
import { Tv } from 'lucide-react';

interface ConnectTvGateProps {
  onContinue: () => void;
}

function isIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

/**
 * Shown before the tap-to-start gate, mobile-only (see isMobileDevice() below). There is no
 * web API to trigger OS-level screen mirroring (AirPlay / Android Cast) or to detect whether
 * it succeeded - this just walks the user through doing it manually, then they confirm
 * themselves once they see this screen reflected on the TV.
 */
export const ConnectTvGate: React.FC<ConnectTvGateProps> = ({ onContinue }) => {
  const steps = isIOS()
    ? [
        'Apri il Centro di Controllo (scorri dall\'angolo in alto a destra)',
        'Tocca "Duplica schermo"',
        'Scegli la tua TV dalla lista'
      ]
    : [
        'Scorri giù per aprire le impostazioni rapide',
        'Tocca "Trasmetti schermo" (o "Cast")',
        'Scegli la tua TV dalla lista'
      ];

  return (
    <div className="fixed inset-0 z-[100] bg-[#120024] flex flex-col items-center justify-center gap-6 font-mono text-[#DFFF00] select-none p-6">
      <div className="flex flex-col items-center gap-3">
        <Tv size={48} color="#DFFF00" />
        <h1 className="text-xl sm:text-2xl font-black uppercase italic tracking-tight text-center">
          CONNECT YOUR TV
        </h1>
      </div>

      <ol className="w-full max-w-sm space-y-2 text-xs sm:text-sm font-bold">
        {steps.map((step, i) => (
          <li key={i} className="flex items-start gap-2.5 bg-[#1e003b] border-2 border-[#DFFF00] px-3 py-2.5">
            <span className="text-[#CCFF00] shrink-0">{i + 1}.</span>
            <span>{step}</span>
          </li>
        ))}
      </ol>

      <p className="text-[10px] sm:text-xs text-[#DFFF00]/70 uppercase text-center max-w-xs">
        Quando vedi questo schermo riflesso sulla TV, tocca Continua
      </p>

      <button
        onClick={onContinue}
        className="border-4 border-[#DFFF00] px-6 py-3 bg-[#DFFF00] text-[#120024] shadow-[4px_4px_0px_#4B0082] font-black uppercase text-xs sm:text-sm tracking-widest"
      >
        CONTINUA
      </button>
    </div>
  );
};

export function isMobileDevice(): boolean {
  return /Android|iPad|iPhone|iPod/.test(navigator.userAgent);
}
