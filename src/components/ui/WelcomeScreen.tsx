import React, { useState } from 'react';
import { Sparkles, Compass, Heart, Stars } from 'lucide-react';
import { sounds } from '../../services/soundEffects';

interface WelcomeScreenProps {
  onOpenPortal: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onOpenPortal }) => {
  const [isOpening, setIsOpening] = useState<boolean>(false);

  const handleOpen = () => {
    if (isOpening) return;
    setIsOpening(true);
    sounds.playPortalTeleport();
    sounds.startBackgroundMusic();

    setTimeout(() => {
      onOpenPortal();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-40 flex flex-col items-center justify-between p-6 sm:p-10 select-none pointer-events-auto overflow-hidden bg-gradient-to-b from-slate-950/80 via-slate-900/60 to-purple-950/80 backdrop-blur-xs">
      {/* Dynamic Portal Vortex Light Burst on Activation */}
      {isOpening && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white animate-portal-flash pointer-events-none">
          <div className="w-96 h-96 rounded-full bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 blur-3xl animate-ping opacity-90" />
        </div>
      )}

      {/* Background Floating Stars & Glowing Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/6 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/6 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-700" />
        <div className="absolute top-2/3 left-1/3 w-72 h-72 bg-pink-500/15 rounded-full blur-3xl animate-pulse delay-1000" />

        {/* Floating Sparkle Particles */}
        <div className="absolute top-12 left-12 text-amber-300/40 animate-bounce">
          <Stars className="w-6 h-6" />
        </div>
        <div className="absolute top-1/3 right-16 text-cyan-300/40 animate-pulse">
          <Sparkles className="w-8 h-8" />
        </div>
        <div className="absolute bottom-20 left-20 text-pink-300/40 animate-bounce delay-500">
          <Sparkles className="w-7 h-7" />
        </div>
      </div>

      {/* Top Header Badge */}
      <div className="relative z-10 flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-950/70 border border-purple-500/30 text-xs sm:text-sm font-fun text-purple-200 shadow-lg backdrop-blur-md animate-fade-in">
        <Compass className="w-4 h-4 text-cyan-400 animate-spin-slow" />
        <span className="font-medium tracking-wide">Портал в их мир</span>
        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 my-auto flex flex-col items-center text-center max-w-2xl px-4">
        {/* Decorative Glowing Emblem */}
        <div className="relative mb-6 group">
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 blur-lg opacity-70 group-hover:opacity-100 transition duration-1000 animate-tilt" />
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-slate-950/90 border border-white/20 flex items-center justify-center shadow-2xl backdrop-blur-md">
            <span className="text-4xl sm:text-5xl animate-pulse">✨</span>
          </div>
        </div>

        {/* Poetic Opening Story Line */}
        <p className="text-sm sm:text-lg font-medium font-fun text-cyan-200/90 mb-3 tracking-wide leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] animate-fade-in">
          Однажды в одном волшебном мире появились два особенных человека...
        </p>

        {/* Main Names Title */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black font-game tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-pink-300 to-cyan-200 drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)] mb-4">
          Для Алижан и Дильназ
        </h1>

        {/* Subtitle Message */}
        <p className="text-xs sm:text-sm font-fun text-slate-300/90 max-w-md mx-auto leading-relaxed mb-8">
          Волшебное приключение и личный подарок от старшего брата
        </p>

        {/* Action Button: Открыть портал */}
        <button
          onClick={handleOpen}
          disabled={isOpening}
          className={`group relative inline-flex items-center justify-center gap-3 px-8 sm:px-10 py-4 sm:py-4.5 rounded-2xl text-base sm:text-lg font-extrabold font-fun text-white shadow-2xl transition-all duration-300 transform active:scale-95 touch-btn ${
            isOpening
              ? 'scale-105 opacity-90 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500'
              : 'bg-gradient-to-r from-amber-500 via-pink-500 to-purple-600 hover:from-amber-400 hover:via-pink-400 hover:to-purple-500 hover:scale-105 hover:shadow-pink-500/25 border border-amber-300/40'
          }`}
        >
          {/* Button Outer Glow */}
          <span className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-amber-400 via-pink-500 to-purple-600 opacity-60 blur-md group-hover:opacity-100 transition duration-300" />

          <span className="relative flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-amber-200 animate-spin-slow" />
            <span>{isOpening ? 'Открываем портал...' : 'Открыть портал'}</span>
            <Heart className="w-5 h-5 text-pink-200 fill-pink-200/40 group-hover:scale-110 transition-transform" />
          </span>
        </button>
      </div>

      {/* Footer Hint */}
      <div className="relative z-10 flex items-center gap-2 text-xs font-fun text-slate-400 bg-slate-950/60 px-4 py-1.5 rounded-full border border-white/10 backdrop-blur-sm shadow-md">
        <span>Нажмите на кнопку, чтобы начать приключение</span>
      </div>
    </div>
  );
};
