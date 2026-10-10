import React, { useRef } from 'react';

/** Path under frontend/public/ - drop the intro video file at this exact location. */
export const INTRO_VIDEO_SRC = '/intro/boot-intro.mp4';

interface BootIntroVideoProps {
  onComplete: () => void;
}

/**
 * Fullscreen boot intro played once, right after the NfcBootGate tap - that tap is what
 * allows this video to autoplay with sound. Always plays to completion (not skippable, by
 * design, for the card-launch flow).
 */
export const BootIntroVideo: React.FC<BootIntroVideoProps> = ({ onComplete }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
      <video
        ref={videoRef}
        src={INTRO_VIDEO_SRC}
        autoPlay
        playsInline
        onEnded={onComplete}
        onError={onComplete}
        className="w-full h-full object-contain"
      />
    </div>
  );
};
