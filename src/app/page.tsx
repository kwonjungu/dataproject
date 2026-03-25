'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Starfield from '@/components/Starfield';
import BGMPlayer from '@/components/BGMPlayer';
import NPCGuideOverlay, { useNPCGuide } from '@/components/NPCGuide';
import { getDialogueScript } from '@/data/dialogues';

export default function Home() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkingSession, setCheckingSession] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const router = useRouter();

  const npcGuide = useNPCGuide(() => {
    // After intro dialogue ends, show the name input form
    setShowForm(true);
  });

  useEffect(() => {
    const storedId = localStorage.getItem('studentId');
    const storedName = localStorage.getItem('studentName');
    if (storedId && storedName) {
      router.push('/map');
    } else {
      setCheckingSession(false);
      // Trigger intro dialogue
      setTimeout(() => {
        npcGuide.trigger(getDialogueScript('intro'));
      }, 800);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('이름을 입력해주세요!');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/students/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || '오류가 발생했습니다.');
        setLoading(false);
        return;
      }

      localStorage.setItem('studentId', data.id);
      localStorage.setItem('studentName', data.name);
      localStorage.setItem('firstVisit', 'true');
      router.push('/map');
    } catch {
      setError('서버에 연결할 수 없습니다.');
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-deep-navy">
        <div className="text-mute-blue animate-pulse text-lg font-ui">로딩 중...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      <Starfield />
      <BGMPlayer />

      <div className="relative z-10 text-center px-6 max-w-lg lg:max-w-2xl xl:max-w-3xl w-full">
        {/* Title */}
        <motion.h1
          className="text-3xl sm:text-4xl lg:text-6xl xl:text-7xl font-title text-gold mb-6 lg:mb-10"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          간식왕국 구출 대작전
        </motion.h1>

        {/* Name input form - appears after intro dialogue */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              className="flex flex-col items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="mb-4">
                <span className="text-xs text-cyan-blue bg-cyan-blue/20 px-2 py-0.5 rounded font-ui">수호대 모집</span>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-title text-gold mb-2">데이터 수호대</h2>
              <p className="text-sm lg:text-lg text-mute-blue mb-6 font-ui">수호대원 이름을 입력하세요</p>

              <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4 w-full">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="수호대원 이름"
                  maxLength={20}
                  className="w-72 lg:w-96 px-6 py-3 lg:py-4 rounded-xl bg-dark-indigo border-2 border-mute-blue/30 text-light-gray text-center text-lg lg:text-xl font-ui placeholder:text-mute-blue/50 focus:outline-none focus:border-gold transition-all"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-72 lg:w-96 py-3 lg:py-4 rounded-xl bg-gradient-to-r from-cyan-blue to-electric-purple text-white text-lg lg:text-xl font-title hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
                >
                  {loading ? '등록 중...' : '수호대 활동 시작!'}
                </button>
                {error && (
                  <motion.p className="text-red-400 text-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    {error}
                  </motion.p>
                )}
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Waiting for dialogue hint */}
        {!showForm && !npcGuide.isActive && (
          <motion.p
            className="text-mute-blue text-sm mt-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            잠시만 기다려주세요...
          </motion.p>
        )}
      </div>

      {/* NPC Dialogue overlay */}
      <NPCGuideOverlay dialogue={npcGuide} />
    </main>
  );
}
