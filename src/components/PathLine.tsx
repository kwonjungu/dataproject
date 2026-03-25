'use client';

import { motion } from 'framer-motion';

interface PathLineProps {
  color: string;
  isActive: boolean;
  index: number;
}

export default function PathLine({ color, isActive, index }: PathLineProps) {
  return (
    <div className="flex justify-center py-2">
      <motion.div
        className="w-1 h-20 rounded-full"
        style={{
          background: isActive
            ? `linear-gradient(to bottom, ${color}, ${color}50)`
            : 'linear-gradient(to bottom, #333355, #222244)',
          boxShadow: isActive ? `0 0 10px ${color}40` : 'none',
        }}
        initial={{ scaleY: 0, opacity: 0 }}
        animate={{ scaleY: 1, opacity: 1 }}
        transition={{ delay: index * 0.3 + 0.15, duration: 0.4 }}
      />
    </div>
  );
}
