import React from 'react';

interface PixelIconProps {
  size?: number;
  className?: string;
  color?: string;
}

// 8-Bit Crisp Pixel Art SVG Icons with crispEdges rendering
export const PixelGamepad: React.FC<PixelIconProps> = ({ size = 24, className = '', color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    shapeRendering="crispEdges"
    className={`inline-block ${className}`}
  >
    {/* Body */}
    <rect x="2" y="4" width="12" height="8" fill={color} />
    <rect x="1" y="5" width="14" height="6" fill={color} />
    <rect x="3" y="3" width="10" height="10" fill={color} />
    {/* Screen / inner inset */}
    <rect x="3" y="5" width="10" height="6" fill="#140524" />
    {/* D-pad (left) */}
    <rect x="4" y="7" width="3" height="1" fill="#dfff00" />
    <rect x="5" y="6" width="1" height="3" fill="#dfff00" />
    {/* Select / Start pills */}
    <rect x="7.5" y="8.5" width="1" height="0.8" fill="#9333ea" />
    {/* A and B buttons (right) */}
    <rect x="10" y="8" width="1" height="1" fill="#ec4899" />
    <rect x="11.5" y="6.5" width="1" height="1" fill="#ec4899" />
  </svg>
);

export const PixelCartridge: React.FC<PixelIconProps> = ({ size = 24, className = '', color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    shapeRendering="crispEdges"
    className={`inline-block ${className}`}
  >
    {/* Cartridge Outer */}
    <rect x="3" y="1" width="10" height="14" fill={color} />
    <rect x="2" y="2" width="12" height="12" fill={color} />
    {/* Label */}
    <rect x="4" y="3" width="8" height="7" fill="#140524" />
    <rect x="5" y="4" width="6" height="3" fill="#dfff00" />
    <rect x="5" y="8" width="4" height="1" fill="#c084fc" />
    {/* Grip lines */}
    <rect x="4" y="11" width="8" height="1" fill="#140524" />
    <rect x="4" y="13" width="8" height="1" fill="#140524" />
    {/* Notch */}
    <rect x="2" y="1" width="1" height="2" fill="none" />
  </svg>
);

export const PixelArcadeCabinet: React.FC<PixelIconProps> = ({ size = 24, className = '', color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    shapeRendering="crispEdges"
    className={`inline-block ${className}`}
  >
    {/* Arcade Cabinet Top Marquee */}
    <rect x="3" y="1" width="10" height="3" fill="#dfff00" />
    <rect x="4" y="2" width="8" height="1" fill="#140524" />
    {/* CRT Screen area */}
    <rect x="2" y="4" width="12" height="6" fill={color} />
    <rect x="4" y="4" width="8" height="5" fill="#180828" />
    <rect x="5" y="5" width="2" height="2" fill="#dfff00" />
    {/* Control deck */}
    <rect x="2" y="9" width="12" height="2" fill="#9333ea" />
    {/* Joystick */}
    <rect x="4" y="8" width="1" height="2" fill="#dfff00" />
    <rect x="3.5" y="7" width="2" height="1" fill="#ec4899" />
    {/* Buttons */}
    <rect x="8" y="9" width="1" height="1" fill="#dfff00" />
    <rect x="10" y="9" width="1" height="1" fill="#ec4899" />
    {/* Lower Body & Coin Door */}
    <rect x="3" y="11" width="10" height="5" fill={color} />
    <rect x="6" y="12" width="4" height="3" fill="#140524" />
    <rect x="7" y="13" width="2" height="1" fill="#dfff00" />
  </svg>
);

export const PixelCrtMonitor: React.FC<PixelIconProps> = ({ size = 24, className = '', color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    shapeRendering="crispEdges"
    className={`inline-block ${className}`}
  >
    <rect x="1" y="2" width="14" height="10" fill={color} />
    <rect x="2" y="1" width="12" height="12" fill={color} />
    {/* Screen */}
    <rect x="3" y="3" width="8" height="7" fill="#180828" />
    <rect x="4" y="4" width="2" height="2" fill="#dfff00" />
    <rect x="8" y="7" width="2" height="2" fill="#9333ea" />
    {/* Knobs on the right */}
    <rect x="12" y="4" width="1" height="1" fill="#dfff00" />
    <rect x="12" y="7" width="1" height="1" fill="#dfff00" />
    {/* Stand */}
    <rect x="6" y="13" width="4" height="1" fill={color} />
    <rect x="4" y="14" width="8" height="1" fill={color} />
  </svg>
);

export const PixelFloppy: React.FC<PixelIconProps> = ({ size = 24, className = '', color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    shapeRendering="crispEdges"
    className={`inline-block ${className}`}
  >
    <rect x="2" y="1" width="11" height="14" fill={color} />
    <rect x="1" y="2" width="14" height="12" fill={color} />
    {/* Metal Shutter Top */}
    <rect x="5" y="1" width="6" height="5" fill="#dfff00" />
    <rect x="8" y="2" width="2" height="3" fill="#140524" />
    {/* Label Bottom */}
    <rect x="4" y="8" width="8" height="6" fill="#ffffff" />
    <rect x="5" y="10" width="6" height="1" fill="#9333ea" />
    <rect x="5" y="12" width="4" height="1" fill="#140524" />
  </svg>
);

export const PixelCpu: React.FC<PixelIconProps> = ({ size = 24, className = '', color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    shapeRendering="crispEdges"
    className={`inline-block ${className}`}
  >
    {/* CPU Chip */}
    <rect x="4" y="4" width="8" height="8" fill={color} />
    <rect x="5" y="5" width="6" height="6" fill="#180828" />
    <rect x="6" y="6" width="4" height="4" fill="#dfff00" />
    {/* Top/Bottom Pins */}
    <rect x="5" y="1" width="1" height="2" fill="#dfff00" />
    <rect x="8" y="1" width="1" height="2" fill="#dfff00" />
    <rect x="10" y="1" width="1" height="2" fill="#dfff00" />
    <rect x="5" y="13" width="1" height="2" fill="#dfff00" />
    <rect x="8" y="13" width="1" height="2" fill="#dfff00" />
    <rect x="10" y="13" width="1" height="2" fill="#dfff00" />
    {/* Left/Right Pins */}
    <rect x="1" y="5" width="2" height="1" fill="#dfff00" />
    <rect x="1" y="8" width="2" height="1" fill="#dfff00" />
    <rect x="1" y="10" width="2" height="1" fill="#dfff00" />
    <rect x="13" y="5" width="2" height="1" fill="#dfff00" />
    <rect x="13" y="8" width="2" height="1" fill="#dfff00" />
    <rect x="13" y="10" width="2" height="1" fill="#dfff00" />
  </svg>
);

export const PixelHeart: React.FC<PixelIconProps & { filled?: boolean }> = ({ size = 24, className = '', filled = true }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    shapeRendering="crispEdges"
    className={`inline-block ${className}`}
  >
    {/* 8-bit Heart */}
    <rect x="3" y="3" width="3" height="1" fill={filled ? '#dfff00' : '#4b5563'} />
    <rect x="10" y="3" width="3" height="1" fill={filled ? '#dfff00' : '#4b5563'} />
    <rect x="2" y="4" width="5" height="3" fill={filled ? '#dfff00' : '#4b5563'} />
    <rect x="9" y="4" width="5" height="3" fill={filled ? '#dfff00' : '#4b5563'} />
    <rect x="3" y="7" width="10" height="2" fill={filled ? '#dfff00' : '#4b5563'} />
    <rect x="4" y="9" width="8" height="2" fill={filled ? '#dfff00' : '#4b5563'} />
    <rect x="6" y="11" width="4" height="2" fill={filled ? '#dfff00' : '#4b5563'} />
    <rect x="7" y="13" width="2" height="1" fill={filled ? '#dfff00' : '#4b5563'} />
  </svg>
);

export const PixelCoin: React.FC<PixelIconProps> = ({ size = 24, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    shapeRendering="crispEdges"
    className={`inline-block ${className}`}
  >
    <rect x="5" y="2" width="6" height="12" fill="#dfff00" />
    <rect x="3" y="4" width="10" height="8" fill="#dfff00" />
    <rect x="4" y="3" width="8" height="10" fill="#dfff00" />
    {/* Inner detail */}
    <rect x="6" y="5" width="4" height="6" fill="#180828" />
    <rect x="7" y="6" width="2" height="4" fill="#dfff00" />
  </svg>
);

export const PixelGhost: React.FC<PixelIconProps> = ({ size = 24, className = '', color = '#c084fc' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    shapeRendering="crispEdges"
    className={`inline-block ${className}`}
  >
    <rect x="4" y="2" width="8" height="1" fill={color} />
    <rect x="3" y="3" width="10" height="9" fill={color} />
    <rect x="2" y="4" width="12" height="7" fill={color} />
    {/* Bottom spikes */}
    <rect x="2" y="11" width="2" height="3" fill={color} />
    <rect x="6" y="11" width="4" height="3" fill={color} />
    <rect x="12" y="11" width="2" height="3" fill={color} />
    {/* Eyes */}
    <rect x="4" y="5" width="3" height="3" fill="#ffffff" />
    <rect x="9" y="5" width="3" height="3" fill="#ffffff" />
    <rect x="5" y="6" width="2" height="2" fill="#140524" />
    <rect x="10" y="6" width="2" height="2" fill="#140524" />
  </svg>
);

export const PixelTrophy: React.FC<PixelIconProps> = ({ size = 24, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    shapeRendering="crispEdges"
    className={`inline-block ${className}`}
  >
    <rect x="4" y="2" width="8" height="6" fill="#dfff00" />
    <rect x="5" y="8" width="6" height="2" fill="#dfff00" />
    <rect x="7" y="10" width="2" height="2" fill="#dfff00" />
    <rect x="5" y="12" width="6" height="2" fill="#dfff00" />
    {/* Handles */}
    <rect x="2" y="3" width="2" height="3" fill="#dfff00" />
    <rect x="12" y="3" width="2" height="3" fill="#dfff00" />
  </svg>
);

export const PixelSound: React.FC<PixelIconProps & { muted?: boolean }> = ({ size = 24, className = '', muted = false }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    shapeRendering="crispEdges"
    className={`inline-block ${className}`}
  >
    <rect x="2" y="6" width="3" height="4" fill="#dfff00" />
    <rect x="5" y="5" width="2" height="6" fill="#dfff00" />
    <rect x="7" y="4" width="2" height="8" fill="#dfff00" />
    {!muted ? (
      <>
        <rect x="11" y="5" width="1" height="6" fill="#c084fc" />
        <rect x="13" y="3" width="1" height="10" fill="#c084fc" />
      </>
    ) : (
      <>
        <rect x="11" y="6" width="1" height="1" fill="#ec4899" />
        <rect x="12" y="7" width="1" height="1" fill="#ec4899" />
        <rect x="13" y="8" width="1" height="1" fill="#ec4899" />
        <rect x="11" y="8" width="1" height="1" fill="#ec4899" />
        <rect x="13" y="6" width="1" height="1" fill="#ec4899" />
      </>
    )}
  </svg>
);

export const PixelBattery: React.FC<PixelIconProps & { level?: number }> = ({ size = 24, className = '', level = 100 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    shapeRendering="crispEdges"
    className={`inline-block ${className}`}
  >
    <rect x="1" y="4" width="12" height="8" fill="#000000" />
    <rect x="2" y="5" width="10" height="6" fill="#140524" />
    <rect x="13" y="6" width="2" height="4" fill="#dfff00" />
    {level >= 25 && <rect x="3" y="6" width="2" height="4" fill="#dfff00" />}
    {level >= 50 && <rect x="5.5" y="6" width="2" height="4" fill="#dfff00" />}
    {level >= 75 && <rect x="8" y="6" width="2" height="4" fill="#dfff00" />}
    {level >= 95 && <rect x="10" y="6" width="1" height="4" fill="#dfff00" />}
  </svg>
);

export const PixelDisc: React.FC<PixelIconProps> = ({ size = 24, className = '', color = '#c084fc' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    shapeRendering="crispEdges"
    className={`inline-block ${className}`}
  >
    <rect x="4" y="2" width="8" height="12" fill={color} />
    <rect x="2" y="4" width="12" height="8" fill={color} />
    <rect x="3" y="3" width="10" height="10" fill={color} />
    {/* Center Hole */}
    <rect x="6" y="6" width="4" height="4" fill="#0e0416" />
    <rect x="7" y="7" width="2" height="2" fill="#dfff00" />
  </svg>
);
