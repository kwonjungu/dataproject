'use client';

import { useEffect, useState } from 'react';

const FOOD_EMOJIS = [
  '🍕', '🍔', '🍟', '🌭', '🍿', '🧁', '🍩', '🍪', '🍫', '🍬',
  '🥤', '🧃', '🍭', '🥨', '🥐', '🍰', '🎂',
  '🥕', '🥦', '🍎', '🍊', '🍇', '🍓', '🥝', '🍌', '🍉', '🥬',
  '🍗', '🥩', '🥚', '🧀', '🥛', '🍚', '🍙',
];

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

interface FloatingFood {
  id: number;
  emoji: string;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  drift: number;
}

export default function Starfield() {
  const [stars, setStars] = useState<Star[]>([]);
  const [foods, setFoods] = useState<FloatingFood[]>([]);

  useEffect(() => {
    const generatedStars: Star[] = Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 5,
    }));
    setStars(generatedStars);

    const generatedFoods: FloatingFood[] = Array.from({ length: 45 }, (_, i) => ({
      id: i,
      emoji: FOOD_EMOJIS[Math.floor(Math.random() * FOOD_EMOJIS.length)],
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 28 + 14,
      duration: Math.random() * 6 + 5,
      delay: Math.random() * 8,
      drift: (Math.random() - 0.5) * 120,
    }));
    setFoods(generatedFoods);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Stars */}
      {stars.map((star) => (
        <div
          key={`s-${star.id}`}
          className="absolute rounded-full bg-white animate-twinkle"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            '--duration': `${star.duration}s`,
            '--delay': `${star.delay}s`,
          } as React.CSSProperties}
        />
      ))}

      {/* Floating food emojis */}
      {foods.map((food) => (
        <div
          key={`f-${food.id}`}
          className="absolute animate-food-float"
          style={{
            left: `${food.x}%`,
            top: `${food.y}%`,
            fontSize: `${food.size}px`,
            opacity: 0.15,
            '--float-duration': `${food.duration}s`,
            '--float-delay': `${food.delay}s`,
            '--float-drift': `${food.drift}px`,
          } as React.CSSProperties}
        >
          {food.emoji}
        </div>
      ))}
    </div>
  );
}
