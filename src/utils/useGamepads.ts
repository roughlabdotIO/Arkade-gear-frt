import { useEffect, useRef, useState } from 'react';

export interface GamepadSnapshot {
  index: number;
  id: string;
  /** "standard" means the browser normalized this pad to the W3C Standard Gamepad layout (reliable button positions). Empty string means raw/unknown layout. */
  mapping: string;
  connected: boolean;
  buttons: boolean[];
  axes: number[];
}

function snapshot(pad: Gamepad): GamepadSnapshot {
  return {
    index: pad.index,
    id: pad.id,
    mapping: pad.mapping,
    connected: pad.connected,
    buttons: pad.buttons.map(b => b.pressed),
    axes: Array.from(pad.axes)
  };
}

/** Live-polled list of currently connected gamepads (USB or OS/TV-paired Bluetooth - the browser treats both identically). */
export function useGamepads(active: boolean): GamepadSnapshot[] {
  const [pads, setPads] = useState<GamepadSnapshot[]>([]);
  const frameRef = useRef<number>();

  useEffect(() => {
    if (!active) {
      setPads([]);
      return;
    }

    const poll = () => {
      const raw = navigator.getGamepads ? navigator.getGamepads() : [];
      const next: GamepadSnapshot[] = [];
      for (const pad of raw) {
        if (pad) next.push(snapshot(pad));
      }
      setPads(next);
      frameRef.current = requestAnimationFrame(poll);
    };

    frameRef.current = requestAnimationFrame(poll);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [active]);

  return pads;
}

/** Standard Gamepad button indices (W3C spec) for pads reporting mapping "standard". */
export const STANDARD_GAMEPAD_BUTTONS = {
  buttonA: 0,
  buttonB: 1,
  buttonX: 2,
  buttonY: 3,
  buttonL: 4,
  buttonR: 5,
  select: 8,
  start: 9,
  up: 12,
  down: 13,
  left: 14,
  right: 15
} as const;
