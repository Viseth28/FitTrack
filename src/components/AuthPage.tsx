import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, ArrowRight, User, Loader2, Calendar, Ruler, Weight, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AuthPageProps {
  onLogin: () => void;
}

export function LoginPage({ onLogin }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [signupStep, setSignupStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [dob, setDob] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      onLogin();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            username: username,
            weight: parseFloat(weight),
            height: parseFloat(height),
            birth_date: dob,
          },
        },
      });
      if (error) throw error;
      
      // If session exists, user is logged in automatically (email confirmation disabled)
      if (data.session) {
        onLogin();
      } else {
        // Otherwise, email confirmation is required
        alert('Check your email for the confirmation link!');
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !username || !email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setError(null);
    setSignupStep(2);
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
            {isLogin ? 'Welcome Back' : (signupStep === 1 ? 'Join Fit Daily' : 'Your Stats')}
          </h1>
          <p className="text-gray-500 font-medium">
            {isLogin ? 'Sign in to continue your journey' : (signupStep === 1 ? 'Start your fitness journey today' : 'Help us personalize your experience')}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {isLogin ? (
            <motion.form
              key="login"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleLogin}
              className="space-y-4"
            >
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-lime-400 focus:ring-0 transition-all outline-none"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-lime-400 focus:ring-0 transition-all outline-none"
                />
              </div>

              {error && (
                <div className="text-red-500 text-sm font-medium bg-red-500/10 p-3 rounded-xl border border-red-500/20">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-lime-400 text-black py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-lime-500 transition-all active:scale-95 shadow-xl shadow-lime-400/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
                {!loading && <ArrowRight className="w-5 h-5" />}
              </button>
            </motion.form>
          ) : (
            <>
              {signupStep === 1 ? (
                <motion.form
                  key="signup-step-1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleNextStep}
                  className="space-y-4"
                >
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-lime-400 focus:ring-0 transition-all outline-none"
                    />
                  </div>

                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="text"
                      placeholder="Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-lime-400 focus:ring-0 transition-all outline-none"
                    />
                  </div>

                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-lime-400 focus:ring-0 transition-all outline-none"
                    />
                  </div>

                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-lime-400 focus:ring-0 transition-all outline-none"
                    />
                  </div>

                  {error && (
                    <div className="text-red-500 text-sm font-medium bg-red-500/10 p-3 rounded-xl border border-red-500/20">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-lime-400 text-black py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-lime-500 transition-all active:scale-95 shadow-xl shadow-lime-400/10"
                  >
                    Next Step
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </motion.form>
              ) : (
                <motion.form
                  key="signup-step-2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleSignup}
                  className="space-y-4"
                >
                  <div className="relative">
                    <Weight className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="number"
                      placeholder="Weight (kg)"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      required
                      min="1"
                      step="0.1"
                      className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-lime-400 focus:ring-0 transition-all outline-none"
                    />
                  </div>

                  <div className="relative">
                    <Ruler className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="number"
                      placeholder="Height (cm)"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      required
                      min="1"
                      className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-lime-400 focus:ring-0 transition-all outline-none"
                    />
                  </div>

                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="date"
                      placeholder="Date of Birth"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      required
                      className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-lime-400 focus:ring-0 transition-all outline-none"
                      style={{ colorScheme: 'dark' }}
                    />
                  </div>

                  {error && (
                    <div className="text-red-500 text-sm font-medium bg-red-500/10 p-3 rounded-xl border border-red-500/20">
                      {error}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setSignupStep(1)}
                      className="w-1/3 bg-zinc-800 text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-zinc-700 transition-all active:scale-95 border border-white/5"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-2/3 bg-lime-400 text-black py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-lime-500 transition-all active:scale-95 shadow-xl shadow-lime-400/10 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
                      {!loading && <ArrowRight className="w-5 h-5" />}
                    </button>
                  </div>
                </motion.form>
              )}
            </>
          )}
        </AnimatePresence>

        <div className="text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setSignupStep(1);
              setError(null);
            }}
            className="text-gray-500 text-sm font-bold hover:text-white transition-colors"
          >
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
