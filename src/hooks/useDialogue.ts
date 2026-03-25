'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { DialogueLine } from '@/data/dialogues';
import { playSound } from '@/lib/sounds';

interface UseDialogueReturn {
  currentLine: DialogueLine | null;
  displayedText: string;
  isTyping: boolean;
  isActive: boolean;
  lineIndex: number;
  totalLines: number;
  advance: () => void;
  startDialogue: (lines: DialogueLine[]) => void;
  skipAll: () => void;
}

const TYPING_SPEED = 30; // ms per character

export function useDialogue(onComplete?: () => void): UseDialogueReturn {
  const [lines, setLines] = useState<DialogueLine[]>([]);
  const [lineIndex, setLineIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fullTextRef = useRef('');

  const currentLine = isActive && lines[lineIndex] ? lines[lineIndex] : null;

  // Typing effect
  useEffect(() => {
    if (!currentLine) return;

    const text = currentLine.text;
    fullTextRef.current = text;
    setDisplayedText('');
    setIsTyping(true);

    let charIndex = 0;

    const typeNext = () => {
      if (charIndex < text.length) {
        charIndex++;
        setDisplayedText(text.slice(0, charIndex));
        timerRef.current = setTimeout(typeNext, TYPING_SPEED);
      } else {
        setIsTyping(false);
      }
    };

    timerRef.current = setTimeout(typeNext, TYPING_SPEED);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentLine, lineIndex]);

  const advance = useCallback(() => {
    if (!isActive) return;

    // If still typing, show full text immediately
    if (isTyping) {
      if (timerRef.current) clearTimeout(timerRef.current);
      setDisplayedText(fullTextRef.current);
      setIsTyping(false);
      return;
    }

    try { playSound('click'); } catch {}

    // Move to next line
    if (lineIndex < lines.length - 1) {
      setLineIndex((i) => i + 1);
    } else {
      // Dialogue complete
      setIsActive(false);
      setLines([]);
      setLineIndex(0);
      onComplete?.();
    }
  }, [isActive, isTyping, lineIndex, lines.length, onComplete]);

  const startDialogue = useCallback((newLines: DialogueLine[]) => {
    if (newLines.length === 0) return;
    setLines(newLines);
    setLineIndex(0);
    setDisplayedText('');
    setIsActive(true);
    try { playSound('click'); } catch {}
  }, []);

  const skipAll = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsActive(false);
    setLines([]);
    setLineIndex(0);
    onComplete?.();
  }, [onComplete]);

  return {
    currentLine,
    displayedText,
    isTyping,
    isActive,
    lineIndex,
    totalLines: lines.length,
    advance,
    startDialogue,
    skipAll,
  };
}
