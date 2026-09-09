import React, { useState, useEffect } from 'react';
import { ControllerMapping } from '../types';
import { PixelGamepad } from '../utils/pixelIcons';
import { X, RotateCcw, Check, Sliders, Usb } from 'lucide-react';
import { retroAudio } from '../utils/audio';
import { useGamepads, STANDARD_GAMEPAD_BUTTONS } from '../utils/useGamepads';

interface ControllerConfigModalProps {
  mapping: ControllerMapping;
  onSaveMapping: (mapping: ControllerMapping) => void;
  onClose: () => void;
}

export const ControllerConfigModal: React.FC<ControllerConfigModalProps> = ({
  mapping: initialMapping,
  onSaveMapping,
  onClose
}) => {
  const [currentMapping, setCurrentMapping] = useState<ControllerMapping>(initialMapping);
  const [listeningKey, setListeningKey] = useState<keyof ControllerMapping | null>(null);
  const [activeKeysPressed, setActiveKeysPressed] = useState<Set<string>>(new Set());
  const gamepads = useGamepads(true);

  // Listen for keydown when remapping or testing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      setActiveKeysPressed(prev => new Set(prev).add(e.code));

      if (listeningKey) {
        retroAudio.playBlip(800);
        setCurrentMapping(prev => ({
          ...prev,
          [listeningKey]: e.code
        }));
        setListeningKey(null);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setActiveKeysPressed(prev => {
        const next = new Set(prev);
        next.delete(e.code);
        return next;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [listeningKey]);

  // Check if a virtual button is currently pressed, either on keyboard or on a connected standard-mapped gamepad
  const isButtonPressed = (actionKey: keyof ControllerMapping) => {
    const boundCode = currentMapping[actionKey];
    if (typeof boundCode === 'string' && activeKeysPressed.has(boundCode)) return true;

    const gamepadButtonIndex = (STANDARD_GAMEPAD_BUTTONS as Record<string, number>)[actionKey];
    if (gamepadButtonIndex === undefined) return false;
    return gamepads.some(pad => pad.mapping === 'standard' && pad.buttons[gamepadButtonIndex]);
  };

  const handleResetDefaults = () => {
    retroAudio.playCancel();
    setCurrentMapping({
      up: 'ArrowUp',
      down: 'ArrowDown',
      left: 'ArrowLeft',
      right: 'ArrowRight',
      buttonA: 'KeyZ',
      buttonB: 'KeyX',
      buttonX: 'KeyA',
      buttonY: 'KeyS',
      buttonL: 'KeyQ',
      buttonR: 'KeyW',
      start: 'Enter',
      select: 'ShiftRight',
      turboA: 'KeyC',
      turboB: 'KeyV',
      deadzone: 0.15,
      turboRateHz: 30
    });
  };

  const buttonConfigs: Array<{ key: keyof ControllerMapping; label: string; group: string }> = [
    { key: 'up', label: 'D-PAD UP', group: 'Directional' },
    { key: 'down', label: 'D-PAD DOWN', group: 'Directional' },
    { key: 'left', label: 'D-PAD LEFT', group: 'Directional' },
    { key: 'right', label: 'D-PAD RIGHT', group: 'Directional' },
    { key: 'buttonA', label: 'BUTTON A (FIRE)', group: 'Action' },
    { key: 'buttonB', label: 'BUTTON B (JUMP)', group: 'Action' },
    { key: 'buttonX', label: 'BUTTON X', group: 'Action' },
    { key: 'buttonY', label: 'BUTTON Y', group: 'Action' },
    { key: 'buttonL', label: 'SHOULDER L', group: 'Triggers' },
    { key: 'buttonR', label: 'SHOULDER R', group: 'Triggers' },
    { key: 'start', label: 'START', group: 'System' },
    { key: 'select', label: 'SELECT / COIN', group: 'System' },
    { key: 'turboA', label: 'TURBO A', group: 'Turbo' },
    { key: 'turboB', label: 'TURBO B', group: 'Turbo' }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-[#120024]/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto font-mono text-[#DFFF00]">
      <div className="relative w-full max-w-3xl bg-[#1e003b] border-4 border-[#DFFF00] shadow-[8px_8px_0px_#4B0082] my-auto">
        {/* Header */}
        <div className="bg-[#120024] border-b-4 border-[#DFFF00] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <PixelGamepad size={22} color="#DFFF00" />
            <h2 className="text-xs sm:text-sm font-black text-[#DFFF00] uppercase tracking-wider">
              CONTROLLER SETUP // KEYBOARD + GAMEPAD
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

        <div className="p-4 sm:p-6 space-y-5">
          {/* Connected Physical Controllers */}
          <div className="bg-[#120024] border-2 border-[#DFFF00] p-3.5">
            <div className="flex items-center gap-2 text-xs font-bold text-[#DFFF00] uppercase mb-2">
              <Usb size={14} />
              <span>Physical Controllers (USB / Bluetooth)</span>
            </div>
            {gamepads.length === 0 ? (
              <p className="text-[10px] text-[#DFFF00]/60 leading-relaxed">
                None detected yet. Connect a USB controller, or pair one over Bluetooth at the TV/OS
                level (not inside this app) — it shows up here the same way either way. Then press any
                button to wake the browser's detection.
              </p>
            ) : (
              <div className="space-y-1.5">
                {gamepads.map(pad => {
                  const pressedIndexes = pad.buttons
                    .map((pressed, i) => (pressed ? i : -1))
                    .filter(i => i >= 0);
                  const movedAxes = pad.axes
                    .map((v, i) => (Math.abs(v) > 0.3 ? `${i}:${v.toFixed(2)}` : null))
                    .filter(Boolean);

                  return (
                    <div key={pad.index} className="bg-[#1e003b] border border-[#DFFF00]/40 px-2.5 py-1.5 space-y-1">
                      <div className="flex items-center justify-between gap-2 text-[10px]">
                        <span className="truncate text-[#DFFF00] font-bold">{pad.id}</span>
                        <span
                          className={`shrink-0 px-1.5 py-0.5 border font-bold uppercase ${
                            pad.mapping === 'standard'
                              ? 'border-[#CCFF00] text-[#CCFF00]'
                              : 'border-[#DFFF00]/50 text-[#DFFF00]/70'
                          }`}
                        >
                          {pad.mapping === 'standard' ? 'Standard mapping' : 'Non-standard layout'}
                        </span>
                      </div>
                      {pad.mapping !== 'standard' && (
                        <div className="text-[9px] text-[#DFFF00]/70 font-mono">
                          RAW BUTTONS PRESSED: [{pressedIndexes.join(', ') || 'none'}]
                          {movedAxes.length > 0 && <> · AXES: [{movedAxes.join(', ')}]</>}
                        </div>
                      )}
                    </div>
                  );
                })}
                <p className="text-[9px] text-[#DFFF00]/50 leading-relaxed pt-1">
                  Press its buttons below to confirm the diagram lights up correctly. "Non-standard
                  layout" means the browser couldn't normalize this pad's buttons — it may not line up
                  with the diagram even though it still works in-game.
                </p>
              </div>
            )}
          </div>

          {/* Interactive Gamepad Visualizer Diagram */}
          <div className="bg-[#120024] border-2 border-[#DFFF00] p-4 text-center">
            <div className="text-[10px] text-[#DFFF00]/70 uppercase mb-3 font-mono tracking-wider font-bold">
              [VISUAL TESTER - PRESS A KEYBOARD KEY OR CONTROLLER BUTTON TO TEST LIT BUTTONS]
            </div>

            <div className="inline-block relative bg-[#1e003b] border-2 border-[#DFFF00] p-6 max-w-md w-full shadow-[4px_4px_0px_#4B0082]">
              {/* Shoulder Buttons */}
              <div className="flex justify-between mb-3 px-4">
                <div
                  className={`px-3 py-1 border-2 text-[10px] font-bold ${
                    isButtonPressed('buttonL')
                      ? 'bg-[#DFFF00] text-[#120024] border-[#DFFF00]'
                      : 'bg-[#120024] text-[#DFFF00] border-[#DFFF00]/60'
                  }`}
                >
                  [L] {currentMapping.buttonL.replace('Key', '')}
                </div>
                <div
                  className={`px-3 py-1 border-2 text-[10px] font-bold ${
                    isButtonPressed('buttonR')
                      ? 'bg-[#DFFF00] text-[#120024] border-[#DFFF00]'
                      : 'bg-[#120024] text-[#DFFF00] border-[#DFFF00]/60'
                  }`}
                >
                  [R] {currentMapping.buttonR.replace('Key', '')}
                </div>
              </div>

              {/* Main Pad Area */}
              <div className="flex items-center justify-between gap-4">
                {/* D-Pad cross */}
                <div className="relative w-28 h-28 flex items-center justify-center">
                  <div
                    className={`absolute top-0 w-8 h-8 border-2 flex items-center justify-center text-[10px] font-bold ${
                      isButtonPressed('up') ? 'bg-[#DFFF00] text-[#120024] border-[#DFFF00]' : 'bg-[#120024] text-[#DFFF00] border-[#DFFF00]/60'
                    }`}
                  >
                    ▲
                  </div>
                  <div
                    className={`absolute left-0 w-8 h-8 border-2 flex items-center justify-center text-[10px] font-bold ${
                      isButtonPressed('left') ? 'bg-[#DFFF00] text-[#120024] border-[#DFFF00]' : 'bg-[#120024] text-[#DFFF00] border-[#DFFF00]/60'
                    }`}
                  >
                    ◀
                  </div>
                  <div className="w-8 h-8 bg-[#1e003b] border-2 border-[#DFFF00]/40 z-0" />
                  <div
                    className={`absolute right-0 w-8 h-8 border-2 flex items-center justify-center text-[10px] font-bold ${
                      isButtonPressed('right') ? 'bg-[#DFFF00] text-[#120024] border-[#DFFF00]' : 'bg-[#120024] text-[#DFFF00] border-[#DFFF00]/60'
                    }`}
                  >
                    ▶
                  </div>
                  <div
                    className={`absolute bottom-0 w-8 h-8 border-2 flex items-center justify-center text-[10px] font-bold ${
                      isButtonPressed('down') ? 'bg-[#DFFF00] text-[#120024] border-[#DFFF00]' : 'bg-[#120024] text-[#DFFF00] border-[#DFFF00]/60'
                    }`}
                  >
                    ▼
                  </div>
                </div>

                {/* Center Start / Select */}
                <div className="flex flex-col gap-2">
                  <div
                    className={`px-2 py-0.5 border text-[9px] font-bold ${
                      isButtonPressed('select') ? 'bg-[#DFFF00] text-[#120024] border-[#DFFF00]' : 'bg-[#120024] text-[#DFFF00] border-[#DFFF00]/60'
                    }`}
                  >
                    SELECT
                  </div>
                  <div
                    className={`px-2 py-0.5 border text-[9px] font-bold ${
                      isButtonPressed('start') ? 'bg-[#DFFF00] text-[#120024] border-[#DFFF00]' : 'bg-[#120024] text-[#DFFF00] border-[#DFFF00]/60'
                    }`}
                  >
                    START
                  </div>
                </div>

                {/* A / B / X / Y Diamond */}
                <div className="relative w-28 h-28 flex items-center justify-center">
                  <div
                    className={`absolute top-0 w-8 h-8 border-2 flex items-center justify-center text-[10px] font-bold ${
                      isButtonPressed('buttonX') ? 'bg-[#DFFF00] text-[#120024] border-[#DFFF00]' : 'bg-[#4B0082] text-[#DFFF00] border-[#DFFF00]'
                    }`}
                  >
                    X
                  </div>
                  <div
                    className={`absolute left-0 w-8 h-8 border-2 flex items-center justify-center text-[10px] font-bold ${
                      isButtonPressed('buttonY') ? 'bg-[#DFFF00] text-[#120024] border-[#DFFF00]' : 'bg-[#4B0082] text-[#DFFF00] border-[#DFFF00]'
                    }`}
                  >
                    Y
                  </div>
                  <div
                    className={`absolute right-0 w-8 h-8 border-2 flex items-center justify-center text-[10px] font-bold ${
                      isButtonPressed('buttonA') ? 'bg-[#DFFF00] text-[#120024] border-[#DFFF00]' : 'bg-[#DFFF00] text-[#120024] border-[#DFFF00]'
                    }`}
                  >
                    A
                  </div>
                  <div
                    className={`absolute bottom-0 w-8 h-8 border-2 flex items-center justify-center text-[10px] font-bold ${
                      isButtonPressed('buttonB') ? 'bg-[#DFFF00] text-[#120024] border-[#DFFF00]' : 'bg-[#4B0082] text-[#DFFF00] border-[#DFFF00]'
                    }`}
                  >
                    B
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Key Binding List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-[#DFFF00]">CLICK BUTTON TO RE-MAP:</span>
              {listeningKey && (
                <span className="text-[#CCFF00] font-bold animate-pulse">
                  [PRESS ANY KEYBOARD KEY TO BIND...]
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-48 overflow-y-auto p-2 bg-[#120024] border-2 border-[#DFFF00]">
              {buttonConfigs.map(({ key, label }) => {
                const isListening = listeningKey === key;
                const value = currentMapping[key];
                const displayVal = typeof value === 'string' ? value.replace('Key', '') : String(value);

                return (
                  <button
                    key={key}
                    onClick={() => {
                      retroAudio.playBlip(600);
                      setListeningKey(key);
                    }}
                    className={`p-2.5 border-2 text-left transition-colors ${
                      isListening
                        ? 'bg-[#DFFF00] text-[#120024] border-[#DFFF00] animate-pulse font-black'
                        : 'bg-[#1e003b] hover:bg-[#2b0054] text-[#DFFF00] border-[#DFFF00]/50 hover:border-[#DFFF00]'
                    }`}
                  >
                    <div className="text-[9px] text-[#DFFF00]/70 uppercase font-bold truncate">
                      {label}
                    </div>
                    <div className="text-xs font-bold text-[#DFFF00] font-mono mt-0.5 truncate">
                      {isListening ? 'PRESS KEY...' : `[${displayVal}]`}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Turbo Rate Slider & Deadzone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#120024] border-2 border-[#DFFF00] p-3.5 text-xs">
            <div>
              <div className="flex justify-between text-[#DFFF00]/80 mb-1.5 font-bold">
                <span>TURBO FIRE RATE:</span>
                <span className="text-[#DFFF00] font-mono font-black">{currentMapping.turboRateHz} HZ</span>
              </div>
              <input
                type="range"
                min="10"
                max="60"
                step="5"
                value={currentMapping.turboRateHz}
                onChange={(e) => {
                  setCurrentMapping(prev => ({ ...prev, turboRateHz: Number(e.target.value) }));
                }}
                className="w-full accent-[#DFFF00] cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-[#DFFF00]/80 mb-1.5 font-bold">
                <span>ANALOG DEADZONE:</span>
                <span className="text-[#DFFF00] font-mono font-black">{(currentMapping.deadzone * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.4"
                step="0.05"
                value={currentMapping.deadzone}
                onChange={(e) => {
                  setCurrentMapping(prev => ({ ...prev, deadzone: Number(e.target.value) }));
                }}
                className="w-full accent-[#DFFF00] cursor-pointer"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              onClick={handleResetDefaults}
              className="px-3.5 py-2 bg-[#120024] hover:bg-[#DFFF00] hover:text-[#120024] text-[#DFFF00] border-2 border-[#DFFF00] text-xs font-bold flex items-center gap-2 transition-colors"
            >
              <RotateCcw size={13} />
              <span>RESET DEFAULTS</span>
            </button>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => {
                  retroAudio.playCancel();
                  onClose();
                }}
                className="px-4 py-2 bg-[#120024] hover:bg-[#DFFF00] hover:text-[#120024] text-[#DFFF00] border-2 border-[#DFFF00] text-xs font-bold transition-colors"
              >
                CANCEL
              </button>
              <button
                onClick={() => {
                  retroAudio.playCoin();
                  onSaveMapping(currentMapping);
                  onClose();
                }}
                className="px-5 py-2 bg-[#DFFF00] hover:bg-[#CCFF00] text-[#120024] border-2 border-[#DFFF00] text-xs font-black shadow-[3px_3px_0px_#4B0082] flex items-center gap-2 transition-colors"
              >
                <Check size={13} />
                <span>SAVE MAPPINGS</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
