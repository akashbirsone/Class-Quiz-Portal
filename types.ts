
export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number; // Index 0-3
  difficulty: Difficulty;
  explanation?: string;
}

export type QuizStatus = 'draft' | 'published';

export interface Quiz {
  id: string;
  title: string;
  subject?: string;
  description: string;
  academicYear: string;
  semester: string;
  questions: Question[];
  durationMinutes: number;
  createdAt: number;
  adminId: string;
  active: boolean;
  status: QuizStatus;
}

export type ViolationType = 'LOOK_AWAY' | 'NOT_VISIBLE' | 'MULTIPLE_PEOPLE' | 'TAB_SWITCH' | 'WINDOW_BLUR';

export interface Violation {
  id: string;
  studentId: string;
  quizId: string;
  type: ViolationType;
  timestamp: number;
  description: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'student';
  academicYear?: string;
  semester?: string;
  rollNumber?: string;
  password?: string;
  isBlocked?: boolean;
  blockedUntil?: number;
  warningCount?: number;
  isArchived?: boolean;
}

export interface Attempt {
  id: string;
  quizId: string;
  studentId: string;
  score: number;
  totalQuestions: number;
  timeTaken: number; // seconds
  timestamp: number;
  answers: Record<string, number>; // questionId -> selectedIndex
}

export interface LeaderboardEntry {
  studentName: string;
  studentEmail: string;
  academicYear: string;
  semester: string;
  score: number;
  totalQuizzes: number;
}
