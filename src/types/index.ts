export interface Student {
  id: string;
  name: string;
  created_at: string;
}

export interface Badge {
  id: string;
  student_id: string;
  level: number;
  awarded_at: string;
}

export interface AuthKey {
  id: string;
  level: number;
  key_value: string;
  created_at: string;
  updated_at: string;
}

export interface StudentWithBadges extends Student {
  badges: Badge[];
}

export interface NPC {
  name: string;
  role: string;
  message: string;
}

export interface MiniQuiz {
  question: string;
  choices: string[];
  correctIndex: number;
  hint: string;
}

export interface StageData {
  level: number;
  title: string;
  emoji: string;
  phase: string;
  sessions: string;
  subject: string;
  objective: string;
  activities: string[];
  story: string;
  color: string;
  // Game narrative fields
  missionTag: string;
  missionTitle: string;
  missionBriefing: string;
  missionObjective: string;
  completionStory: string;
  npcs: NPC[];
  reward: string;
  quizzes: MiniQuiz[];
}
