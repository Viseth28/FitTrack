import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

export interface Profile {
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
}

export function useProfile(user: User | null) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    async function getProfile() {
      setLoading(true);
      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select(`username, full_name, avatar_url`)
        .eq('id', user.id)
        .single();

      if (!ignore) {
        if (data) {
          setProfile(data);
        }
        setLoading(false);
      }
    }

    getProfile();

    return () => {
      ignore = true;
    };
  }, [user]);

  return { profile, loading };
}
