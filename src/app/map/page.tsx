'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Starfield from '@/components/Starfield';
import BGMPlayer from '@/components/BGMPlayer';
import GameMap from '@/components/GameMap';
import BadgeCeremony from '@/components/BadgeCeremony';
import NPCGuideOverlay, { useNPCGuide } from '@/components/NPCGuide';
import { getDialogueScript } from '@/data/dialogues';
import { Badge } from '@/types';

export default function MapPage() {
  const [studentId, setStudentId] = useState<string | null>(null);
  const [studentName, setStudentName] = useState('');
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [ceremonyLevel, setCeremonyLevel] = useState<number | null>(null);
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

        // Trigger appropriate NPC dialogue
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
    setCeremonyLevel(null);
    // Trigger badge NPC dialogue
    const name = localStorage.getItem('studentName') || '';
    const key = `mission${ceremonyLevel}Badge` as 'mission1Badge' | 'mission2Badge' | 'mission3Badge';
    setTimeout(() => {
      npcGuide.trigger(getDialogueScript(key, name));
    }, 500);
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

      <button
        onClick={handleLogout}
        className="fixed top-4 right-4 z-40 px-3 py-1.5 rounded-lg bg-dark-indigo border border-mute-blue/30 text-mute-blue text-sm font-ui hover:text-light-gray hover:border-mute-blue transition"
      >
        나가기
      </button>

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

      <NPCGuideOverlay dialogue={npcGuide} />
    </main>
  );
}
