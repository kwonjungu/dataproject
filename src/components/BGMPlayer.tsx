'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BGMPlayerProps {
  src?: string;
}

export default function BGMPlayer({ src = '/sounds/bgm.mp3' }: BGMPlayerProps) {
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const [showPanel, setShowPanel] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    try {
      const audio = new Audio(src);
      audio.loop = true;
      audio.volume = volume;
      audio.preload = 'auto';

      audio.addEventListener('canplaythrough', () => setReady(true));
      audio.addEventListener('error', () => setReady(false));

      audioRef.current = audio;

      return () => {
        audio.pause();
        audio.src = '';
      };
    } catch {
      // Audio not supported
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const toggle = () => {
    if (!audioRef.current) return;

    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setPlaying(true);
      }).catch(() => {});
    }
  };

  const getIcon = () => {
    if (!playing) return '🔇';
    if (volume === 0) return '🔇';
    if (volume < 0.4) return '🔉';
    return '🔊';
  };

  if (!ready) return null;

  return (
    <div className="fixed top-4 left-4 z-50 flex items-center gap-2">
      {/* Main toggle button */}
      <button
        onClick={toggle}
        onMouseEnter={() => setShowPanel(true)}
        className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-dark-indigo/80 border border-mute-blue/30 flex items-center justify-center text-lg lg:text-xl hover:border-gold/50 transition"
        title={playing ? '음악 끄기' : '음악 켜기'}
      >
        {getIcon()}
      </button>

      {/* Volume panel */}
      <AnimatePresence>
        {showPanel && playing && (
          <motion.div
            className="flex items-center gap-2 bg-dark-indigo/90 border border-mute-blue/20 rounded-full px-3 py-2 backdrop-blur-sm"
            initial={{ opacity: 0, x: -10, width: 0 }}
            animate={{ opacity: 1, x: 0, width: 'auto' }}
            exit={{ opacity: 0, x: -10, width: 0 }}
            onMouseEnter={() => setShowPanel(true)}
            onMouseLeave={() => setShowPanel(false)}
          >
            {/* Volume down */}
            <button
              onClick={() => setVolume((v) => Math.max(0, Math.round((v - 0.1) * 10) / 10))}
              className="text-xs text-mute-blue hover:text-light-gray transition w-6 h-6 flex items-center justify-center"
            >
              ➖
            </button>

            {/* Volume slider */}
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-20 lg:w-28 h-1.5 accent-gold cursor-pointer"
            />

            {/* Volume up */}
            <button
              onClick={() => setVolume((v) => Math.min(1, Math.round((v + 0.1) * 10) / 10))}
              className="text-xs text-mute-blue hover:text-light-gray transition w-6 h-6 flex items-center justify-center"
            >
            ➕
            </button>

            {/* Volume percentage */}
            <span className="text-[10px] lg:text-xs text-mute-blue w-8 text-center">
              {Math.round(volume * 100)}%
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
