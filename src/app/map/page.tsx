'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Starfield from '@/components/Starfield';
import GameMap from '@/components/GameMap';
import BadgeCeremony from '@/components/BadgeCeremony';
import { Badge } from '@/types';

export default function MapPage() {
  const [studentId, setStudentId] = useState<string | null>(null);
  const [studentName, setStudentName] = useState('');
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [ceremonyLevel, setCeremonyLevel] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    const id = localStorage.getItem('studentId');
    const name = localStorage.getItem('studentName');

    if (!id || !name) {
      router.push('/');
      return;
    }

    setStudentId(id);
    setStudentName(name);

    // Fetch current badge status
    fetch(`/api/students/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.badges) {
          setBadges(data.badges);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router]);

  const handleBadgeClaimed = useCallback((level: number) => {
    setCeremonyLevel(level);
    // Refresh badges
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
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('studentId');
    localStorage.removeItem('studentName');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-deep-navy">
        <div className="text-mute-blue animate-pulse text-lg font-ui">
          맵 로딩 중...
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen relative">
      <Starfield />

      {/* Logout button */}
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
          />
        )}
      </div>

      {/* Badge ceremony overlay */}
      {ceremonyLevel && (
        <BadgeCeremony
          level={ceremonyLevel}
          studentName={studentName}
          onComplete={handleCeremonyComplete}
        />
      )}
    </main>
  );
}
