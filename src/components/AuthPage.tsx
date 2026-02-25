import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, ArrowRight, User, Loader2, AlertCircle, AtSign } from 'lucide-react';
import { supabase } from './supabase';

interface AuthPageProps {
  onLogin: () => void;
}

export function LoginPage({ onLogin }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({
    email: '',
    password: '',
    fullName: '',
    username: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAuth = async () => {
    try {
      setError(null);
      setLoading(true);

      if (isLogin) {
        if (!form.email.trim() || !form.password.trim()) {
          throw new Error('Please enter your email/username and password.');
        }
      } else {
        if (!form.email.trim() || !form.password.trim() || !form.fullName.trim() || !form.username.trim()) {
          throw new Error('Please fill in all fields.');
        }
      }

      if (isLogin) {
        let emailForAuth = form.email.trim();
        const isEmailFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());

        if (!isEmailFormat) {
          // Assume it's a username, get the email via RPC
          const { data, error: rpcError } = await supabase.rpc('get_email_by_username', {
            p_username: form.email.trim(),
          });

          if (rpcError || !data) {
            throw new Error('Invalid credentials');
          }
          emailForAuth = data;
        }

        const { error } = await supabase.auth.signInWithPassword({
          email: emailForAuth,
          password: form.password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: { data: { full_name: form.fullName, username: form.username } },
        });
        if (error) throw error;
      }
      onLogin();
    } catch (err: any) {
      const friendlyMessage = err.message.includes('Invalid login credentials') || err.message.includes('Invalid credentials')
        ? 'Invalid email/username or password.'
        : err.message;
      setError(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col p-8 justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-white tracking-tighter">
            {isLogin ? 'Welcome Back' : 'Join Fit Daily'}
          </h1>
          <p className="text-gray-500 font-medium">
            {isLogin ? 'Sign in to continue your journey' : 'Start your fitness journey today'}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3 text-red-500">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          {!isLogin && (
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                name="fullName"
                placeholder="Full Name"
                value={form.fullName}
                onChange={handleInputChange}
                className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-lime-400 focus:ring-0 transition-all outline-none"
              />
            </div>
          )}
          {!isLogin && (
            <div className="relative">
              <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={form.username}
                onChange={handleInputChange}
                className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-lime-400 focus:ring-0 transition-all outline-none"
              />
            </div>
          )}
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="email"
              name="email"
              placeholder={isLogin ? "Email or Username" : "Email Address"}
              value={form.email}
              onChange={handleInputChange}
              className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-lime-400 focus:ring-0 transition-all outline-none"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleInputChange}
              className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-lime-400 focus:ring-0 transition-all outline-none"
            />
          </div>
        </div>
        <button
          onClick={handleAuth}
          disabled={loading}
          className="w-full bg-lime-400 text-black py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-lime-500 transition-all active:scale-95 shadow-xl shadow-lime-400/10 disabled:opacity-50 disabled:pointer-events-none"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? 'Sign In' : 'Create Account')}
          {!loading && <ArrowRight className="w-5 h-5" />}
        </button>
        <div className="text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-gray-500 text-sm font-bold hover:text-white transition-colors"
          >
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
