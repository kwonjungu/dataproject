'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Starfield from '@/components/Starfield';
import BGMPlayer from '@/components/BGMPlayer';
import GameMap from '@/components/GameMap';
import BadgeCeremony from '@/components/BadgeCeremony';
import EndingSequence from '@/components/EndingSequence';
import NPCGuideOverlay, { useNPCGuide } from '@/components/NPCGuide';
import { getDialogueScript } from '@/data/dialogues';
import { Badge } from '@/types';

export default function MapPage() {
  const [studentId, setStudentId] = useState<string | null>(null);
  const [studentName, setStudentName] = useState('');
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [ceremonyLevel, setCeremonyLevel] = useState<number | null>(null);
  const [showEnding, setShowEnding] = useState(false);
  const router = useRouter();

  const npcGuide = useNPCGuide();

  useEffect(() => {
    const id = localStorage.getItem('studentId');
    const name = localStorage.getItem('studentName');

    if (!id || !name) {
      router.push('/');
      return;
    }

    setStudentId(id);
    setStudentName(name);

    fetch(`/api/students/${id}`)
      .then((res) => res.json())
      .then((data) => {
        const b = data.badges || [];
        setBadges(b);
        setLoading(false);

        const isFirst = localStorage.getItem('firstVisit') === 'true';
        if (isFirst) {
          localStorage.removeItem('firstVisit');
          setTimeout(() => {
            npcGuide.trigger(getDialogueScript('firstMapEntry', name));
          }, 800);
        } else {
          const count = b.length;
          const key = `reconnect${count}` as 'reconnect0' | 'reconnect1' | 'reconnect2' | 'reconnect3';
          setTimeout(() => {
            npcGuide.trigger(getDialogueScript(key, name));
          }, 600);
        }
      })
      .catch(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBadgeClaimed = useCallback((level: number) => {
    setCeremonyLevel(level);
    if (studentId) {
      fetch(`/api/students/${studentId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.badges) setBadges(data.badges);
        });
    }
  }, [studentId]);

  const handleCeremonyComplete = useCallback(() => {
    const completedLevel = ceremonyLevel;
    setCeremonyLevel(null);

    const name = localStorage.getItem('studentName') || '';
    const key = `mission${completedLevel}Badge` as 'mission1Badge' | 'mission2Badge' | 'mission3Badge';

    // If Mission 3 was just completed → trigger ending after NPC dialogue
    if (completedLevel === 3) {
      const endingGuide = getDialogueScript(key, name);
      npcGuide.trigger(endingGuide);
      // Start ending after a short delay to let dialogue begin
      setTimeout(() => {
        setShowEnding(true);
      }, endingGuide.length * 3000 + 1000);
    } else {
      setTimeout(() => {
        npcGuide.trigger(getDialogueScript(key, name));
      }, 500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ceremonyLevel]);

  const handleLockedClick = useCallback(() => {
    npcGuide.trigger(getDialogueScript('lockedMission'));
  }, [npcGuide]);

  const handleMissionDialogue = useCallback((level: number) => {
    const name = localStorage.getItem('studentName') || '';
    const key = `mission${level}Open` as 'mission1Open' | 'mission2Open' | 'mission3Open';
    npcGuide.trigger(getDialogueScript(key, name));
  }, [npcGuide]);

  const handleLogout = () => {
    localStorage.removeItem('studentId');
    localStorage.removeItem('studentName');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-deep-navy">
        <div className="text-mute-blue animate-pulse text-lg font-ui">맵 로딩 중...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen relative">
      <Starfield />
      <BGMPlayer />

      {/* Top buttons */}
      <div className="fixed top-4 right-4 z-40 flex gap-2">
        <button
          onClick={() => router.push('/gallery')}
          className="px-3 py-1.5 rounded-lg bg-dark-indigo border border-gold/30 text-gold text-sm font-ui hover:bg-gold/10 hover:border-gold transition"
        >
          🏆 배지 보관함
        </button>
        <button
          onClick={handleLogout}
          className="px-3 py-1.5 rounded-lg bg-dark-indigo border border-mute-blue/30 text-mute-blue text-sm font-ui hover:text-light-gray hover:border-mute-blue transition"
        >
          나가기
        </button>
      </div>

      <div className="relative z-10">
        {studentId && (
          <GameMap
            studentId={studentId}
            studentName={studentName}
            badges={badges}
            onBadgeClaimed={handleBadgeClaimed}
            onLockedClick={handleLockedClick}
            onMissionDialogue={handleMissionDialogue}
          />
        )}
      </div>

      {ceremonyLevel && (
        <BadgeCeremony
          level={ceremonyLevel}
          studentName={studentName}
          onComplete={handleCeremonyComplete}
        />
      )}

      {/* Ending sequence overlay - triggered after M3 badge */}
      {showEnding && (
        <EndingSequence
          studentName={studentName}
          onComplete={() => {
            setShowEnding(false);
            router.push('/gallery');
          }}
        />
      )}

      <NPCGuideOverlay dialogue={npcGuide} />
    </main>
  );
}
