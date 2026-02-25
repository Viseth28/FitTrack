export type ExerciseType = 'cardio' | 'sport' | 'running' | 'cycling' | 'walking' | 'hiking';

export const EXERCISE_TYPES: ExerciseType[] = ['cardio', 'sport', 'running', 'cycling', 'walking', 'hiking'];

export interface Exercise {
  id: string;
  name: string;
  type: ExerciseType;
  duration: number;
  distance?: number;
  calories: number;
  timestamp: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'goal' | 'workout' | 'system';
  timestamp: number;
  read: boolean;
}