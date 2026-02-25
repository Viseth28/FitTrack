import React, { useState, useMemo, useEffect } from 'react';
import { Bell, Flame, Trophy, Play, Footprints, Timer, Dumbbell, Heart, BarChart2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { Exercise, Notification } from '../types';
import { NotificationModal } from './NotificationModal';
import { supabase } from './supabase';

function CalendarStrip({ selectedDate, onSelect }: { selectedDate: string; onSelect: (date: string) => void }) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  const currentWeekDay = today.getDay();
  
  // Generate a week of dates centered around today or just the current week
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (currentWeekDay - i));
    const dateStr = d.toLocaleDateString('en-CA');
    return {
      day: days[i],
      date: d.getDate(),
      fullDate: dateStr,
      isToday: dateStr === new Date().toLocaleDateString('en-CA'),
      isSelected: dateStr === selectedDate
    };
  });

  return (
    <div className="flex justify-between items-center py-4 px-2">
      {weekDates.map((item, index) => (
        <button 
          key={index} 
          onClick={() => onSelect(item.fullDate)}
          className="flex flex-col items-center gap-2"
        >
          <span className={cn("text-xs font-medium transition-colors", item.isSelected ? "text-white" : "text-gray-400")}>{item.day}</span>
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all",
            item.isSelected 
              ? "bg-lime-400 text-black shadow-[0_0_15px_rgba(163,230,53,0.4)] scale-110" 
              : "text-white bg-zinc-800/50 border border-white/5 hover:bg-zinc-800"
          )}>
            {item.date}
          </div>
        </button>
      ))}
    </div>
  );
}

function WorkoutCard({ title, time, image, delay }: { title: string; time: string; image: string; delay: number }) {
  return (
    <div 
      className="relative flex-shrink-0 w-40 h-48 rounded-[32px] overflow-hidden group"
      style={{ animationDelay: `${delay}ms` }}
    >
      <img src={image} alt={title} className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
      
      <div className="absolute bottom-4 left-4 right-4">
        <h3 className="text-white font-bold text-sm leading-tight mb-1">{title}</h3>
        <div className="flex items-center gap-1 text-gray-300 text-xs">
          <Timer className="w-3 h-3" />
          <span>{time}</span>
        </div>
      </div>
    </div>
  );
}

function SingleRing({ progress, color, icon }: { progress: number; color: string; icon: React.ReactNode }) {
  const radius = 18;
  const stroke = 3;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative w-12 h-12 flex items-center justify-center">
      <svg height={radius * 2} width={radius * 2} className="rotate-[-90deg]">
        <circle
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={stroke}
          fill="transparent"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset }}
          strokeLinecap="round"
          fill="transparent"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-black" style={{ color }}>
        {icon}
      </div>
    </div>
  );
}

interface ActivityRowProps {
  exercise: Exercise;
  key?: string;
}

function ActivityRow({ exercise }: ActivityRowProps) {
  const isRun = exercise.type === 'cardio' || exercise.type === 'sport';
  const hasDistance = exercise.distance !== undefined && exercise.distance > 0;
  
  return (
    <div className="flex items-center justify-between bg-zinc-900/50 p-4 rounded-3xl border border-white/5 mb-3">
      <div className="flex items-center gap-4">
        <div className={cn(
          "w-12 h-12 rounded-full flex items-center justify-center relative overflow-hidden",
          isRun ? "bg-lime-400/10" : "bg-orange-400/10"
        )}>
          {isRun ? (
            <SingleRing progress={75} color="#a3e635" icon={<Footprints className="w-5 h-5 text-lime-400" />} />
          ) : (
            <div className="p-3 bg-orange-400/20 rounded-full text-orange-400">
              <Dumbbell className="w-5 h-5" />
            </div>
          )}
        </div>
        <div>
          <h4 className="text-white font-semibold">{exercise.name}</h4>
          <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
            {hasDistance && <span>{exercise.duration} min</span>}
            {hasDistance && <span className="w-1 h-1 rounded-full bg-gray-600" />}
            <span>{exercise.calories} kcal</span>
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className="text-xl font-bold text-white">
          {hasDistance ? (exercise.distance! / 1000).toFixed(2) : exercise.duration}
        </div>
        <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">
          {hasDistance ? 'km' : 'min'}
        </div>
      </div>
    </div>
  );
}

function isToday(date: Date) {
  const today = new Date();
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
}

