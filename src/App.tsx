import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Home, Dumbbell, BarChart2, Utensils, User, PlayCircle, Plus, ChevronRight } from 'lucide-react';
import { useExercises } from './hooks/useExercises';
import { EXERCISE_TYPES, ExerciseType } from './types';
import ActiveWorkout from './components/ActiveWorkout';
import { Dashboard } from './components/Dashboard';
import { WorkoutSelector } from './components/WorkoutSelector';
import { LoginPage } from './components/AuthPage';
import { cn } from './lib/utils';

export default function App() {
  const { exercises, addExercise, deleteExercise } = useExercises();
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'home' | 'workout' | 'stats' | 'meals' | 'profile'>('home');
  
  // Workout Tab State
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [showTracking, setShowTracking] = React.useState(false);
  const [initialWorkoutType, setInitialWorkoutType] = React.useState<any>('cardio');
  const [initialGoal, setInitialGoal] = React.useState<number>(0);
  const [initialWorkoutName, setInitialWorkoutName] = React.useState<string>('');
  const [voiceSettings, setVoiceSettings] = React.useState({
    enabled: true,
    gender: 'female' as 'male' | 'female',
    frequency: 5
  });

  const [selectedDate, setSelectedDate] = React.useState(new Date().toLocaleDateString('en-CA'));

  // Stats Calculation
  const stats = React.useMemo(() => {
    const dayExercises = exercises.filter(e => e.date === selectedDate);
    
    return {
      calories: dayExercises.reduce((acc, curr) => acc + (curr.calories || 0), 0),
      duration: dayExercises.reduce((acc, curr) => acc + (curr.duration || 0), 0),
      count: dayExercises.length,
      distance: dayExercises.reduce((acc, curr) => acc + (curr.distance || 0), 0),
    };
  }, [exercises, selectedDate]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] font-sans text-gray-100 flex justify-center">
      <div className="w-full max-w-md bg-[#0a0a0a] h-[100dvh] shadow-2xl relative flex flex-col overflow-hidden">
        
        {!isLoggedIn ? (
          <LoginPage onLogin={() => setIsLoggedIn(true)} />
        ) : (
          <>
            {/* Scrollable Content Area */}
            <main className="flex-1 overflow-y-auto no-scrollbar relative">
          <AnimatePresence mode="wait">
            {activeTab === 'home' && (
              <motion.div
                key="home"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Dashboard 
                  stats={stats} 
                  recentExercises={exercises.filter(e => e.date === selectedDate)} 
                  selectedDate={selectedDate}
                  onDateSelect={setSelectedDate}
                />
              </motion.div>
            )}

            {activeTab === 'workout' && (
              <motion.div
                key="workout"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="pb-24"
              >
                <div className="pt-12 px-6 mb-2">
                  <h2 className="text-2xl font-bold text-white">Workouts</h2>
                </div>
                
                <WorkoutSelector onStart={(mode, goal, label, settings) => {
                  // Map mode string to ExerciseType
                  const typeMap: Record<string, ExerciseType> = {
                    running: 'cardio',
                    cycling: 'cardio',
                    walking: 'cardio',
                    hiking: 'cardio'
                  };
                  setInitialWorkoutType(typeMap[mode] || 'cardio');
                  setInitialGoal(goal);
                  setInitialWorkoutName(label);
                  if (settings) setVoiceSettings(settings);
                  setShowTracking(true);
                }} />

                <div className="px-6 mt-8 space-y-4">
                  <h3 className="text-white font-bold text-lg mb-4">Quick Actions</h3>
                  <button 
                    onClick={() => setShowAddModal(true)}
                    className="w-full bg-zinc-800/50 text-white p-5 rounded-[32px] font-bold flex items-center justify-between group hover:bg-zinc-800 transition-all border border-white/5"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-lime-400/10 flex items-center justify-center text-lime-400">
                        <Plus className="w-6 h-6" />
                      </div>
                      <div className="text-left">
                        <div className="text-white font-bold">Log Manually</div>
                        <div className="text-gray-500 text-xs font-medium">Add a past workout</div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === 'profile' && (
              <div className="flex flex-col items-center justify-center h-full space-y-6">
                <div className="w-24 h-24 rounded-full bg-zinc-800 flex items-center justify-center text-gray-500 border border-white/5">
                  <User size={48} />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-white">User Profile</h3>
                  <p className="text-gray-500 text-sm">visethkako@gmail.com</p>
                </div>
                <button
                  onClick={() => setIsLoggedIn(false)}
                  className="px-8 py-3 bg-red-500/10 text-red-500 rounded-2xl font-bold border border-red-500/20 hover:bg-red-500 hover:text-white transition-all"
                >
                  Log Out
                </button>
              </div>
            )}

            {['stats', 'meals'].includes(activeTab) && (
              <div className="flex items-center justify-center h-full text-gray-500">
                <p className="capitalize">{activeTab} Coming Soon</p>
              </div>
            )}
          </AnimatePresence>
        </main>

        {/* Bottom Navigation */}
        <nav className="bg-[#0a0a0a]/90 backdrop-blur-lg border-t border-white/5 px-6 py-4 pb-8 flex justify-between items-center relative z-20">
          <NavButton 
            active={activeTab === 'home'} 
            onClick={() => setActiveTab('home')} 
            icon={<Home />} 
            label="Home" 
          />
          <NavButton 
            active={activeTab === 'stats'} 
            onClick={() => setActiveTab('stats')} 
            icon={<BarChart2 />} 
            label="Stats" 
          />
          
          {/* Center Workout Button */}
          <button 
            onClick={() => setActiveTab('workout')}
            className={cn(
              "w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg -mt-8 border-4 border-[#0a0a0a]",
              activeTab === 'workout' ? "bg-lime-400 text-black" : "bg-lime-400 text-black hover:bg-lime-500"
            )}
          >
            <Dumbbell className="w-6 h-6" />
          </button>

          <NavButton 
            active={activeTab === 'meals'} 
            onClick={() => setActiveTab('meals')} 
            icon={<Utensils />} 
            label="Meals" 
          />
          <NavButton 
            active={activeTab === 'profile'} 
            onClick={() => setActiveTab('profile')} 
            icon={<User />} 
            label="Profile" 
          />
        </nav>

        {/* Modals */}
        {showAddModal && (
          <AddExerciseModal
            onClose={() => setShowAddModal(false)}
            onAdd={(ex) => {
              addExercise({ ...ex, date: new Date().toLocaleDateString('en-CA') });
              setShowAddModal(false);
            }}
          />
        )}

        {showTracking && (
          <ActiveWorkout
            initialType={initialWorkoutType}
            initialGoal={initialGoal}
            initialName={initialWorkoutName}
            voiceSettings={voiceSettings}
            onClose={() => setShowTracking(false)}
            onSave={(data) => {
              addExercise({
                name: data.name,
                type: data.type,
                duration: data.duration,
                calories: data.calories,
                distance: data.distance,
                route: data.route,
                date: new Date().toLocaleDateString('en-CA'),
              });
              setShowTracking(false);
            }}
          />
        )}
      </>
    )}
  </div>
</div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1 w-12">
      <div className={cn("transition-colors duration-300", active ? "text-lime-400" : "text-gray-500")}>
        {React.cloneElement(icon as React.ReactElement, { size: 24, strokeWidth: active ? 2.5 : 2 })}
      </div>
      <span className={cn("text-[10px] font-medium transition-colors duration-300", active ? "text-lime-400" : "text-gray-500")}>
        {label}
      </span>
    </button>
  );
}

