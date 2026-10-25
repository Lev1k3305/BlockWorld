import React, { useEffect } from 'react';
import { RotateCcw, Sparkles, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';

interface FinaleSceneProps {
  onRestart: () => void;
}

export const FinaleScene: React.FC<FinaleSceneProps> = ({ onRestart }) => {
  useEffect(() => {
    // Burst initial celebratory confetti
    confetti({
      particleCount: 100,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#f472b6', '#fbbf24', '#c084fc', '#60a5fa', '#f43f5e'],
    });

    // Repeating gentle side bursts
    const interval = setInterval(() => {
      confetti({
        particleCount: 40,
        angle: 60,
        spread: 60,
        origin: { x: 0 },
        colors: ['#f472b6', '#fbbf24', '#c084fc'],
      });
      confetti({
        particleCount: 40,
        angle: 120,
        spread: 60,
        origin: { x: 1 },
        colors: ['#f472b6', '#fbbf24', '#60a5fa'],
      });
    }, 2800);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12 text-center select-none animate-fade-in">
      {/* Decorative ambient background glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-tr from-pink-500/25 via-amber-400/25 to-purple-600/25 rounded-full blur-3xl pointer-events-none animate-pulse" />

      {/* Main Finale Card */}
      <div className="relative w-full max-w-2xl bg-slate-900/90 border-2 border-amber-400/70 rounded-3xl p-6 sm:p-10 shadow-[0_0_80px_rgba(251,191,36,0.3)] text-slate-100 flex flex-col items-center my-auto">
        {/* Floating Golden Stars Accents */}
        <div className="absolute top-6 left-8 text-amber-300 text-2xl animate-bounce">⭐</div>
        <div className="absolute top-10 right-8 text-pink-300 text-xl animate-pulse">✨</div>
        <div className="absolute bottom-8 left-10 text-purple-300 text-2xl animate-pulse">🌟</div>
        <div className="absolute bottom-10 right-10 text-amber-400 text-xl animate-bounce">✨</div>

        {/* Glowing Birthday Cake Illustration */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-amber-400/30 rounded-full blur-xl animate-pulse" />
          <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-gradient-to-br from-pink-500/30 via-purple-600/30 to-amber-500/30 border-2 border-amber-300/60 flex items-center justify-center shadow-inner">
            <span className="text-6xl sm:text-7xl drop-shadow-[0_0_15px_rgba(251,191,36,0.8)]">
              🎂
            </span>
          </div>
        </div>

        {/* Main Text */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold font-serif tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-pink-300 to-purple-200 mb-4 drop-shadow-[0_4px_20px_rgba(244,114,182,0.4)]">
          С днём рождения, Алижан и Дильназ!
        </h1>

        {/* Supporting Text */}
        <p className="text-lg sm:text-2xl text-amber-100 font-serif italic max-w-lg mb-8 leading-relaxed">
          «Вы — два самых прекрасных чуда в моей жизни.»
        </p>

        {/* Dedicated Message Ribbon */}
        <div className="w-full p-4 rounded-2xl bg-gradient-to-r from-pink-500/15 via-purple-500/15 to-amber-500/15 border border-pink-400/30 mb-8 flex items-center justify-center gap-2 text-pink-200 text-sm sm:text-base font-medium">
          <Heart className="w-5 h-5 text-pink-400 fill-pink-400" />
          <span>С глубокой любовью и заботой от старшего брата</span>
        </div>

        {/* Restart Button */}
        <button
          onClick={onRestart}
          className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-amber-400 via-pink-500 to-purple-600 hover:from-amber-300 hover:via-pink-400 hover:to-purple-500 text-slate-950 font-bold text-base sm:text-lg rounded-full shadow-[0_0_30px_rgba(251,191,36,0.4)] transition-all transform hover:-translate-y-1 active:translate-y-0 cursor-pointer"
        >
          <RotateCcw className="w-5 h-5 text-slate-950 group-hover:-rotate-180 transition-transform duration-700" />
          <span>Ещё раз открыть нашу историю</span>
        </button>
      </div>
    </div>
  );
};
