import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, Square, MapPin, Navigation, Timer, Target } from 'lucide-react';
import { calculateDistance, formatDuration, calculatePace } from '../utils/geo';
import { ExerciseType, EXERCISE_TYPES } from '../types';

interface ActiveWorkoutProps {
  onClose: () => void;
  initialType?: ExerciseType;
  initialSubtype?: string;
  initialGoal?: number;
  initialName?: string;
  voiceSettings?: {
    enabled: boolean;
    gender: 'male' | 'female';
    frequency: number;
  };
  onSave: (data: {
    name: string;
    type: ExerciseType;
    subtype?: string;
    duration: number; // minutes
    distance: number; // meters
    calories: number;
    route: { lat: number; lng: number; timestamp: number }[];
  }) => void;
}

export default function ActiveWorkout({ 
  onClose, 
  onSave, 
  initialType = 'cardio', 
  initialSubtype,
  initialGoal = 0, 
  initialName = '',
  voiceSettings = { enabled: true, gender: 'female', frequency: 5 }
}: ActiveWorkoutProps) {
  const [status, setStatus] = useState<'countdown' | 'idle' | 'active' | 'paused' | 'finished'>('countdown');
  const [countdown, setCountdown] = useState(3);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [distance, setDistance] = useState(0);
  const [currentPace, setCurrentPace] = useState('0\'00"');
  const [route, setRoute] = useState<{ lat: number; lng: number; timestamp: number }[]>([]);
  const [type, setType] = useState<ExerciseType>(initialType);
  const [customName, setCustomName] = useState(initialName);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);

  const watchId = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const lastLocation = useRef<{ lat: number; lng: number } | null>(null);
  const lastBroadcastTime = useRef<number>(0);
  const lastBroadcastDistance = useRef<number>(0);

  // Helper to speak text
  const speak = (text: string, force: boolean = false) => {
    if (!voiceSettings.enabled && !force) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 1.1;
    
    // Select voice based on gender preference
    const voices = window.speechSynthesis.getVoices();
    let selectedVoice = null;
    
    if (voiceSettings.gender === 'female') {
      selectedVoice = voices.find(v => v.name.includes('Female') || v.name.includes('Samantha') || v.name.includes('Google US English'));
    } else {
      selectedVoice = voices.find(v => v.name.includes('Male') || v.name.includes('Daniel') || v.name.includes('Google UK English Male'));
    }
    
    if (selectedVoice) utterance.voice = selectedVoice;
    
    window.speechSynthesis.speak(utterance);
  };

  // Countdown logic
  useEffect(() => {
    if (status === 'countdown') {
      if (countdown > 0) {
        speak(countdown.toString(), true); // Always speak countdown
        const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        speak("Go!", true); // Always speak Go
        setStatus('active');
      }
    }
  }, [countdown, status]);

  // Periodic Voice Broadcast Logic
  useEffect(() => {
    if (status !== 'active' || !voiceSettings.enabled) return;

    // 1. Time-based broadcast (Frequency)
    // Check if we hit the frequency interval (in minutes)
    const currentMinutes = Math.floor(elapsedTime / 60);
    if (currentMinutes > 0 && currentMinutes % voiceSettings.frequency === 0 && currentMinutes !== lastBroadcastTime.current) {
      const distKm = (distance / 1000).toFixed(2);
      speak(`Time check. ${currentMinutes} minutes elapsed. Distance: ${distKm} kilometers.`);
      lastBroadcastTime.current = currentMinutes;
    }

    // 2. Distance-based broadcast (Every 1km)
    const currentKm = Math.floor(distance / 1000);
    if (currentKm > 0 && currentKm > lastBroadcastDistance.current) {
      const durationMins = Math.floor(elapsedTime / 60);
      speak(`You have exercised for ${currentKm} kilometer in ${durationMins} minutes.`);
      lastBroadcastDistance.current = currentKm;
    }

  }, [elapsedTime, distance, status, voiceSettings]);

  // Set default name when type changes
  useEffect(() => {
    if (!customName && (status === 'idle' || status === 'countdown')) {
      setCustomName(`${type.charAt(0).toUpperCase() + type.slice(1)} Session`);
    }
  }, [type, status]);

  // Timer logic
  useEffect(() => {
    if (status === 'active') {
      timerRef.current = window.setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status]);

  // Geolocation logic
  useEffect(() => {
    if (status === 'active') {
      if (!navigator.geolocation) {
        setGpsError('Geolocation is not supported by your browser');
        return;
      }

      watchId.current = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          setGpsAccuracy(accuracy);
          
          if (accuracy > 50) return;

          const newPoint = { lat: latitude, lng: longitude, timestamp: Date.now() };
          setRoute((prev) => [...prev, newPoint]);

          if (lastLocation.current) {
            const dist = calculateDistance(lastLocation.current, { lat: latitude, lng: longitude });
            if (dist > 2) {
              setDistance((prev) => prev + dist);
              lastLocation.current = { lat: latitude, lng: longitude };
            }
          } else {
            lastLocation.current = { lat: latitude, lng: longitude };
          }
          setGpsError(null);
        },
        (error) => {
          console.error('GPS Error:', error);
          setGpsError('GPS signal lost or permission denied');
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } else {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
        watchId.current = null;
      }
    }

    return () => {
      if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
    };
  }, [status]);

  // Update pace
  useEffect(() => {
    if (distance > 0 && elapsedTime > 0) {
      setCurrentPace(calculatePace(distance, elapsedTime));
    }
  }, [distance, elapsedTime]);

  const handleFinish = () => {
    setStatus('finished');
  };

  const handleSave = () => {
    const distKm = distance / 1000;
    const estimatedCalories = Math.round(distKm * 60);

    onSave({
      name: customName || `${type.charAt(0).toUpperCase() + type.slice(1)} Session`,
      type,
      subtype: initialSubtype,
      duration: Math.ceil(elapsedTime / 60),
      distance,
      calories: estimatedCalories > 0 ? estimatedCalories : Math.ceil(elapsedTime / 60 * 5),
      route,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      <AnimatePresence>
        {status === 'countdown' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-lime-400 flex items-center justify-center"
          >
            <motion.span
              key={countdown}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1.5, opacity: 1 }}
              exit={{ scale: 2, opacity: 0 }}
              className="text-black text-[12rem] font-black"
            >
              {countdown}
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Bar */}
      <div className="px-6 pt-12 pb-4 flex justify-center items-center">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-sm font-bold text-black uppercase tracking-wider">GPS Active</span>
        </div>
      </div>

      {/* Main Stats */}
      <div className="flex-1 flex flex-col items-center justify-start pt-16 p-6">
        {status === 'finished' ? (
          <div className="w-full max-w-xs space-y-6 mt-12">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Workout Complete!</h2>
              <p className="text-gray-500">Great job!</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Workout Name</label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-100 border-transparent focus:bg-white focus:border-lime-500 focus:ring-0 transition-all font-medium text-gray-900"
                placeholder="Name your workout"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-2xl">
              <div>
                <div className="text-xs text-gray-500 uppercase">Duration</div>
                <div className="font-bold text-gray-900">{formatDuration(elapsedTime)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase">Distance</div>
                <div className="font-bold text-gray-900">{(distance / 1000).toFixed(2)} km</div>
              </div>
            </div>

            <button
              onClick={handleSave}
              className="w-full bg-lime-400 text-black py-4 rounded-xl font-bold text-lg hover:bg-lime-500 transition-transform active:scale-95 shadow-lg shadow-lime-200"
            >
              Save Workout
            </button>
          </div>
        ) : (
          <>
            {/* Timer */}
            <div className="text-center mb-20">
              <div className="text-sm text-gray-400 uppercase tracking-[0.2em] mb-4 font-bold">Duration</div>
              <div className="text-[100px] leading-none font-medium text-zinc-900 tracking-tighter">
                {formatDuration(elapsedTime)}
              </div>
            </div>

            {/* Grid Stats */}
            <div className="grid grid-cols-2 gap-x-12 w-full max-w-sm mb-16">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-gray-400 mb-2">
                  <Navigation className="w-4 h-4 rotate-45" />
                  <span className="text-xs font-bold uppercase tracking-wider">Distance</span>
                </div>
                <div className="text-4xl font-bold text-zinc-900">
                  {(distance / 1000).toFixed(2)}
                  <span className="text-lg text-gray-400 font-bold ml-1">km</span>
                </div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-gray-400 mb-2">
                  <Timer className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Pace</span>
                </div>
                <div className="text-4xl font-bold text-zinc-900">
                  {currentPace}
                  <span className="text-lg text-gray-400 font-bold ml-1">/km</span>
                </div>
              </div>
            </div>

            {initialGoal > 0 && (
              <div className="w-full max-w-xs mb-12 bg-lime-400/10 border border-lime-400/20 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-lime-400 flex items-center justify-center text-black">
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Goal</div>
                    <div className="text-zinc-900 font-bold">{initialGoal.toFixed(2)} km</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Progress</div>
                  <div className="text-lime-600 font-bold">
                    {Math.min(100, Math.round((distance / 1000 / initialGoal) * 100))}%
                  </div>
                </div>
              </div>
            )}

            {gpsError && (
              <div className="mt-8 bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-medium">
                {gpsError}
              </div>
            )}
          </>
        )}
      </div>

      {/* Controls */}
      {status !== 'finished' && status !== 'countdown' && (
        <div className="px-12 pb-20 flex items-center justify-center bg-white">
          {status === 'active' ? (
            <div className="flex gap-12">
              <div className="flex flex-col items-center gap-3">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setStatus('paused')}
                  className="w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-900 shadow-lg hover:bg-zinc-200 transition-colors"
                >
                  <Pause className="w-8 h-8 fill-current" />
                </motion.button>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pause</span>
              </div>
              <div className="flex flex-col items-center gap-3">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handleFinish}
                  className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-red-200 hover:bg-red-600 transition-colors"
                >
                  <Square className="w-8 h-8 fill-current" />
                </motion.button>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Stop</span>
              </div>
            </div>
          ) : status === 'paused' ? (
            <div className="flex gap-12">
              <div className="flex flex-col items-center gap-3">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setStatus('active')}
                  className="w-20 h-20 bg-lime-400 rounded-full flex items-center justify-center text-black shadow-lg shadow-lime-200 hover:bg-lime-500 transition-colors"
                >
                  <Play className="w-8 h-8 fill-current ml-1" />
                </motion.button>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Resume</span>
              </div>
              <div className="flex flex-col items-center gap-3">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handleFinish}
                  className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-red-200 hover:bg-red-600 transition-colors"
                >
                  <Square className="w-8 h-8 fill-current" />
                </motion.button>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Stop</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setStatus('active')}
                className="w-20 h-20 bg-lime-500 rounded-full flex items-center justify-center text-white shadow-xl shadow-lime-200 hover:bg-lime-600 transition-colors"
              >
                <Play className="w-8 h-8 fill-current ml-1" />
              </motion.button>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Start</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
