'use client';

import { useState, useRef, useEffect } from 'react';

interface BGMPlayerProps {
  src?: string;
}

export default function BGMPlayer({ src = '/sounds/bgm.mp3' }: BGMPlayerProps) {
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    try {
      const audio = new Audio(src);
      audio.loop = true;
      audio.volume = 0.3;
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
  }, [src]);

  const toggle = () => {
    if (!audioRef.current) return;

    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setPlaying(true);
      }).catch(() => {
        // Autoplay blocked
      });
    }
  };

  if (!ready) return null;

  return (
    <button
      onClick={toggle}
      className="fixed top-4 left-4 z-50 w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-dark-indigo/80 border border-mute-blue/30 flex items-center justify-center text-lg lg:text-xl hover:border-mute-blue transition"
      title={playing ? '음악 끄기' : '음악 켜기'}
    >
      {playing ? '🔊' : '🔇'}
    </button>
  );
}
