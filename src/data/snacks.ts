export interface SnackItem {
  name: string;
  emoji: string;
  healthy: boolean;
}

export const snackItems: SnackItem[] = [
  // Healthy
  { name: '사과', emoji: '🍎', healthy: true },
  { name: '바나나', emoji: '🍌', healthy: true },
  { name: '포도', emoji: '🍇', healthy: true },
  { name: '딸기', emoji: '🍓', healthy: true },
  { name: '당근', emoji: '🥕', healthy: true },
  { name: '브로콜리', emoji: '🥦', healthy: true },
  { name: '우유', emoji: '🥛', healthy: true },
  { name: '고구마', emoji: '🍠', healthy: true },
  { name: '수박', emoji: '🍉', healthy: true },
  { name: '키위', emoji: '🥝', healthy: true },
  { name: '귤', emoji: '🍊', healthy: true },
  { name: '달걀', emoji: '🥚', healthy: true },
  // Junk
  { name: '콜라', emoji: '🥤', healthy: false },
  { name: '사탕', emoji: '🍬', healthy: false },
  { name: '초콜릿', emoji: '🍫', healthy: false },
  { name: '도넛', emoji: '🍩', healthy: false },
  { name: '감자튀김', emoji: '🍟', healthy: false },
  { name: '핫도그', emoji: '🌭', healthy: false },
  { name: '팝콘', emoji: '🍿', healthy: false },
  { name: '아이스크림', emoji: '🍦', healthy: false },
  { name: '케이크', emoji: '🍰', healthy: false },
  { name: '쿠키', emoji: '🍪', healthy: false },
  { name: '햄버거', emoji: '🍔', healthy: false },
  { name: '피자', emoji: '🍕', healthy: false },
];

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
