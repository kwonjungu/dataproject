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
}
