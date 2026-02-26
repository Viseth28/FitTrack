import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Hexagon, Play, Music, ChevronRight, Activity, PersonStanding, Target } from 'lucide-react';
import { cn } from '../lib/utils';
import { WorkoutSettings } from './WorkoutSettings';
import { GoalSelector } from './GoalSelector';
import { Exercise } from '../types';

const WORKOUT_MODES = [
  { id: 'running', label: 'Outdoor Running', defaultGoal: 5.60 },
  { id: 'cycling', label: 'Outdoor Cycling', defaultGoal: 12.40 },
  { id: 'walking', label: 'Walking', defaultGoal: 3.20 },
  { id: 'hiking', label: 'Hiking', defaultGoal: 8.50 },
];

interface WorkoutSelectorProps {
  exercises: Exercise[];
  onStart: (mode: string, goal: number, label: string, settings?: { enabled: boolean, gender: 'male' | 'female', frequency: number }) => void;
}

export function WorkoutSelector({ exercises, onStart }: WorkoutSelectorProps) {
  const [selectedMode, setSelectedMode] = useState(WORKOUT_MODES[0]);
  const [showSettings, setShowSettings] = useState(false);
  const [showGoalSelector, setShowGoalSelector] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [voiceGender, setVoiceGender] = useState<'male' | 'female'>('female');
  const [announcementFrequency, setAnnouncementFrequency] = useState(5);
  const [goals, setGoals] = useState<Record<string, number>>({
    running: 5.00,
    cycling: 10.00,
    walking: 3.00,
    hiking: 8.00,
  });

  // Calculate total distance for each mode from real data
  const totalDistances = React.useMemo(() => {
    const totals: Record<string, number> = {
      running: 0,
      cycling: 0,
      walking: 0,
      hiking: 0
    };

    exercises.forEach(ex => {
      // Check subtype first, then fallback to name matching for backward compatibility
      if (ex.subtype && totals[ex.subtype] !== undefined) {
        totals[ex.subtype] += (ex.distance || 0) / 1000; // convert meters to km
      } else {
        // Fallback: check if name contains the mode
        const lowerName = ex.name.toLowerCase();
        if (lowerName.includes('run')) totals.running += (ex.distance || 0) / 1000;
        else if (lowerName.includes('cycl') || lowerName.includes('bike')) totals.cycling += (ex.distance || 0) / 1000;
        else if (lowerName.includes('walk')) totals.walking += (ex.distance || 0) / 1000;
        else if (lowerName.includes('hik')) totals.hiking += (ex.distance || 0) / 1000;
      }
    });

    return totals;
  }, [exercises]);

  const currentGoal = goals[selectedMode.id];
  const currentTotalDistance = totalDistances[selectedMode.id] || 0;

  const handleSetGoal = (newGoal: number) => {
    setGoals(prev => ({ ...prev, [selectedMode.id]: newGoal }));
  };

  const handleStart = () => {
    setShowGoalSelector(false);
    setShowSettings(false);
    onStart(selectedMode.id, currentGoal, selectedMode.label, {
      enabled: voiceEnabled,
      gender: voiceGender,
      frequency: announcementFrequency
    });
  };

  const handleQuickStart = () => {
    setShowGoalSelector(false);
    setShowSettings(false);
    onStart(selectedMode.id, 0, selectedMode.label, {
      enabled: voiceEnabled,
      gender: voiceGender,
      frequency: announcementFrequency
    });
  };

  return (
    <div className="w-full px-6 pt-4 relative">
      <AnimatePresence>
        {showSettings && (
          <WorkoutSettings 
            onBack={() => setShowSettings(false)} 
            voiceEnabled={voiceEnabled}
            setVoiceEnabled={setVoiceEnabled}
            voiceGender={voiceGender}
            setVoiceGender={setVoiceGender}
            announcementFrequency={announcementFrequency}
            setAnnouncementFrequency={setAnnouncementFrequency}
          />
        )}
        {showGoalSelector && (
          <GoalSelector 
            onBack={() => setShowGoalSelector(false)}
            currentGoal={currentGoal}
            setGoal={handleSetGoal}
            onStart={handleStart}
          />
        )}
      </AnimatePresence>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-zinc-900/40 rounded-[40px] overflow-hidden shadow-2xl relative aspect-[4/4.2] flex flex-col border border-white/5 backdrop-blur-sm"
      >
        {/* Subtle Map Background Pattern - Darker for dark theme */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <svg width="100%" height="100%" viewBox="0 0 400 400">
            <path d="M0 100 Q 100 80 200 120 T 400 100" fill="none" stroke="white" strokeWidth="2" />
            <path d="M50 0 L 50 400" fill="none" stroke="white" strokeWidth="1" />
            <path d="M150 0 L 150 400" fill="none" stroke="white" strokeWidth="1" />
            <path d="M250 0 L 250 400" fill="none" stroke="white" strokeWidth="1" />
            <path d="M350 0 L 350 400" fill="none" stroke="white" strokeWidth="1" />
            <circle cx="180" cy="220" r="60" fill="white" opacity="0.5" />
            <rect x="280" y="150" width="80" height="40" rx="10" fill="white" opacity="0.5" />
          </svg>
        </div>

        {/* Top Navigation */}
        <div className="relative z-10 pt-8">
          <div className="flex overflow-x-auto no-scrollbar px-8 gap-6 items-center">
            {WORKOUT_MODES.map((mode) => (
              <button
                key={mode.id}
                onClick={() => setSelectedMode(mode)}
                className="flex-shrink-0 relative py-2"
              >
                <span className={cn(
                  "text-base font-bold transition-colors whitespace-nowrap",
                  selectedMode.id === mode.id ? "text-white" : "text-gray-500"
                )}>
                  {mode.label}
                </span>
                {selectedMode.id === mode.id && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-1 bg-lime-400 rounded-full"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Main Display */}
        <div className="flex-1 flex flex-col items-center justify-center relative z-10 px-8">
          <div className="flex items-baseline gap-2">
            <span className="text-6xl font-black text-white tracking-tighter">
              {currentTotalDistance.toFixed(2)}
            </span>
            <span className="text-xl font-bold text-gray-500">km</span>
          </div>
          <button className="flex items-center gap-1 mt-4 text-gray-500 hover:text-white transition-colors group">
            <span className="text-sm font-medium">Total {selectedMode.label} Distance</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Bottom Controls */}
        <div className="relative z-10 px-8 pb-10 flex items-center justify-between">
          <div className="flex flex-col items-center gap-2">
            <button 
              onClick={() => setShowSettings(true)}
              className="w-14 h-14 rounded-full bg-zinc-800 flex items-center justify-center text-gray-400 hover:text-white transition-all hover:scale-110 active:scale-95 shadow-lg border border-white/5"
            >
              <Hexagon className="w-6 h-6" />
            </button>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Setting</span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <button 
              onClick={handleQuickStart}
              className="w-20 h-20 rounded-full bg-lime-400 flex items-center justify-center text-black shadow-2xl shadow-lime-400/20 hover:scale-105 active:scale-95 transition-all"
            >
              <Play className="w-10 h-10 fill-current" />
            </button>
            <span className="text-[10px] font-bold text-lime-400 uppercase tracking-wider">Start</span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <button 
              onClick={() => setShowGoalSelector(true)}
              className="w-14 h-14 rounded-full bg-zinc-800 flex items-center justify-center text-gray-400 hover:text-white transition-all hover:scale-110 active:scale-95 shadow-lg border border-white/5"
            >
              <Target className="w-6 h-6" />
            </button>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Goal</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
