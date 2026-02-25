import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, ArrowRight, User } from 'lucide-react';

interface AuthPageProps {
  onLogin: () => void;
}

export function LoginPage({ onLogin }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);

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

        <div className="space-y-4">
          {!isLogin && (
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Full Name"
                className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-lime-400 focus:ring-0 transition-all outline-none"
              />
            </div>
          )}
          
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="email"
              placeholder="Email Address"
              className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-lime-400 focus:ring-0 transition-all outline-none"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="password"
              placeholder="Password"
              className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-lime-400 focus:ring-0 transition-all outline-none"
            />
          </div>
        </div>

        <button
          onClick={onLogin}
          className="w-full bg-lime-400 text-black py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-lime-500 transition-all active:scale-95 shadow-xl shadow-lime-400/10"
        >
          {isLogin ? 'Sign In' : 'Create Account'}
          <ArrowRight className="w-5 h-5" />
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
