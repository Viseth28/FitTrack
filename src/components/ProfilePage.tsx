import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'motion/react';
import { User as UserIcon, Mail, Save, LogOut, Loader2, Camera, X } from 'lucide-react';

interface ProfilePageProps {
  user: User | null;
  onLogout: () => void;
}

const AVATAR_SEEDS = [
  'Felix', 'Aneka', 'Zoe', 'Jack', 'Sam', 'Molly', 'Oliver', 'Luna', 
  'Leo', 'Max', 'Bella', 'Charlie', 'Lucy', 'Daisy', 'Rocky', 'Buddy'
];

export function ProfilePage({ user, onLogout }: ProfilePageProps) {
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [website, setWebsite] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);

  useEffect(() => {
    let ignore = false;
    async function getProfile() {
      setLoading(true);
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select(`username, website, avatar_url, full_name`)
        .eq('id', user.id)
        .single();

      if (!ignore) {
        if (error) {
          console.warn(error);
        } else if (data) {
          setUsername(data.username || '');
          setWebsite(data.website || '');
          setAvatarUrl(data.avatar_url || '');
          setFullName(data.full_name || '');
        }
        setLoading(false);
      }
    }

    getProfile();

    return () => {
      ignore = true;
    };
  }, [user]);

  async function updateProfile() {
    if (!user) return;

    setSaving(true);
    setMessage(null);

    const updates = {
      id: user.id,
      username,
      website,
      avatar_url: avatarUrl,
      full_name: fullName,
      updated_at: new Date(),
    };

    const { error } = await supabase.from('profiles').upsert(updates);

    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-lime-400" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-6 space-y-8 overflow-y-auto pb-24 relative">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative group">
          <div className="w-24 h-24 rounded-full bg-zinc-800 flex items-center justify-center text-gray-500 border border-white/5 relative overflow-hidden">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <UserIcon size={48} />
            )}
          </div>
          <button 
            onClick={() => setShowAvatarSelector(true)}
            className="absolute bottom-0 right-0 bg-lime-400 text-black p-2 rounded-full shadow-lg hover:bg-lime-500 transition-colors"
          >
            <Camera size={16} />
          </button>
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white">{fullName || 'User'}</h2>
          <p className="text-gray-500 text-sm">{user?.email}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-1">Email</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              id="email"
              type="text"
              value={user?.email || ''}
              disabled
              className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-gray-500 cursor-not-allowed"
            />
          </div>
        </div>

        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl py-4 px-4 text-white focus:border-lime-400 focus:ring-0 transition-all outline-none"
            placeholder="Your full name"
          />
        </div>

        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-400 mb-1">Username</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl py-4 px-4 text-white focus:border-lime-400 focus:ring-0 transition-all outline-none"
            placeholder="username"
          />
        </div>

        <div>
          <label htmlFor="website" className="block text-sm font-medium text-gray-400 mb-1">Website</label>
          <input
            id="website"
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl py-4 px-4 text-white focus:border-lime-400 focus:ring-0 transition-all outline-none"
            placeholder="https://example.com"
          />
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl text-sm font-medium ${message.type === 'success' ? 'bg-lime-400/10 text-lime-400' : 'bg-red-500/10 text-red-500'}`}>
          {message.text}
        </div>
      )}

      <div className="pt-4 space-y-4">
        <button
          onClick={updateProfile}
          disabled={saving}
          className="w-full bg-lime-400 text-black py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-lime-500 transition-all active:scale-95 shadow-xl shadow-lime-400/10 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {saving ? 'Saving...' : 'Update Profile'}
        </button>

        <button
          onClick={onLogout}
          className="w-full bg-red-500/10 text-red-500 py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all active:scale-95"
        >
          <LogOut className="w-5 h-5" />
          Log Out
        </button>
      </div>

      {/* Avatar Selector Modal */}
      <AnimatePresence>
        {showAvatarSelector && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAvatarSelector(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#1E1E2E] w-full max-w-sm rounded-3xl p-6 relative z-10 shadow-2xl border border-white/10 max-h-[80vh] flex flex-col"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Choose Avatar</h3>
                <button 
                  onClick={() => setShowAvatarSelector(false)}
                  className="p-2 bg-zinc-800 rounded-full hover:bg-zinc-700 transition-colors"
                >
                  <X size={20} className="text-gray-400" />
                </button>
              </div>
              
              <div className="grid grid-cols-4 gap-4 overflow-y-auto pr-2 pb-4">
                {AVATAR_SEEDS.map((seed) => {
                  const url = `https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}`;
                  return (
                    <button
                      key={seed}
                      onClick={() => {
                        setAvatarUrl(url);
                        setShowAvatarSelector(false);
                      }}
                      className="aspect-square rounded-full overflow-hidden border-2 border-transparent hover:border-lime-400 transition-all bg-zinc-800"
                    >
                      <img src={url} alt={seed} className="w-full h-full object-cover" />
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
