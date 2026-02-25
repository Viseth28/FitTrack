import React from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronDown, Minus, Plus } from 'lucide-react';
import { cn } from '../lib/utils';

interface GoalSelectorProps {
  onBack: () => void;
  currentGoal: number;
  setGoal: (goal: number) => void;
  onStart: () => void;
}

export function GoalSelector({ onBack, currentGoal, setGoal, onStart }: GoalSelectorProps) {
  const presets = [
    { value: 3.00, label: '3 km' },
    { value: 5.00, label: '5 km' },
    { value: 10.00, label: '10 km' },
    { value: 15.00, label: '15 km' },
    { value: 21.10, label: 'Half Marathon' },
    { value: 42.20, label: 'Full Marathon' },
  ];

  const adjustGoal = (amount: number) => {
    const newGoal = Math.max(0.1, currentGoal + amount);
    setGoal(parseFloat(newGoal.toFixed(2)));
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="fixed inset-0 bg-[#0a0a0a] z-[100] flex flex-col"
    >
      {/* Header */}
      <div className="p-6 flex items-center gap-4">
        <button onClick={onBack} className="p-2 -ml-2 text-white hover:bg-white/10 rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-bold text-white">Set Goals</h2>
      </div>

      <div className="flex-1 flex flex-col px-6 pt-4 pb-8">
        {/* Goal Type Selector */}
        <div className="flex justify-center mb-12">
          <button className="flex items-center gap-2 text-white font-bold text-lg bg-zinc-900 px-4 py-2 rounded-full border border-white/10">
            <span>Distance Goal</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        {/* Counter Control */}
        <div className="flex items-center justify-between mb-2">
          <button 
            onClick={() => adjustGoal(-0.5)}
            className="w-14 h-14 rounded-full bg-zinc-800 flex items-center justify-center text-white hover:bg-zinc-700 transition-colors"
          >
            <Minus className="w-6 h-6" />
          </button>

          <div className="flex flex-col items-center">
            <span className="text-7xl font-medium text-white tracking-tight">
              {currentGoal % 1 === 0 ? currentGoal : currentGoal.toFixed(2)}
            </span>
          </div>

          <button 
            onClick={() => adjustGoal(0.5)}
            className="w-14 h-14 rounded-full bg-zinc-800 flex items-center justify-center text-white hover:bg-zinc-700 transition-colors"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
        
        <div className="text-center text-gray-500 font-medium mb-12">km</div>

        {/* Presets Grid */}
        <div className="grid grid-cols-3 gap-3 mb-auto">
          {presets.map((preset) => (
            <button
              key={preset.label}
              onClick={() => setGoal(preset.value)}
              className={cn(
                "py-4 px-2 rounded-2xl font-bold text-sm transition-all",
                currentGoal === preset.value
                  ? "bg-lime-400 text-black shadow-lg shadow-lime-400/20"
                  : "bg-zinc-900 text-gray-300 border border-white/5 hover:bg-zinc-800"
              )}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Start Button */}
        <button 
          onClick={onStart}
          className="w-full bg-lime-400 text-black py-4 rounded-full font-bold text-lg hover:bg-lime-500 transition-transform active:scale-95 shadow-lg shadow-lime-400/20"
        >
          Start
        </button>
      </div>
    </motion.div>
  );
}
