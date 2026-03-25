export type NPCId = 'ohbaksa' | 'dasom' | 'jjanggu';
export type NPCExpression = 'default' | 'surprised' | 'celebrate' | 'worried';

export interface NPCProfile {
  id: NPCId;
  name: string;
  role: string;
  images: Partial<Record<NPCExpression, string>>;
  borderColor: string;
  fallbackEmoji: string;
}

export const npcs: Record<NPCId, NPCProfile> = {
  ohbaksa: {
    id: 'ohbaksa',
    name: '오박사',
    role: '간식왕국 데이터 연구소장',
    images: {
      default: '/images/npc-ohbaksa.png',
      surprised: '/images/npc-ohbaksa-surprised.png',
      celebrate: '/images/npc-ohbaksa-celebrate.png',
      worried: '/images/npc-ohbaksa-worried.png',
    },
    borderColor: '#ffd700',
    fallbackEmoji: '🔬',
  },
  dasom: {
    id: 'dasom',
    name: '다솜 박사',
    role: '크리에이티브 랩 연구원',
    images: {
      default: '/images/npc-dasom.png',
      surprised: '/images/npc-dasom-surprised.png',
      celebrate: '/images/npc-dasom-celebrate.png',
    },
    borderColor: '#ff6b35',
    fallbackEmoji: '🎨',
  },
  jjanggu: {
    id: 'jjanggu',
    name: '짱구 원장',
    role: '실전 훈련소 원장',
    images: {
      default: '/images/npc-jjanggu.png',
      surprised: '/images/npc-jjanggu-surprised.png',
      celebrate: '/images/npc-jjanggu-celebrate.png',
    },
    borderColor: '#c850ff',
    fallbackEmoji: '🏋️',
  },
};

// Which NPC handles which mission level
export const missionNPC: Record<number, NPCId> = {
  1: 'ohbaksa',
  2: 'dasom',
  3: 'jjanggu',
};