export function Dashboard({ stats, recentExercises, selectedDate, onDateSelect, username }: { 
  stats: any; 
  recentExercises: Exercise[];
  selectedDate: string;
  onDateSelect: (date: string) => void;
  username?: string;
}) {
  const [activeCategory, setActiveCategory] = React.useState('Warm Up');
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [displayName, setDisplayName] = useState('');

  useEffect(() => {
    if (username) return;

    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('full_name, username')
          .eq('id', user.id)
          .single();
        
        if (data) setDisplayName(data.full_name || data.username || '');
      }
    };
    fetchProfile();
  }, [username]);

  const notifications = useMemo(() => {
    const list: Notification[] = [];
    
    // Goal notifications
    if (stats.calories >= 500) {
      list.push({
        id: 'goal-cal',
        title: 'Goal Reached!',
        message: `You've burned ${stats.calories} kcal today! Target was 500.`,
        type: 'goal',
        timestamp: Date.now() - 1000 * 60 * 30,
        read: false
      });
    }
    
    if (stats.duration >= 60) {
      list.push({
        id: 'goal-dur',
        title: 'Daily Goal Met',
        message: `You've completed ${stats.duration} minutes of activity today. Keep it up!`,
        type: 'goal',
        timestamp: Date.now() - 1000 * 60 * 60,
        read: false
      });
    }

    // Workout broadcast notifications
    recentExercises.forEach((ex, i) => {
      const distStr = ex.distance ? `${(ex.distance / 1000).toFixed(2)}km` : '';
      const durStr = `${ex.duration}min`;
      list.push({
        id: `workout-${ex.id}`,
        title: `Workout Broadcast: ${ex.name}`,
        message: `Total distance: ${distStr || 'N/A'}. Duration: ${durStr}. Calories: ${ex.calories}kcal.`,
        type: 'workout',
        timestamp: ex.timestamp,
        read: i > 0
      });
    });

    return list.sort((a, b) => b.timestamp - a.timestamp);
  }, [stats, recentExercises]);

  const hasUnread = notifications.some(n => !n.read);

  return (
    <div className="pb-32">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-md px-6 py-6 mb-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gray-700 overflow-hidden border-2 border-lime-400">
              <img src="https://picsum.photos/seed/user/200/200" alt="User" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-white text-lg font-bold">Hello {username || displayName || 'User'} 👋</h1>
              <p className="text-gray-400 text-xs">Get ready</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button 
              className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-white border border-white/10 relative hover:bg-zinc-700 transition-colors" 
              onClick={() => setIsNotificationOpen(true)}
            >
              <Bell className="w-5 h-5" />
              {hasUnread && (
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-zinc-800" />
              )}
            </button>
            <button className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-white border border-white/10 hover:bg-zinc-700 transition-colors" onClick={() => alert("Streak: 5 days!")}>
              <Flame className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 space-y-8">
        <NotificationModal 
          isOpen={isNotificationOpen} 
          onClose={() => setIsNotificationOpen(false)} 
          notifications={notifications}
        />

        {/* Calendar Strip */}
      <CalendarStrip selectedDate={selectedDate} onSelect={onDateSelect} />

      {/* Daily Activity Data */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-zinc-900/50 rounded-3xl p-4 border border-white/5 flex flex-col items-center justify-center gap-1">
          <div className="text-lime-400 font-bold text-xl">{Math.round((stats.distance / 1000) * 1250)}</div>
          <div className="text-gray-500 text-xs font-medium uppercase tracking-wider">Steps</div>
        </div>
        <div className="bg-zinc-900/50 rounded-3xl p-4 border border-white/5 flex flex-col items-center justify-center gap-1">
          <div className="text-white font-bold text-xl">{stats.calories}</div>
          <div className="text-gray-500 text-xs font-medium uppercase tracking-wider">Kcal</div>
        </div>
        <div className="bg-zinc-900/50 rounded-3xl p-4 border border-white/5 flex flex-col items-center justify-center gap-1">
          <div className="text-white font-bold text-xl">{stats.duration}</div>
          <div className="text-gray-500 text-xs font-medium uppercase tracking-wider">Min</div>
        </div>
      </div>

      {/* Daily Summary Section */}
      <div className="bg-zinc-900/30 rounded-[32px] p-6 border border-white/5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-lime-400/10 flex items-center justify-center text-lime-400">
            <BarChart2 className="w-4 h-4" />
          </div>
          <h3 className="text-white font-bold">Daily Summary</h3>
        </div>
        <div className="grid grid-cols-3 gap-6">
          <div className="space-y-1">
            <div className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">Distance</div>
            <div className="text-white font-bold text-lg">
              {(stats.distance / 1000).toFixed(2)} 
              <span className="text-[10px] font-normal text-gray-500 ml-1">km</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">Duration</div>
            <div className="text-white font-bold text-lg">
              {stats.duration} 
              <span className="text-[10px] font-normal text-gray-500 ml-1">min</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">Workouts</div>
            <div className="text-white font-bold text-lg">
              {stats.count}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <div className="flex justify-between items-end mb-4">
          <h3 className="text-white font-bold text-lg">
            {selectedDate === new Date().toLocaleDateString('en-CA') ? 'Recent Activity' : `Activity on ${new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
          </h3>
          <button className="text-gray-400 hover:text-white" onClick={() => alert("Showing all history")}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line><line x1="1" y1="14" x2="7" y2="14"></line><line x1="9" y1="8" x2="15" y2="8"></line><line x1="17" y1="16" x2="23" y2="16"></line></svg>
          </button>
        </div>
        <div className="space-y-1">
          {recentExercises.length > 0 ? (
            recentExercises.slice(0, 3).map(ex => (
              <ActivityRow key={ex.id} exercise={ex} />
            ))
          ) : (
            <p className="text-gray-500 text-sm text-center py-4">No recent activity</p>
          )}
        </div>
      </div>
    </div>
  </div>
  );
}
