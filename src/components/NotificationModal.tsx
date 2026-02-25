import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Bell, Trophy, Dumbbell, CheckCircle2 } from 'lucide-react';
import { Notification } from '../types';
import { cn } from '../lib/utils';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
}

export function NotificationModal({ isOpen, onClose, notifications }: NotificationModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-zinc-900 w-full max-w-md rounded-[32px] overflow-hidden relative z-10 border border-white/10 shadow-2xl"
          >
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-lime-400/10 flex items-center justify-center text-lime-400">
                  <Bell className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-white">Notifications</h2>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto no-scrollbar p-4 space-y-3">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      "p-4 rounded-2xl border transition-all",
                      notification.read 
                        ? "bg-zinc-800/30 border-white/5" 
                        : "bg-zinc-800/80 border-lime-400/20 shadow-lg shadow-lime-400/5"
                    )}
                  >
                    <div className="flex gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center",
                        notification.type === 'workout' ? "bg-blue-400/10 text-blue-400" :
                        notification.type === 'goal' ? "bg-lime-400/10 text-lime-400" :
                        "bg-zinc-700 text-gray-400"
                      )}>
                        {notification.type === 'workout' && <Dumbbell className="w-5 h-5" />}
                        {notification.type === 'goal' && <Trophy className="w-5 h-5" />}
                        {notification.type === 'system' && <CheckCircle2 className="w-5 h-5" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="text-white font-semibold text-sm">{notification.title}</h3>
                          <span className="text-[10px] text-gray-500 font-medium">
                            {new Date(notification.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 leading-relaxed">
                          {notification.message}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center text-gray-600 mx-auto mb-4">
                    <Bell className="w-8 h-8" />
                  </div>
                  <p className="text-gray-500 text-sm">No new notifications</p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-white/5">
              <button
                onClick={onClose}
                className="w-full bg-lime-400 text-black py-4 rounded-2xl font-bold text-sm hover:bg-lime-500 transition-colors"
              >
                Dismiss All
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
