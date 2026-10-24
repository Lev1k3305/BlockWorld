import React, { useState } from 'react';
import { Play, Sparkles, Sliders, Camera, Heart, Check, ArrowRight, X } from 'lucide-react';
import { HeroType } from '../../game/types';
import { birthdayConfig } from '../../config/birthdayConfig';
import { sounds } from '../../services/soundEffects';

interface MainMenuProps {
  selectedHero: HeroType;
  hasSavedProgress: boolean;
  onStartNewGame: (hero: HeroType) => void;
  onContinueGame: () => void;
  onOpenSettings: () => void;
  onOpenStudio: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  selectedHero,
  hasSavedProgress,
  onStartNewGame,
  onContinueGame,
  onOpenSettings,
  onOpenStudio,
}) => {
  const [showHeroSelect, setShowHeroSelect] = useState<boolean>(false);
  const [chosenHero, setChosenHero] = useState<HeroType>(selectedHero);

  const sister = birthdayConfig.heroes.sister;
  const brother = birthdayConfig.heroes.brother;

  const handleStartClick = () => {
    sounds.playButtonClick();
    setShowHeroSelect(true);
  };

  const handleConfirmHero = () => {
    sounds.playButtonClick();
    sounds.startBackgroundMusic();
    onStartNewGame(chosenHero);
  };

  return (
    <div className="fixed inset-0 z-30 flex flex-col justify-between p-4 sm:p-6 md:p-8 select-none pointer-events-none">
      {/* Top Left: Clean, Elegant Game Title Lockup (Unobtrusive & Cinematic) */}
      <div className="flex flex-col items-start max-w-lg pointer-events-auto">
        <div className="flex items-center gap-2 text-xs font-fun text-amber-300 bg-slate-950/60 px-3 py-1 rounded-full border border-white/10 backdrop-blur-sm mb-2">
          <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
          <span>{birthdayConfig.subtitle}</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black font-game tracking-wider text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
          BLOCKWORLD
        </h1>
        
        <div className="text-base sm:text-xl font-bold font-fun text-slate-200 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] mt-0.5">
          Два героя и Сердце острова
        </div>

        <div className="text-xs text-slate-300 font-fun mt-1.5 opacity-90 drop-shadow-md">
          Подарок старшего брата • Версия для именинников
        </div>
      </div>

      {/* Bottom Center: Compact Action Bar leaving the 3D Island fully visible */}
      <div className="w-full max-w-sm mx-auto pointer-events-auto flex flex-col items-center gap-2 mb-2 sm:mb-4">
        {hasSavedProgress ? (
          <div className="flex flex-col gap-2 w-full">
            <button
              onClick={() => {
                sounds.playButtonClick();
                sounds.startBackgroundMusic();
                onContinueGame();
              }}
              className="w-full py-3 px-5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-sm rounded-xl shadow-lg border border-emerald-400/40 transition-all flex items-center justify-center gap-2 touch-btn"
            >
              <Sparkles className="w-4 h-4 text-emerald-200" />
              Продолжить
            </button>

            <button
              onClick={handleStartClick}
              className="w-full py-2.5 px-4 bg-slate-900/80 hover:bg-slate-800 active:scale-95 text-slate-100 font-semibold text-xs rounded-xl shadow-md border border-slate-700 transition-all flex items-center justify-center gap-2 touch-btn backdrop-blur-sm"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              Начать приключение заново
            </button>
          </div>
        ) : (
          <button
            onClick={handleStartClick}
            className="w-full py-3.5 px-6 bg-gradient-to-r from-amber-500 via-pink-500 to-purple-600 hover:opacity-95 active:scale-95 text-white font-extrabold text-sm sm:text-base rounded-2xl shadow-xl border border-amber-300/40 transition-all flex items-center justify-center gap-2.5 touch-btn"
          >
            <Play className="w-4 h-4 fill-white" />
            Начать приключение
          </button>
        )}

        {/* Compact Utility Buttons */}
        <div className="grid grid-cols-2 gap-2 w-full">
          <button
            onClick={() => {
              sounds.playButtonClick();
              onOpenStudio();
            }}
            className="py-2 px-3 bg-slate-950/70 hover:bg-slate-900 active:scale-95 text-slate-200 border border-white/10 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5 touch-btn backdrop-blur-sm"
          >
            <Camera className="w-3.5 h-3.5 text-sky-400" />
            Пиксельная фотостудия
          </button>

          <button
            onClick={() => {
              sounds.playButtonClick();
              onOpenSettings();
            }}
            className="py-2 px-3 bg-slate-950/70 hover:bg-slate-900 active:scale-95 text-slate-200 border border-white/10 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5 touch-btn backdrop-blur-sm"
          >
            <Sliders className="w-3.5 h-3.5 text-slate-400" />
            Настройки
          </button>
        </div>

        <div className="text-[10px] text-slate-400 font-fun mt-1 bg-slate-950/60 px-3 py-0.5 rounded-full border border-white/5">
          WASD / Джойстик — движение • Пробел — прыжок • E — действие
        </div>
      </div>

      {/* Hero Selection Modal */}
      {showHeroSelect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in pointer-events-auto">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col text-white max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h2 className="text-lg sm:text-xl font-bold font-fun text-white">
                  Выберите героя
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  За кого из именинников вы хотите отправиться в путь?
                </p>
              </div>
              <button
                onClick={() => setShowHeroSelect(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors touch-btn"
                title="Закрыть"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-4">
              {/* Dilnaz Card */}
              <div
                onClick={() => {
                  sounds.playButtonClick();
                  setChosenHero('sister');
                }}
                className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                  chosenHero === 'sister'
                    ? 'border-pink-500 bg-pink-950/40 shadow-lg scale-[1.01]'
                    : 'border-slate-800 bg-slate-950/50 hover:border-slate-700 opacity-80'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 rounded-xl bg-pink-500 flex items-center justify-center text-xl shadow-md">
                    ✨
                  </div>
                  {chosenHero === 'sister' && (
                    <span className="p-1 bg-pink-500 rounded-full">
                      <Check className="w-3.5 h-3.5 text-white" />
                    </span>
                  )}
                </div>
                <div className="text-base font-bold font-fun text-white flex items-center gap-1.5">
                  <span>{sister.name}</span>
                  <span className="text-[10px] text-pink-300 font-mono bg-pink-950/80 px-1.5 py-0.5 rounded border border-pink-500/30">
                    {sister.age} лет
                  </span>
                </div>
                <div className="text-xs text-pink-300 font-fun font-semibold mt-0.5">{sister.role}</div>
                <p className="text-[11px] text-slate-300 mt-1.5 leading-relaxed">
                  {sister.description}
                </p>
                <div className="mt-2.5 pt-2 border-t border-slate-800/80 text-[10px] text-slate-400">
                  <span className="font-semibold text-slate-300">Любит:</span> {sister.favoriteThings.join(', ')}
                </div>
              </div>

              {/* Alizhan Card */}
              <div
                onClick={() => {
                  sounds.playButtonClick();
                  setChosenHero('brother');
                }}
                className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                  chosenHero === 'brother'
                    ? 'border-blue-500 bg-blue-950/40 shadow-lg scale-[1.01]'
                    : 'border-slate-800 bg-slate-950/50 hover:border-slate-700 opacity-80'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-xl shadow-md">
                    ♞
                  </div>
                  {chosenHero === 'brother' && (
                    <span className="p-1 bg-blue-500 rounded-full">
                      <Check className="w-3.5 h-3.5 text-white" />
                    </span>
                  )}
                </div>
                <div className="text-base font-bold font-fun text-white flex items-center gap-1.5">
                  <span>{brother.name}</span>
                  <span className="text-[10px] text-blue-300 font-mono bg-blue-950/80 px-1.5 py-0.5 rounded border border-blue-500/30">
                    {brother.age} лет
                  </span>
                </div>
                <div className="text-xs text-sky-300 font-fun font-semibold mt-0.5">{brother.role}</div>
                <p className="text-[11px] text-slate-300 mt-1.5 leading-relaxed">
                  {brother.description}
                </p>
                <div className="mt-2.5 pt-2 border-t border-slate-800/80 text-[10px] text-slate-400">
                  <span className="font-semibold text-slate-300">Любит:</span> {brother.favoriteThings.join(', ')}
                </div>
              </div>
            </div>

            <div className="flex gap-2.5 mt-auto pt-2">
              <button
                onClick={() => setShowHeroSelect(false)}
                className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-all touch-btn"
              >
                Отмена
              </button>
              <button
                onClick={handleConfirmHero}
                className="flex-1 py-2.5 px-5 bg-gradient-to-r from-amber-500 to-pink-500 hover:opacity-95 text-slate-950 font-bold rounded-xl text-xs sm:text-sm shadow-lg transition-all flex items-center justify-center gap-2 touch-btn font-fun"
              >
                Играть за {chosenHero === 'sister' ? sister.name : brother.name}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
