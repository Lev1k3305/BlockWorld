import React, { useEffect } from 'react';
import { Camera, RotateCcw, Heart, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { birthdayConfig } from '../../config/birthdayConfig';
import { sounds } from '../../services/soundEffects';

interface FinalCelebrationScreenProps {
  onReturnToIsland: () => void;
  onTakeScreenshot: () => void;
}

export const FinalCelebrationScreen: React.FC<FinalCelebrationScreenProps> = ({
  onReturnToIsland,
  onTakeScreenshot,
}) => {
  useEffect(() => {
    sounds.playHeartRestored();

    const interval = setInterval(() => {
      confetti({
        particleCount: 55,
        spread: 90,
        origin: { y: 0.7, x: 0.2 + Math.random() * 0.6 },
        colors: ['#ec4899', '#38bdf8', '#facc15', '#a855f7', '#10b981'],
      });
    }, 2200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in text-white overflow-y-auto">
      {/* Decorative stars */}
      <div className="absolute inset-0 pointer-events-none opacity-40 overflow-hidden">
        <div className="absolute top-10 left-10 text-yellow-300 text-2xl animate-pulse">⭐</div>
        <div className="absolute top-24 right-20 text-pink-400 text-xl animate-pulse">✨</div>
        <div className="absolute bottom-20 left-16 text-cyan-400 text-3xl animate-bounce">🌟</div>
        <div className="absolute bottom-32 right-12 text-amber-300 text-2xl animate-pulse">✨</div>
      </div>

      <div className="w-full max-w-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-amber-400/60 rounded-3xl p-6 sm:p-8 shadow-2xl relative text-center flex flex-col items-center">
        {/* Top Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full text-xs font-bold uppercase tracking-widest font-fun mb-4">
          <Sparkles className="w-4 h-4 text-amber-400" />
          Приключение завершено: Сердце острова спасено
        </div>

        {/* Story Headings */}
        <h1 className="text-xl sm:text-3xl md:text-4xl font-extrabold font-fun text-slate-100 tracking-tight leading-snug">
          «{birthdayConfig.messages.finalHeading}»
        </h1>
        <h2 className="text-base sm:text-xl md:text-2xl font-bold font-fun text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-pink-300 to-sky-300 mt-2">
          «{birthdayConfig.messages.finalSubheading}»
        </h2>

        {/* Big Birthday Heart Greeting */}
        <div className="my-5 py-4 px-6 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-amber-500/20 border border-pink-500/40 rounded-2xl w-full max-w-lg">
          <p className="text-3xl sm:text-5xl font-black font-fun text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-amber-300 to-cyan-300 flex items-center justify-center gap-3">
            {birthdayConfig.messages.finalHeartMessage}
          </p>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 font-fun">
            Поздравляем <strong className="text-sky-300">{birthdayConfig.heroes.brother.name}</strong> с {birthdayConfig.heroes.brother.age}-летием и <strong className="text-pink-300">{birthdayConfig.heroes.sister.name}</strong> с {birthdayConfig.heroes.sister.age}-летием!
          </p>
        </div>

        {/* Heroes Showcase Card */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full max-w-lg my-2">
          {/* Dilnaz Card */}
          <div className="p-3 bg-slate-800/60 border border-pink-500/40 rounded-2xl flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-xl bg-pink-500 flex items-center justify-center text-2xl shadow-lg mb-2">
              ✨
            </div>
            <div className="text-xs font-bold text-white">{birthdayConfig.heroes.sister.name}</div>
            <div className="text-[10px] text-pink-300 font-fun">{birthdayConfig.heroes.sister.age} лет</div>
            <div className="text-[10px] text-slate-400 mt-1 line-clamp-1">{birthdayConfig.gifts.sister.itemName}</div>
          </div>

          {/* Baby Dragon */}
          <div className="col-span-2 sm:col-span-1 p-3 bg-slate-800/60 border border-emerald-500/40 rounded-2xl flex flex-col items-center text-center order-last sm:order-none">
            <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center text-2xl shadow-lg mb-2">
              🐲
            </div>
            <div className="text-xs font-bold text-white">Дракончик Спарки</div>
            <div className="text-[10px] text-emerald-300 font-fun">Верный спутник</div>
            <div className="text-[10px] text-slate-400 mt-1">Праздничный дракон</div>
          </div>

          {/* Alizhan Card */}
          <div className="p-3 bg-slate-800/60 border border-blue-500/40 rounded-2xl flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-2xl shadow-lg mb-2">
              ♞
            </div>
            <div className="text-xs font-bold text-white">{birthdayConfig.heroes.brother.name}</div>
            <div className="text-[10px] text-sky-300 font-fun">{birthdayConfig.heroes.brother.age} лет</div>
            <div className="text-[10px] text-slate-400 mt-1 line-clamp-1">{birthdayConfig.gifts.brother.itemName}</div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md mt-6">
          <button
            onClick={onTakeScreenshot}
            className="w-full sm:flex-1 py-3 px-5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 active:scale-95 text-slate-950 font-bold rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 touch-btn text-sm font-fun"
          >
            <Camera className="w-4 h-4" />
            Сделать финальный снимок
          </button>

          <button
            onClick={onReturnToIsland}
            className="w-full sm:flex-1 py-3 px-5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 border border-slate-700 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 touch-btn text-sm font-fun"
          >
            <RotateCcw className="w-4 h-4 text-sky-400" />
            Вернуться на остров
          </button>
        </div>
      </div>
    </div>
  );
};
