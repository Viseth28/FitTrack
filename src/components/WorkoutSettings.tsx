import React from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Volume2, VolumeX, Info } from 'lucide-react';
import { cn } from '../lib/utils';

interface WorkoutSettingsProps {
  onBack: () => void;
  voiceEnabled: boolean;
  setVoiceEnabled: (enabled: boolean) => void;
  voiceGender: 'male' | 'female';
  setVoiceGender: (gender: 'male' | 'female') => void;
  announcementFrequency: number;
  setAnnouncementFrequency: (freq: number) => void;
}

export function WorkoutSettings({ 
  onBack, 
  voiceEnabled, 
  setVoiceEnabled,
  voiceGender,
  setVoiceGender,
  announcementFrequency,
  setAnnouncementFrequency
}: WorkoutSettingsProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="fixed inset-0 bg-[#0a0a0a] z-[100] flex flex-col"
    >
      <div className="p-6 flex items-center gap-4 border-b border-white/5">
        <button onClick={onBack} className="p-2 -ml-2 text-gray-400 hover:text-white transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-bold text-white">Exercise Settings</h2>
      </div>

      <div className="p-6 space-y-6">
        {/* Voice Toggle */}
        <div className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-3xl border border-white/5">
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
              voiceEnabled ? "bg-lime-400/10 text-lime-400" : "bg-zinc-800 text-gray-500"
            )}>
              {voiceEnabled ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
            </div>
            <div>
              <div className="text-white font-bold">Voice Broadcast</div>
              <div className="text-gray-500 text-xs">Distance and duration</div>
            </div>
          </div>
          <button 
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={cn(
              "w-14 h-8 rounded-full relative transition-colors duration-300",
              voiceEnabled ? "bg-lime-400" : "bg-zinc-800"
            )}
          >
            <motion.div 
              animate={{ x: voiceEnabled ? 24 : 4 }}
              className="absolute top-1 left-0 w-6 h-6 bg-white rounded-full shadow-lg"
            />
          </button>
        </div>

        {voiceEnabled && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-6"
          >
            {/* Voice Gender */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-400 uppercase tracking-wider ml-1">Voice Gender</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setVoiceGender('female')}
                  className={cn(
                    "p-4 rounded-2xl border transition-all font-bold text-sm",
                    voiceGender === 'female' 
                      ? "bg-lime-400 text-black border-lime-400" 
                      : "bg-zinc-900 text-gray-400 border-white/5 hover:bg-zinc-800"
                  )}
                >
                  Female
                </button>
                <button
                  onClick={() => setVoiceGender('male')}
                  className={cn(
                    "p-4 rounded-2xl border transition-all font-bold text-sm",
                    voiceGender === 'male' 
                      ? "bg-lime-400 text-black border-lime-400" 
                      : "bg-zinc-900 text-gray-400 border-white/5 hover:bg-zinc-800"
                  )}
                >
                  Male
                </button>
              </div>
            </div>

            {/* Frequency */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-400 uppercase tracking-wider ml-1">Announcement Frequency</label>
              <div className="grid grid-cols-3 gap-2">
                {[1, 5, 10].map((freq) => (
                  <button
                    key={freq}
                    onClick={() => setAnnouncementFrequency(freq)}
                    className={cn(
                      "p-3 rounded-2xl border transition-all font-bold text-sm",
                      announcementFrequency === freq
                        ? "bg-lime-400 text-black border-lime-400"
                        : "bg-zinc-900 text-gray-400 border-white/5 hover:bg-zinc-800"
                    )}
                  >
                    Every {freq} min
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
        
        <div className="p-4 bg-zinc-900/30 rounded-3xl border border-white/5 flex gap-3 items-start">
          <Info className="w-5 h-5 text-gray-500 mt-0.5" />
          <p className="text-xs text-gray-500 leading-relaxed">
            When enabled, the app will periodically broadcast your workout progress based on your selected frequency.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
