export type ExerciseType = 'cardio' | 'strength' | 'flexibility' | 'sport' | 'other';

export interface Exercise {
  id: string;
  name: string;
  type: ExerciseType;
  duration: number; // in minutes
  calories: number; // estimated
  distance?: number; // in meters
  route?: { lat: number; lng: number; timestamp: number }[];
  date: string; // YYYY-MM-DD
  timestamp: number;
  notes?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'workout' | 'goal' | 'system';
  timestamp: number;
  read: boolean;
}

export const EXERCISE_TYPES: { value: ExerciseType; label: string; color: string }[] = [
  { value: 'cardio', label: 'Cardio', color: 'bg-orange-500' },
  { value: 'strength', label: 'Strength', color: 'bg-blue-500' },
  { value: 'flexibility', label: 'Flexibility', color: 'bg-purple-500' },
  { value: 'sport', label: 'Sport', color: 'bg-green-500' },
  { value: 'other', label: 'Other', color: 'bg-gray-500' },
];
