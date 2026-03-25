'use client';

import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

export type DasomExpression = 'default' | 'surprised' | 'celebrate' | 'worried';

const expressionMap: Record<DasomExpression, string> = {
  default: '/images/npc-dasom.png',
  surprised: '/images/npc-dasom-surprised.png',
  celebrate: '/images/npc-dasom-celebrate.png',
  worried: '/images/npc-dasom-worried.png',
};

interface DialogueBoxProps {
  expression: DasomExpression;
  name?: string;
  role?: string;
  message: string;
  color?: string;
}

export default function DialogueBox({
  expression,
  name = '다솜 박사',
  role = '왕국 연구소장',
  message,
  color = '#00c9ff',
}: DialogueBoxProps) {
  return (
    <motion.div
      className="bg-dark-indigo/90 border border-mute-blue/20 rounded-xl p-3 sm:p-4 flex gap-3 items-start"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* NPC Portrait */}
      <div className="shrink-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={expression}
            className="w-14 h-14 sm:w-18 sm:h-18 rounded-xl bg-deep-navy border-2 overflow-hidden relative"
            style={{ borderColor: color + '40' }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Image
              src={expressionMap[expression]}
              alt={`${name} - ${expression}`}
              fill
              className="object-cover"
              sizes="72px"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dialogue content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-xs sm:text-sm font-bold" style={{ color }}>
            {name}
          </p>
          <p className="text-[9px] sm:text-[10px] text-mute-blue">{role}</p>
        </div>
        <p className="text-xs sm:text-sm text-light-gray font-ui leading-relaxed">
          &quot;{message}&quot;
        </p>
      </div>
    </motion.div>
  );
}
