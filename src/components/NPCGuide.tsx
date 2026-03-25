'use client';

import { AnimatePresence } from 'framer-motion';
import { useDialogue } from '@/hooks/useDialogue';
import { DialogueLine } from '@/data/dialogues';
import DialogueBox from './DialogueBox';

interface NPCGuideProps {
  onComplete?: () => void;
}

export function useNPCGuide(onComplete?: () => void) {
  const dialogue = useDialogue(onComplete);

  const trigger = (lines: DialogueLine[]) => {
    dialogue.startDialogue(lines);
  };

  return { ...dialogue, trigger };
}

export default function NPCGuideOverlay({
  dialogue,
}: {
  dialogue: ReturnType<typeof useNPCGuide>;
}) {
  return (
    <AnimatePresence>
      {dialogue.isActive && dialogue.currentLine && (
        <DialogueBox
          npcId={dialogue.currentLine.npcId}
          expression={dialogue.currentLine.expression}
          displayedText={dialogue.displayedText}
          isTyping={dialogue.isTyping}
          lineIndex={dialogue.lineIndex}
          totalLines={dialogue.totalLines}
          onAdvance={dialogue.advance}
          onSkip={dialogue.skipAll}
        />
      )}
    </AnimatePresence>
  );
}
