import { useState, useEffect } from 'react';
import { Exercise } from '../types';
import { supabase } from '../lib/supabase';

export function useExercises() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchExercises = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false });

      if (error) throw error;
      setExercises(data || []);
    } catch (e) {
      console.error('Failed to fetch exercises', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExercises();

    // Set up real-time subscription
    const subscription = supabase
      .channel('exercises_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'exercises' }, () => {
        fetchExercises();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const addExercise = async (exercise: Omit<Exercise, 'id' | 'timestamp'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const newExercise = {
        ...exercise,
        user_id: user.id,
        timestamp: Date.now(),
      };

      const { error } = await supabase
        .from('exercises')
        .insert([newExercise]);

      if (error) throw error;
    } catch (e) {
      console.error('Failed to add exercise', e);
    }
  };

  const deleteExercise = async (id: string) => {
    try {
      const { error } = await supabase
        .from('exercises')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (e) {
      console.error('Failed to delete exercise', e);
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
      count: todayExercises.length
    };
  };

  return {
    exercises,
    loading,
    addExercise,
    deleteExercise,
    getTodayExercises,
    getStats,
    refresh: fetchExercises
  };
}
