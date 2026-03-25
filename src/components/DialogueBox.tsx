'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { npcs, NPCId, NPCExpression } from '@/data/npcs';

interface DialogueBoxProps {
  npcId: NPCId;
  expression: NPCExpression;
  displayedText: string;
  isTyping: boolean;
  lineIndex: number;
  totalLines: number;
  onAdvance: () => void;
  onSkip: () => void;
}

export default function DialogueBox({
  npcId,
  expression,
  displayedText,
  isTyping,
  lineIndex,
  totalLines,
  onAdvance,
  onSkip,
}: DialogueBoxProps) {
  const npc = npcs[npcId];
  const imageSrc = npc.images[expression] || npc.images.default;
  const [imgError, setImgError] = useState(false);

  return (
    <motion.div
      className="fixed bottom-0 left-0 right-0 z-[80] px-3 pb-3 sm:px-6 sm:pb-5 lg:px-12 lg:pb-8"
      initial={{ y: 200, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 200, opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
    >
      <div
        className="max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto rounded-2xl lg:rounded-3xl border p-3 sm:p-4 lg:p-6 xl:p-8 cursor-pointer select-none"
        style={{
          background: 'rgba(10, 14, 39, 0.95)',
          backdropFilter: 'blur(10px)',
          borderColor: 'rgba(255,255,255,0.15)',
        }}
        onClick={onAdvance}
      >
        <div className="flex gap-3 sm:gap-4 lg:gap-6 items-start">
          {/* NPC Portrait */}
          <div className="shrink-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${npcId}-${expression}`}
                className="w-16 h-16 sm:w-20 sm:h-20 lg:w-28 lg:h-28 xl:w-32 xl:h-32 rounded-full overflow-hidden relative flex items-center justify-center"
                style={{
                  border: `3px solid ${npc.borderColor}`,
                  background: 'rgba(17, 22, 64, 0.8)',
                  boxShadow: `0 0 20px ${npc.borderColor}30`,
                }}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {imageSrc && !imgError ? (
                  <Image
                    src={imageSrc}
                    alt={npc.name}
                    fill
                    className="object-cover"
                    sizes="(min-width: 1280px) 128px, (min-width: 1024px) 112px, (min-width: 640px) 80px, 64px"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <span className="text-3xl sm:text-4xl lg:text-5xl">{npc.fallbackEmoji}</span>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Dialogue content */}
          <div className="flex-1 min-w-0">
            {/* Name label */}
            <div className="flex items-center gap-2 lg:gap-3 mb-1.5 lg:mb-3">
              <span
                className="text-[10px] sm:text-xs lg:text-base font-ui font-bold px-2 lg:px-3 py-0.5 lg:py-1 rounded"
                style={{
                  background: npc.borderColor,
                  color: '#0a0e27',
                }}
              >
                {npc.name}
              </span>
              <span className="text-[9px] sm:text-xs lg:text-sm text-mute-blue">{npc.role}</span>
            </div>

            {/* Dialogue text */}
            <p className="text-sm sm:text-base lg:text-xl xl:text-2xl font-ui text-light-gray leading-relaxed min-h-[2.5rem] sm:min-h-[3rem] lg:min-h-[3.5rem]">
              {displayedText}
              {isTyping && (
                <span className="inline-block w-0.5 lg:w-1 h-4 lg:h-6 bg-light-gray ml-0.5 animate-pulse" />
              )}
            </p>

            {/* Bottom bar */}
            <div className="flex items-center justify-between mt-2 lg:mt-4">
              <span className="text-[10px] lg:text-sm text-mute-blue/60">
                {lineIndex + 1} / {totalLines}
              </span>
              <div className="flex items-center gap-3 lg:gap-4">
                <button
                  onClick={(e) => { e.stopPropagation(); onSkip(); }}
                  className="text-[10px] lg:text-sm text-mute-blue/50 hover:text-mute-blue transition"
                >
                  건너뛰기
                </button>
                {!isTyping && (
                  <motion.span
                    className="text-xs lg:text-lg"
                    style={{ color: npc.borderColor }}
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    ▼
                  </motion.span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
