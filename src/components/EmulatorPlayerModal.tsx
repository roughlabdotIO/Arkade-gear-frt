import React, { useState, useEffect, useRef } from 'react';
import { RomGame, EmulatorSystem, SaveStateSlot } from '../types';
import {
  PixelCrtMonitor,
  PixelFloppy,
  PixelSound,
  PixelBattery
} from '../utils/pixelIcons';
import { Play, Pause, FastForward, RotateCcw, Camera, X, Volume2, VolumeX, Maximize2 } from 'lucide-react';
import { retroAudio } from '../utils/audio';

interface EmulatorPlayerModalProps {
  game: RomGame;
  system: EmulatorSystem;
  onClose: () => void;
  onUpdatePlaytime: (gameId: string, addedMinutes: number) => void;
}

export const EmulatorPlayerModal: React.FC<EmulatorPlayerModalProps> = ({
  game,
  system,
  onClose,
  onUpdatePlaytime
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState<1 | 2>(1);
  const [crtFilter, setCrtFilter] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<number>(1);
  const [saveSlots, setSaveSlots] = useState<Record<number, SaveStateSlot>>({
    1: { slot: 1, exists: true, timestamp: '10:42 AM', gameScore: 1250, gameLevel: 2 },
    2: { slot: 2, exists: false },
    3: { slot: 3, exists: false },
    4: { slot: 4, exists: false },
    5: { slot: 5, exists: false }
  });
  const [statusMessage, setStatusMessage] = useState<string>('CORE READY • 60 FPS');
  const [fps, setFps] = useState(60.0);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const screenContainerRef = useRef<HTMLDivElement | null>(null);

  // Mini Arcade Engine State
  const gameStateRef = useRef({
    playerX: 160,
    playerWidth: 24,
    playerSpeed: 4,
    bullets: [] as Array<{ x: number; y: number; vy: number }>,
    aliens: [] as Array<{ x: number; y: number; width: number; height: number; alive: boolean; color: string }>,
    particles: [] as Array<{ x: number; y: number; vx: number; vy: number; life: number; color: string }>,
    score: 0,
    lives: 3,
    wave: 1,
    keys: { left: false, right: false, fire: false },
    lastFireTime: 0,
    canvasWidth: 320,
    canvasHeight: 240
  });

  const [hudScore, setHudScore] = useState(0);
  const [hudLives, setHudLives] = useState(3);
  const [hudWave, setHudWave] = useState(1);

  // Playtime tracker
  useEffect(() => {
    const timer = setInterval(() => {
      onUpdatePlaytime(game.id, 1);
    }, 60000);
    return () => clearInterval(timer);
  }, [game.id, onUpdatePlaytime]);

  // Keyboard Event Listeners for Game
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const keys = gameStateRef.current.keys;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        keys.left = true;
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        keys.right = true;
      } else if (e.key === ' ' || e.key === 'z' || e.key === 'Z' || e.key === 'Enter') {
        keys.fire = true;
      } else if (e.key === 'p' || e.key === 'P') {
        setIsPaused(prev => !prev);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const keys = gameStateRef.current.keys;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        keys.left = false;
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        keys.right = false;
      } else if (e.key === ' ' || e.key === 'z' || e.key === 'Z' || e.key === 'Enter') {
        keys.fire = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Initialize Aliens Wave
  const spawnAliens = (wave: number) => {
    const aliens = [];
    const rows = 3;
    const cols = 6;
    const colors = ['#dfff00', '#c084fc', '#ec4899'];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        aliens.push({
          x: 35 + c * 42,
          y: 30 + r * 26,
          width: 22,
          height: 16,
          alive: true,
          color: colors[r % colors.length]
        });
      }
    }
    gameStateRef.current.aliens = aliens;
    gameStateRef.current.wave = wave;
    setHudWave(wave);
  };

  // Run the canvas game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    spawnAliens(1);

    let animationFrameId: number;
    let lastTime = performance.now();
    let frameCount = 0;
    let lastFpsUpdate = performance.now();

    const loop = (currentTime: number) => {
      // FPS calculation
      frameCount++;
      if (currentTime - lastFpsUpdate >= 600) {
        const measuredFps = (frameCount * 1000) / (currentTime - lastFpsUpdate);
        setFps(Math.round(measuredFps * 10) / 10);
        frameCount = 0;
        lastFpsUpdate = currentTime;
      }

      const dt = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      const state = gameStateRef.current;
      const speedFactor = speedMultiplier;

      if (!isPaused) {
        // Player movement
        if (state.keys.left) {
          state.playerX = Math.max(16, state.playerX - state.playerSpeed * speedFactor);
        }
        if (state.keys.right) {
          state.playerX = Math.min(state.canvasWidth - 16 - state.playerWidth, state.playerX + state.playerSpeed * speedFactor);
        }

        // Fire Bullet
        if (state.keys.fire && currentTime - state.lastFireTime > 200 / speedFactor) {
          state.bullets.push({
            x: state.playerX + state.playerWidth / 2 - 2,
            y: state.canvasHeight - 34,
            vy: -7 * speedFactor
          });
          state.lastFireTime = currentTime;
          if (!isMuted) retroAudio.playLaser();
        }

        // Update Bullets
        for (let i = state.bullets.length - 1; i >= 0; i--) {
          const b = state.bullets[i];
          b.y += b.vy;

          // Check hit with aliens
          let bulletRemoved = false;
          for (const alien of state.aliens) {
            if (alien.alive && b.x > alien.x && b.x < alien.x + alien.width && b.y > alien.y && b.y < alien.y + alien.height) {
              alien.alive = false;
              bulletRemoved = true;
              state.score += 150;
              setHudScore(state.score);
              if (!isMuted) retroAudio.playExplosion();

              // Spawn particles
              for (let p = 0; p < 8; p++) {
                state.particles.push({
                  x: alien.x + alien.width / 2,
                  y: alien.y + alien.height / 2,
                  vx: (Math.random() - 0.5) * 4,
                  vy: (Math.random() - 0.5) * 4,
                  life: 1.0,
                  color: alien.color
                });
              }
              break;
            }
          }

          if (bulletRemoved || b.y < 0) {
            state.bullets.splice(i, 1);
          }
        }

        // Check if all aliens dead -> Next wave
        const remainingAliens = state.aliens.filter(a => a.alive).length;
        if (remainingAliens === 0) {
          spawnAliens(state.wave + 1);
          if (!isMuted) retroAudio.playPowerUp();
          setStatusMessage(`WAVE ${state.wave} CLEARED! +500 PTS`);
          state.score += 500;
          setHudScore(state.score);
        }

        // Update particles
        for (let i = state.particles.length - 1; i >= 0; i--) {
          const p = state.particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.life -= 0.04 * speedFactor;
          if (p.life <= 0) {
            state.particles.splice(i, 1);
          }
        }
      }

      // RENDER CANVAS (8-bit style)
      ctx.imageSmoothingEnabled = false;
      ctx.fillStyle = '#0a0212';
      ctx.fillRect(0, 0, state.canvasWidth, state.canvasHeight);

      // Starfield background
      ctx.fillStyle = '#9333ea';
      for (let s = 0; s < 15; s++) {
        const sx = (s * 47 + Math.floor(currentTime * 0.05)) % state.canvasWidth;
        const sy = (s * 33) % state.canvasHeight;
        ctx.fillRect(sx, sy, 2, 2);
      }

      // Draw Aliens
      for (const alien of state.aliens) {
        if (!alien.alive) continue;
        ctx.fillStyle = alien.color;
        // Pixel Space Invader / Beetle shape
        const ax = alien.x;
        const ay = alien.y;
        ctx.fillRect(ax + 4, ay, 14, 4);
        ctx.fillRect(ax + 2, ay + 4, 18, 8);
        ctx.fillRect(ax + 4, ay + 12, 4, 4);
        ctx.fillRect(ax + 14, ay + 12, 4, 4);
        // Eyes
        ctx.fillStyle = '#0a0212';
        ctx.fillRect(ax + 6, ay + 6, 3, 3);
        ctx.fillRect(ax + 13, ay + 6, 3, 3);
      }

      // Draw Bullets
      ctx.fillStyle = '#dfff00';
      for (const b of state.bullets) {
        ctx.fillRect(b.x, b.y, 4, 8);
      }

      // Draw Particles
      for (const p of state.particles) {
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, 3, 3);
      }

      // Draw Player 8-bit Ship
      const px = state.playerX;
      const py = state.canvasHeight - 24;
      ctx.fillStyle = '#dfff00';
      ctx.fillRect(px + 10, py - 4, 4, 4); // nose cannon
      ctx.fillRect(px + 6, py, 12, 6); // canopy
      ctx.fillRect(px, py + 6, 24, 6); // wings
      ctx.fillStyle = '#9333ea';
      ctx.fillRect(px + 4, py + 8, 4, 4); // left engine
      ctx.fillRect(px + 16, py + 8, 4, 4); // right engine

      // Draw Ground Horizon Line
      ctx.fillStyle = '#3b0764';
      ctx.fillRect(0, state.canvasHeight - 6, state.canvasWidth, 6);

      // Pause Overlay
      if (isPaused) {
        ctx.fillStyle = 'rgba(14, 4, 22, 0.75)';
        ctx.fillRect(0, 0, state.canvasWidth, state.canvasHeight);
        ctx.fillStyle = '#dfff00';
        ctx.font = '12px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('EMULATOR PAUSED', state.canvasWidth / 2, state.canvasHeight / 2);
        ctx.fillStyle = '#c084fc';
        ctx.font = '8px "Press Start 2P", monospace';
        ctx.fillText('PRESS [P] OR RESUME BUTTON', state.canvasWidth / 2, state.canvasHeight / 2 + 18);
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPaused, speedMultiplier, isMuted]);

  // Quick Save Function
  const handleQuickSave = () => {
    retroAudio.playSaveChime();
    const state = gameStateRef.current;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setSaveSlots(prev => ({
      ...prev,
      [selectedSlot]: {
        slot: selectedSlot,
        exists: true,
        timestamp: timeStr,
        gameScore: state.score,
        gameLevel: state.wave
      }
    }));
    setStatusMessage(`SAVED TO SLOT ${selectedSlot} (${timeStr})`);
  };

  // Quick Load Function
  const handleQuickLoad = () => {
    const slotData = saveSlots[selectedSlot];
    if (!slotData || !slotData.exists) {
      retroAudio.playCancel();
      setStatusMessage(`SLOT ${selectedSlot} IS EMPTY!`);
      return;
    }

    retroAudio.playCoin();
    gameStateRef.current.score = slotData.gameScore || 0;
    gameStateRef.current.wave = slotData.gameLevel || 1;
    setHudScore(slotData.gameScore || 0);
    setHudWave(slotData.gameLevel || 1);
    spawnAliens(slotData.gameLevel || 1);
    setStatusMessage(`LOADED STATE FROM SLOT ${selectedSlot}`);
  };

  // Screenshot capture
  const handleScreenshot = () => {
    if (!canvasRef.current) return;
    retroAudio.playBlip(900);
    const dataUrl = canvasRef.current.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `${game.title.replace(/\s+/g, '_')}_shot.png`;
    a.click();
    setStatusMessage('SCREENSHOT SAVED AS PNG');
  };

  // Reset Core
  const handleReset = () => {
    retroAudio.playCancel();
    gameStateRef.current.score = 0;
    gameStateRef.current.lives = 3;
    gameStateRef.current.wave = 1;
    gameStateRef.current.bullets = [];
    setHudScore(0);
    setHudLives(3);
    setHudWave(1);
    spawnAliens(1);
    setStatusMessage('CORE REBOOTED • STATE RESET');
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#120024]/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto font-mono text-[#DFFF00]">
      <div className="relative w-full max-w-4xl bg-[#1e003b] border-4 border-[#DFFF00] shadow-[8px_8px_0px_#4B0082] flex flex-col my-auto max-h-[96vh]">
        {/* Modal Top Bar */}
        <div className="bg-[#120024] border-b-4 border-[#DFFF00] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <span className="text-[10px] bg-[#DFFF00] text-[#120024] px-2.5 py-0.5 border border-[#DFFF00] font-black uppercase tracking-wider shrink-0">
              {system.shortName}
            </span>
            <h2 className="text-sm sm:text-base font-black text-[#DFFF00] uppercase tracking-tight truncate">
              {game.title}
            </h2>
            <span className="hidden sm:inline text-[10px] text-[#DFFF00]/60">
              [CORE: {system.activeCore}]
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                retroAudio.playCancel();
                onClose();
              }}
              className="p-1.5 border-2 border-[#DFFF00] hover:bg-[#DFFF00] hover:text-[#120024] text-[#DFFF00] transition-colors"
              title="Close Emulator"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Emulator Monitor HUD (FPS, Latency, Sound) */}
        <div className="bg-[#120024] border-b-2 border-[#DFFF00]/50 px-4 py-2 flex flex-wrap items-center justify-between text-[10px] text-[#DFFF00] font-mono gap-2">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="text-[#DFFF00]/60">FPS:</span>
              <span className="text-[#CCFF00] font-black">
                {speedMultiplier === 2 ? (fps * 2).toFixed(1) : fps.toFixed(1)}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[#DFFF00]/60">FRAME TIME:</span>
              <span className="text-[#DFFF00]">16.6ms</span>
            </div>
            <div className="flex items-center gap-1.5 hidden sm:flex">
              <span className="text-[#DFFF00]/60">AUDIO SYNC:</span>
              <span className="text-[#CCFF00]">100% BUFFER</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-[#DFFF00] font-bold">
              STATUS: <span className="text-[#CCFF00]">{statusMessage}</span>
            </div>
          </div>
        </div>

        {/* Main Emulator CRT Display Stage */}
        <div 
          ref={screenContainerRef}
          className="relative bg-[#0a0014] flex flex-col items-center justify-center p-2 sm:p-4 overflow-hidden"
        >
          {/* Game Stats Overlay inside Display */}
          <div className="w-full max-w-[640px] flex items-center justify-between px-2 py-1 text-[10px] text-[#DFFF00] font-mono z-20">
            <div>SCORE: {hudScore.toString().padStart(6, '0')}</div>
            <div>WAVE: {hudWave}</div>
            <div className="flex items-center gap-1">
              <span>SHIELD:</span>
              <span className="text-[#CCFF00]">{'■ '.repeat(hudLives)}</span>
            </div>
          </div>

          {/* Canvas Wrapper with Optional CRT Scanlines */}
          <div className="relative border-4 border-[#DFFF00] shadow-[0_0_20px_rgba(223,255,0,0.2)] inline-block">
            <canvas
              ref={canvasRef}
              width={320}
              height={240}
              className="w-full max-w-[640px] h-auto aspect-[4/3] block image-render-pixelated cursor-crosshair"
            />

            {/* CRT Scanline Overlay */}
            {crtFilter && (
              <div className="absolute inset-0 crt-scanlines crt-flicker pointer-events-none" />
            )}

            {/* Speed Multiplier Watermark */}
            {speedMultiplier === 2 && (
              <div className="absolute top-2 right-2 bg-[#DFFF00] text-[#120024] px-2 py-0.5 text-[9px] font-black border border-[#120024] animate-pulse">
                FAST-FORWARD 2X
              </div>
            )}
          </div>

          {/* On-screen touch/click controller bar for quick play */}
          <div className="w-full max-w-[640px] mt-2.5 flex items-center justify-between gap-2 px-1">
            <div className="flex items-center gap-1.5">
              <button
                onMouseDown={() => { gameStateRef.current.keys.left = true; }}
                onMouseUp={() => { gameStateRef.current.keys.left = false; }}
                onTouchStart={() => { gameStateRef.current.keys.left = true; }}
                onTouchEnd={() => { gameStateRef.current.keys.left = false; }}
                className="w-10 h-9 bg-[#120024] border-2 border-[#DFFF00] text-xs text-[#DFFF00] font-bold hover:bg-[#DFFF00] hover:text-[#120024]"
              >
                ◀
              </button>
              <button
                onMouseDown={() => { gameStateRef.current.keys.right = true; }}
                onMouseUp={() => { gameStateRef.current.keys.right = false; }}
                onTouchStart={() => { gameStateRef.current.keys.right = true; }}
                onTouchEnd={() => { gameStateRef.current.keys.right = false; }}
                className="w-10 h-9 bg-[#120024] border-2 border-[#DFFF00] text-xs text-[#DFFF00] font-bold hover:bg-[#DFFF00] hover:text-[#120024]"
              >
                ▶
              </button>
            </div>

            <div className="text-[9px] text-[#DFFF00]/60 hidden sm:block font-mono">
              [CONTROLS: ARROWS / A, D MOVE • SPACE / Z FIRE • P PAUSE]
            </div>

            <div className="flex items-center gap-1">
              <button
                onMouseDown={() => { gameStateRef.current.keys.fire = true; }}
                onMouseUp={() => { gameStateRef.current.keys.fire = false; }}
                onTouchStart={() => { gameStateRef.current.keys.fire = true; }}
                onTouchEnd={() => { gameStateRef.current.keys.fire = false; }}
                className="px-4 h-9 bg-[#DFFF00] text-[#120024] border-2 border-[#DFFF00] text-xs font-black hover:bg-[#CCFF00]"
              >
                FIRE [Z]
              </button>
            </div>
          </div>
        </div>

        {/* Emulator Control Deck */}
        <div className="bg-[#1e003b] border-t-4 border-[#DFFF00] p-3.5 space-y-3">
          {/* Main Control Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              {/* Pause / Play */}
              <button
                onClick={() => {
                  retroAudio.playBlip(500);
                  setIsPaused(!isPaused);
                  setStatusMessage(isPaused ? 'RESUMED' : 'PAUSED');
                }}
                className="px-3 py-1.5 bg-[#120024] hover:bg-[#DFFF00] hover:text-[#120024] text-[#DFFF00] border-2 border-[#DFFF00] text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                {isPaused ? <Play size={12} className="text-current" /> : <Pause size={12} className="text-current" />}
                <span>{isPaused ? 'RESUME' : 'PAUSE'}</span>
              </button>

              {/* Fast Forward 2X */}
              <button
                onClick={() => {
                  retroAudio.playBlip(speedMultiplier === 1 ? 750 : 500);
                  setSpeedMultiplier(speedMultiplier === 1 ? 2 : 1);
                  setStatusMessage(`SPEED SET TO ${speedMultiplier === 1 ? '2X' : '1X'}`);
                }}
                className={`px-3 py-1.5 border-2 border-[#DFFF00] text-xs font-bold flex items-center gap-1.5 transition-colors ${
                  speedMultiplier === 2
                    ? 'bg-[#DFFF00] text-[#120024]'
                    : 'bg-[#120024] text-[#DFFF00] hover:bg-[#DFFF00] hover:text-[#120024]'
                }`}
              >
                <FastForward size={12} />
                <span>SPEED: {speedMultiplier}X</span>
              </button>

              {/* Reset Core */}
              <button
                onClick={handleReset}
                className="px-3 py-1.5 bg-[#120024] hover:bg-[#DFFF00] hover:text-[#120024] text-[#DFFF00] border-2 border-[#DFFF00] text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw size={12} />
                <span>RESET</span>
              </button>

              {/* Screenshot */}
              <button
                onClick={handleScreenshot}
                className="px-3 py-1.5 bg-[#120024] hover:bg-[#DFFF00] hover:text-[#120024] text-[#DFFF00] border-2 border-[#DFFF00] text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Camera size={12} />
                <span className="hidden sm:inline">SCREENSHOT</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              {/* CRT Filter Toggle */}
              <button
                onClick={() => {
                  retroAudio.playBlip(600);
                  setCrtFilter(!crtFilter);
                }}
                className={`px-3 py-1.5 border-2 border-[#DFFF00] text-xs font-bold flex items-center gap-1.5 transition-colors ${
                  crtFilter
                    ? 'bg-[#DFFF00] text-[#120024]'
                    : 'bg-[#120024] text-[#DFFF00] hover:bg-[#DFFF00] hover:text-[#120024]'
                }`}
              >
                <PixelCrtMonitor size={14} color={crtFilter ? '#120024' : '#DFFF00'} />
                <span>CRT SCANLINES</span>
              </button>

              {/* Audio Mute */}
              <button
                onClick={() => {
                  retroAudio.playBlip(600);
                  setIsMuted(!isMuted);
                }}
                className="p-1.5 border-2 border-[#DFFF00] hover:bg-[#DFFF00] hover:text-[#120024] text-[#DFFF00] transition-colors"
                title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
              >
                {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
              </button>
            </div>
          </div>

          {/* Save State Slots Strip */}
          <div className="bg-[#120024] border-2 border-[#DFFF00] p-2.5 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="text-[#DFFF00] font-black flex items-center gap-1.5 uppercase">
                <PixelFloppy size={14} color="#DFFF00" />
                SAVE SLOT:
              </span>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map(slot => {
                  const s = saveSlots[slot];
                  const isCurrent = selectedSlot === slot;
                  return (
                    <button
                      key={slot}
                      onClick={() => {
                        retroAudio.playBlip(500);
                        setSelectedSlot(slot);
                      }}
                      className={`px-2.5 py-1 border-2 font-mono font-bold ${
                        isCurrent
                          ? 'bg-[#DFFF00] text-[#120024] border-[#DFFF00]'
                          : s?.exists
                          ? 'bg-[#4B0082] text-[#DFFF00] border-[#DFFF00]'
                          : 'bg-[#1e003b] text-[#DFFF00]/40 border-[#DFFF00]/40'
                      }`}
                      title={s?.exists ? `Saved: ${s.timestamp} (Score: ${s.gameScore})` : 'Empty Slot'}
                    >
                      {slot}{s?.exists ? '•' : ''}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleQuickSave}
                className="px-3.5 py-1.5 bg-[#DFFF00] hover:bg-[#CCFF00] text-[#120024] border-2 border-[#DFFF00] font-black uppercase text-xs"
              >
                + SAVE STATE
              </button>
              <button
                onClick={handleQuickLoad}
                disabled={!saveSlots[selectedSlot]?.exists}
                className={`px-3.5 py-1.5 border-2 border-[#DFFF00] font-black uppercase text-xs transition-colors ${
                  saveSlots[selectedSlot]?.exists
                    ? 'bg-[#4B0082] hover:bg-[#DFFF00] hover:text-[#120024] text-[#DFFF00]'
                    : 'bg-[#120024] text-[#DFFF00]/30 border-[#DFFF00]/30 cursor-not-allowed'
                }`}
              >
                RESTORE
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
