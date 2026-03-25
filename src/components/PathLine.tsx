'use client';

import { motion } from 'framer-motion';

interface PathLineProps {
  color: string;
  isActive: boolean;
  index: number;
}

export default function PathLine({ color, isActive, index }: PathLineProps) {
  return (
    <div className="flex justify-center py-1 sm:py-2 lg:py-0 lg:px-2">
      {/* Vertical line (mobile/tablet) */}
      <motion.div
        className="w-1 h-14 sm:h-20 rounded-full lg:hidden"
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
      {/* Horizontal line (desktop) */}
      <motion.div
        className="hidden lg:block h-1 w-20 xl:w-28 rounded-full"
        style={{
          background: isActive
            ? `linear-gradient(to right, ${color}, ${color}50)`
            : 'linear-gradient(to right, #333355, #222244)',
          boxShadow: isActive ? `0 0 10px ${color}40` : 'none',
        }}
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ delay: index * 0.3 + 0.15, duration: 0.4 }}
      />
    </div>
  );
}