// Re-using AddExerciseModal with updated styles
function AddExerciseModal({ onClose, onAdd }: { onClose: () => void; onAdd: (ex: any) => void }) {
  const [name, setName] = React.useState('');
  const [type, setType] = React.useState<any>('cardio');
  const [duration, setDuration] = React.useState('');
  const [calories, setCalories] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !duration) return;
    onAdd({
      name,
      type,
      duration: parseInt(duration),
      calories: parseInt(calories) || 0,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-0">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        className="bg-[#1E1E2E] w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 relative z-10 shadow-2xl border border-white/10"
      >
        <div className="w-12 h-1.5 bg-gray-600 rounded-full mx-auto mb-6" />
        <h2 className="text-xl font-bold text-white mb-6">Log Workout</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Exercise Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Morning Run"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 text-white focus:border-lime-400 focus:ring-0 transition-all font-medium"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Type</label>
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
              {EXERCISE_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setType(t.value)}
                  className={cn("px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                    type === t.value ? "bg-lime-400 text-black" : "bg-black/20 text-gray-400 border border-white/10"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Duration (min)</label>
              <input
                type="number"
                required
                min="1"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 text-white focus:border-lime-400 focus:ring-0 transition-all font-medium"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Calories (kcal)</label>
              <input
                type="number"
                min="0"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 text-white focus:border-lime-400 focus:ring-0 transition-all font-medium"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-lime-400 text-black py-4 rounded-xl font-bold text-lg hover:bg-lime-500 transition-transform active:scale-95"
          >
            Save Workout
          </button>
        </form>
      </motion.div>
    </div>
  );
}

