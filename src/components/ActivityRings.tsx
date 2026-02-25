import React from 'react';
import { Footprints, Flame, Clock } from 'lucide-react';

interface ActivityRingsProps {
  steps: number;
  calories: number;
  duration: number;
  stepsGoal?: number;
  caloriesGoal?: number;
  durationGoal?: number;
}

export function ActivityRings({
  steps,
  calories,
  duration,
  stepsGoal = 4000,
  caloriesGoal = 300,
  durationGoal = 30,
}: ActivityRingsProps) {
  const size = 280;
  const strokeWidth = 24;
  const center = size / 2;
  
  // Calculate radii for concentric rings
  const radius1 = 100; // Outer (Steps)
  const radius2 = 72;  // Middle (Calories)
  const radius3 = 44;  // Inner (Duration)

  const circumference1 = 2 * Math.PI * radius1;
  const circumference2 = 2 * Math.PI * radius2;
  const circumference3 = 2 * Math.PI * radius3;

  const progress1 = Math.min(steps / stepsGoal, 1);
  const progress2 = Math.min(calories / caloriesGoal, 1);
  const progress3 = Math.min(duration / durationGoal, 1);

  const offset1 = circumference1 - progress1 * circumference1;
  const offset2 = circumference2 - progress2 * circumference2;
  const offset3 = circumference3 - progress3 * circumference3;

  return (
    <div className="flex items-center justify-between w-full max-w-sm mx-auto p-4">
      {/* Rings */}
      <div className="relative flex-shrink-0">
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background Rings */}
          <circle cx={center} cy={center} r={radius1} fill="none" stroke="#332940" strokeWidth={strokeWidth} strokeLinecap="round" opacity={1} />
          <circle cx={center} cy={center} r={radius2} fill="none" stroke="#2A2F45" strokeWidth={strokeWidth} strokeLinecap="round" opacity={1} />
          <circle cx={center} cy={center} r={radius3} fill="none" stroke="#1F3A3D" strokeWidth={strokeWidth} strokeLinecap="round" opacity={1} />

          {/* Progress Rings */}
          <circle
            cx={center}
            cy={center}
            r={radius1}
            fill="none"
            stroke="#D946EF" // Fuchsia-500
            strokeWidth={strokeWidth}
            strokeDasharray={circumference1}
            strokeDashoffset={offset1}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out drop-shadow-[0_0_10px_rgba(217,70,239,0.5)]"
          />
          <circle
            cx={center}
            cy={center}
            r={radius2}
            fill="none"
            stroke="#8B5CF6" // Violet-500
            strokeWidth={strokeWidth}
            strokeDasharray={circumference2}
            strokeDashoffset={offset2}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out drop-shadow-[0_0_10px_rgba(139,92,246,0.5)]"
          />
          <circle
            cx={center}
            cy={center}
            r={radius3}
            fill="none"
            stroke="#06B6D4" // Cyan-500
            strokeWidth={strokeWidth}
            strokeDasharray={circumference3}
            strokeDashoffset={offset3}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]"
          />
        </svg>
        
        {/* Icons inside rings - positioned absolutely */}
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center pointer-events-none">
            {/* We could put icons here but the design has them separate or integrated. 
                The image shows icons ON the rings start/end points or just abstractly. 
                Let's stick to the legend on the right for clarity as per the image. 
            */}
        </div>
      </div>

      {/* Legend / Stats */}
      <div className="flex flex-col gap-6 ml-4">
        {/* Steps */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Footprints className="w-4 h-4 text-fuchsia-500" fill="currentColor" />
            <span className="text-sm text-gray-400 font-medium">Steps</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-white">{steps}</span>
            <span className="text-xs text-gray-500">/{stepsGoal} steps</span>
          </div>
        </div>

        {/* Calories */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Flame className="w-4 h-4 text-violet-500" fill="currentColor" />
            <span className="text-sm text-gray-400 font-medium">Calories</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-white">{calories}</span>
            <span className="text-xs text-gray-500">/{caloriesGoal} kcal</span>
          </div>
        </div>

        {/* Duration */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-cyan-500" />
            <span className="text-sm text-gray-400 font-medium">Duration</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-white">{duration}</span>
            <span className="text-xs text-gray-500">/{durationGoal} min</span>
          </div>
        </div>
      </div>
    </div>
  );
}
