'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StageData } from '@/types';
import { playSound } from '@/lib/sounds';

interface StageModalProps {
  stage: StageData;
  isOpen: boolean;
  onClose: () => void;
  isUnlocked: boolean;
  studentId: string;
  onBadgeClaimed: (level: number) => void;
}

export default function StageModal({
  stage,
  isOpen,
  onClose,
  isUnlocked,
  studentId,
  onBadgeClaimed,
}: StageModalProps) {
  const [authKey, setAuthKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleClaim = async () => {
    if (!authKey.trim()) {
      setError('인증키를 입력해주세요.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/badges/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, level: stage.level, key: authKey }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || '배지 획득에 실패했습니다.');
        setLoading(false);
        return;
      }

      playSound('success');
      onBadgeClaimed(stage.level);
      onClose();
    } catch {
      setError('서버 오류가 발생했습니다.');
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-lg rounded-2xl border p-6 z-10"
            style={{
              background: 'linear-gradient(135deg, #111640 0%, #0a0e27 100%)',
              borderColor: stage.color + '40',
              boxShadow: `0 0 30px ${stage.color}20`,
            }}
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 50 }}
          >
            {/* Header */}
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">{stage.emoji}</div>
              <h2
                className="text-2xl font-title"
                style={{ color: stage.color }}
              >
                Lv{stage.level}. {stage.title}
              </h2>
              <p className="text-mute-blue text-sm mt-1">
                {stage.phase} · {stage.sessions}
              </p>
            </div>

            {/* Content */}
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-mute-blue font-semibold mb-1">주제</p>
                <p className="text-light-gray">{stage.subject}</p>
              </div>
              <div>
                <p className="text-mute-blue font-semibold mb-1">학습목표</p>
                <p className="text-light-gray">{stage.objective}</p>
              </div>
              <div>
                <p className="text-mute-blue font-semibold mb-1">핵심 활동</p>
                <ul className="space-y-1">
                  {stage.activities.map((act, i) => (
                    <li key={i} className="text-light-gray flex gap-2">
                      <span style={{ color: stage.color }}>▸</span>
                      {act}
                    </li>
                  ))}
                </ul>
              </div>
              <div
                className="rounded-lg p-3 text-center italic"
                style={{ background: stage.color + '15', color: stage.color }}
              >
                &quot;{stage.story}&quot;
              </div>
            </div>

            {/* Auth Key Input */}
            {!isUnlocked && (
              <div className="mt-5 space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={authKey}
                    onChange={(e) => setAuthKey(e.target.value)}
                    placeholder="인증키를 입력하세요"
                    className="flex-1 rounded-lg bg-deep-navy border border-mute-blue/30 px-4 py-2 text-light-gray placeholder:text-mute-blue/50 focus:outline-none focus:border-gold transition"
                    onKeyDown={(e) => e.key === 'Enter' && handleClaim()}
                  />
                  <button
                    onClick={handleClaim}
                    disabled={loading}
                    className="rounded-lg px-5 py-2 font-ui text-white transition hover:brightness-110 disabled:opacity-50"
                    style={{ background: stage.color }}
                  >
                    {loading ? '...' : '확인'}
                  </button>
                </div>
                {error && (
                  <p className="text-red-400 text-xs text-center">{error}</p>
                )}
              </div>
            )}

            {isUnlocked && (
              <div className="mt-5 text-center">
                <span
                  className="inline-block rounded-full px-4 py-1 text-sm font-semibold"
                  style={{ background: stage.color + '20', color: stage.color }}
                >
                  배지 획득 완료!
                </span>
              </div>
            )}

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-mute-blue hover:text-light-gray transition text-xl"
            >
              ✕
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
