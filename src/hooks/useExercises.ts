import { useState, useEffect } from 'react';
import { Exercise } from '../types';

const STORAGE_KEY = 'fittrack_data';

export function useExercises() {
  const [exercises, setExercises] = useState<Exercise[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setExercises(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse exercises', e);
      }
    }
  }, []);

  const saveExercises = (newExercises: Exercise[]) => {
    setExercises(newExercises);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newExercises));
  };

  const addExercise = (exercise: Omit<Exercise, 'id' | 'timestamp'>) => {
    const newExercise: Exercise = {
      ...exercise,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };
    saveExercises([newExercise, ...exercises]);
  };

  const deleteExercise = (id: string) => {
    saveExercises(exercises.filter((ex) => ex.id !== id));
  };

  const getTodayExercises = () => {
    const today = new Date().toLocaleDateString('en-CA');
    return exercises.filter((ex) => ex.date === today);
  };

  const getStats = () => {
    const today = new Date().toLocaleDateString('en-CA');
    const todayExercises = exercises.filter((ex) => ex.date === today);
    
    return {
      calories: todayExercises.reduce((acc, curr) => acc + (curr.calories || 0), 0),
      duration: todayExercises.reduce((acc, curr) => acc + (curr.duration || 0), 0),
      count: todayExercises.length
    };
  };

  return {
    exercises,
    addExercise,
    deleteExercise,
    getTodayExercises,
    getStats
  };
}
