import { useState, useEffect } from 'react';
import { Exercise } from '../types';
import { supabase } from '../lib/supabase';

export function useExercises() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExercises();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchExercises();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchExercises = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setExercises([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) throw error;
      setExercises(data || []);
    } catch (error) {
      console.error('Error fetching exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  const addExercise = async (exercise: Omit<Exercise, 'id' | 'timestamp'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const newExercise = {
        ...exercise,
        user_id: user.id,
        timestamp: Date.now(),
      };

      const { data, error } = await supabase
        .from('exercises')
        .insert([newExercise])
        .select()
        .single();

      if (error) throw error;
      setExercises([data, ...exercises]);
    } catch (error) {
      console.error('Error adding exercise:', error);
      alert('Failed to save exercise. Please try again.');
    }
  };

  const deleteExercise = async (id: string) => {
    try {
      const { error } = await supabase
        .from('exercises')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setExercises(exercises.filter((ex) => ex.id !== id));
    } catch (error) {
      console.error('Error deleting exercise:', error);
      alert('Failed to delete exercise.');
    }
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
      count: todayExercises.length,
      distance: todayExercises.reduce((acc, curr) => acc + (curr.distance || 0), 0),
    };
  };

  return {
    exercises,
    loading,
    addExercise,
    deleteExercise,
    getTodayExercises,
    getStats
  };
}
