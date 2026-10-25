import React, { useState } from 'react';
import { Star, Sparkles, ArrowRight, Heart } from 'lucide-react';

interface TwoStarsSceneProps {
  onNext: () => void;
}

export const TwoStarsScene: React.FC<TwoStarsSceneProps> = ({ onNext }) => {
  const [selectedStar, setSelectedStar] = useState<'alizhan' | 'dilnaz' | null>(null);
  const [visitedStars, setVisitedStars] = useState<{ alizhan: boolean; dilnaz: boolean }>({
    alizhan: false,
    dilnaz: false,
  });

  const handleSelectStar = (who: 'alizhan' | 'dilnaz') => {
    setSelectedStar(who);
    setVisitedStars((prev) => ({ ...prev, [who]: true }));
  };

  return (
    <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12 text-center select-none animate-fade-in">
      <div className="max-w-3xl mx-auto space-y-3 mb-8 sm:mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-200 text-xs sm:text-sm font-medium tracking-wide">
          <Sparkles className="w-4 h-4 text-amber-300" />
          Нажмите на каждую звезду, чтобы прочитать пожелание
        </div>
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold font-serif text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-pink-200 to-purple-200">
          Две волшебные звезды
        </h2>
      </div>

      {/* Two Interactive Stars Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 w-full max-w-4xl mx-auto mb-10">
        {/* Alizhan's Star */}
        <div
          onClick={() => handleSelectStar('alizhan')}
          className={`group relative cursor-pointer p-6 sm:p-8 rounded-3xl transition-all duration-500 border ${
            selectedStar === 'alizhan'
              ? 'bg-slate-900/90 border-amber-400 shadow-[0_0_50px_rgba(251,191,36,0.35)] scale-105'
              : 'bg-slate-900/60 hover:bg-slate-900/80 border-slate-700/80 hover:border-amber-400/60 shadow-xl'
          }`}
        >
          {/* Star Icon Container */}
          <div className="relative flex items-center justify-center mb-6">
            <div
              className={`absolute inset-0 rounded-full blur-2xl transition-opacity duration-500 ${
                selectedStar === 'alizhan' ? 'bg-amber-400/40 opacity-100' : 'bg-amber-400/10 opacity-50 group-hover:opacity-80'
              }`}
            />
            <div
              className={`relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-amber-400/20 to-indigo-900/50 border border-amber-400/50 flex items-center justify-center transform transition-transform duration-500 ${
                selectedStar === 'alizhan' ? 'rotate-12 scale-110' : 'group-hover:rotate-6'
              }`}
            >
              <Star
                className={`w-14 h-14 sm:w-16 sm:h-16 transition-all duration-500 ${
                  selectedStar === 'alizhan'
                    ? 'text-amber-300 fill-amber-300 drop-shadow-[0_0_15px_rgba(251,191,36,0.8)]'
                    : 'text-amber-400/80 group-hover:text-amber-300'
                }`}
              />
            </div>
            {visitedStars.alizhan && (
              <span className="absolute -top-2 -right-2 bg-amber-400 text-slate-950 p-1 rounded-full text-xs shadow-md">
                ✨
              </span>
            )}
          </div>

          <h3 className="text-2xl sm:text-3xl font-serif font-bold text-amber-200 mb-2">
            Алижан
          </h3>
          <p className="text-xs text-amber-300/70 uppercase tracking-widest font-semibold mb-4">
            Звезда Удивительных Открытий
          </p>

          {/* Wish Content Reveal */}
          <div
            className={`transition-all duration-500 overflow-hidden ${
              selectedStar === 'alizhan' ? 'max-h-60 opacity-100 mt-4' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="p-4 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-slate-200 text-sm sm:text-base leading-relaxed italic font-serif">
              «Пусть твоя жизнь будет наполнена радостью, удивительными открытиями и исполнением самых заветных мечтаний!»
            </div>
          </div>
        </div>

        {/* Dilnaz's Star */}
        <div
          onClick={() => handleSelectStar('dilnaz')}
          className={`group relative cursor-pointer p-6 sm:p-8 rounded-3xl transition-all duration-500 border ${
            selectedStar === 'dilnaz'
              ? 'bg-slate-900/90 border-pink-400 shadow-[0_0_50px_rgba(244,114,182,0.35)] scale-105'
              : 'bg-slate-900/60 hover:bg-slate-900/80 border-slate-700/80 hover:border-pink-400/60 shadow-xl'
          }`}
        >
          {/* Star Icon Container */}
          <div className="relative flex items-center justify-center mb-6">
            <div
              className={`absolute inset-0 rounded-full blur-2xl transition-opacity duration-500 ${
                selectedStar === 'dilnaz' ? 'bg-pink-400/40 opacity-100' : 'bg-pink-400/10 opacity-50 group-hover:opacity-80'
              }`}
            />
            <div
              className={`relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-pink-400/20 to-purple-900/50 border border-pink-400/50 flex items-center justify-center transform transition-transform duration-500 ${
                selectedStar === 'dilnaz' ? '-rotate-12 scale-110' : 'group-hover:-rotate-6'
              }`}
            >
              <Star
                className={`w-14 h-14 sm:w-16 sm:h-16 transition-all duration-500 ${
                  selectedStar === 'dilnaz'
                    ? 'text-pink-300 fill-pink-300 drop-shadow-[0_0_15px_rgba(244,114,182,0.8)]'
                    : 'text-pink-400/80 group-hover:text-pink-300'
                }`}
              />
            </div>
            {visitedStars.dilnaz && (
              <span className="absolute -top-2 -right-2 bg-pink-400 text-slate-950 p-1 rounded-full text-xs shadow-md">
                💖
              </span>
            )}
          </div>

          <h3 className="text-2xl sm:text-3xl font-serif font-bold text-pink-200 mb-2">
            Дильназ
          </h3>
          <p className="text-xs text-pink-300/70 uppercase tracking-widest font-semibold mb-4">
            Звезда Волшебства и Счастья
          </p>

          {/* Wish Content Reveal */}
          <div
            className={`transition-all duration-500 overflow-hidden ${
              selectedStar === 'dilnaz' ? 'max-h-60 opacity-100 mt-4' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="p-4 rounded-2xl bg-pink-400/10 border border-pink-400/20 text-slate-200 text-sm sm:text-base leading-relaxed italic font-serif">
              «Пусть каждый твой день будет волшебным, счастливым и наполненным улыбками!»
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Button to Next Scene */}
      <div className="mt-4">
        <button
          onClick={onNext}
          className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-base sm:text-lg rounded-full shadow-lg border border-purple-300/30 transform hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
        >
          <span>Читать письмо от брата</span>
          <ArrowRight className="w-5 h-5 text-amber-300 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};
