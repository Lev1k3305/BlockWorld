import React from 'react';
import { Heart, Sparkles, ArrowRight } from 'lucide-react';

interface BrotherLetterSceneProps {
  onNext: () => void;
}

export const BrotherLetterScene: React.FC<BrotherLetterSceneProps> = ({ onNext }) => {
  return (
    <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-10 text-center select-none animate-fade-in">
      {/* Background Soft Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 sm:w-[500px] sm:h-[500px] bg-gradient-to-tr from-amber-600/20 via-pink-600/20 to-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main Parchment / Letter Card Container */}
      <div className="relative w-full max-w-2xl bg-slate-900/90 border-2 border-amber-400/60 rounded-3xl p-6 sm:p-10 shadow-[0_0_60px_rgba(251,191,36,0.25)] text-slate-100 my-auto overflow-hidden">
        {/* Subtle Gold Corner Accents */}
        <div className="absolute top-3 left-3 border-t-2 border-l-2 border-amber-300/80 w-6 h-6" />
        <div className="absolute top-3 right-3 border-t-2 border-r-2 border-amber-300/80 w-6 h-6" />
        <div className="absolute bottom-3 left-3 border-b-2 border-l-2 border-amber-300/80 w-6 h-6" />
        <div className="absolute bottom-3 right-3 border-b-2 border-r-2 border-amber-300/80 w-6 h-6" />

        {/* Letter Header Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/15 border border-amber-400/40 text-amber-300 text-xs sm:text-sm font-semibold uppercase tracking-wider mb-6">
          <Heart className="w-4 h-4 text-pink-400 fill-pink-400 animate-pulse" />
          Письмо от старшего брата
        </div>

        {/* Letter Handwritten Content */}
        <div className="space-y-4 sm:space-y-6 text-left font-sans text-amber-100/95 leading-relaxed text-base sm:text-xl font-normal">
          <p className="text-xl sm:text-2xl font-semibold text-amber-200 font-serif">
            Мои любимые Алижан и Дильназ!
          </p>

          <p>
            Вы даже не представляете, как много вы для меня значите.
          </p>

          <p>
            Я хочу, чтобы вы всегда улыбались, верили в себя, мечтали о самом большом и никогда не боялись идти вперёд.
          </p>

          <p>
            Пусть в вашей жизни будет много счастливых моментов, настоящих друзей и удивительных чудес.
          </p>

          <p>
            И помните: что бы ни случилось, ваш старший брат всегда будет рядом.
          </p>

          <div className="pt-4 text-right">
            <p className="text-xl sm:text-2xl font-bold font-serif text-pink-300">
              Я вас очень сильно люблю! ❤️
            </p>
            <p className="text-sm text-amber-300/80 italic mt-1 font-serif">
              Ваш старший брат
            </p>
          </div>
        </div>

        {/* Bottom Decorative Element */}
        <div className="mt-8 pt-6 border-t border-amber-400/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-amber-300/70 italic">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Написано с безусловной любовью и заботой</span>
          </div>

          <button
            onClick={onNext}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-pink-500 hover:from-amber-400 hover:to-pink-400 text-slate-950 font-bold text-sm sm:text-base rounded-2xl shadow-lg transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
          >
            <span>Перейти к празднику</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
