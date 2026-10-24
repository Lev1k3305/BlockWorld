import React, { useState } from 'react';
import { 
  Settings, 
  Backpack, 
  Sparkles, 
  Gem, 
  Star, 
  ChevronDown, 
  ChevronUp, 
  Compass,
  Gift,
  Lock,
  CheckCircle2
} from 'lucide-react';
import { HeroType, QuestState } from '../../game/types';
import { birthdayConfig } from '../../config/birthdayConfig';

interface GameHUDProps {
  questState: QuestState;
  heroType: HeroType;
  notification: string | null;
  onOpenSettings: () => void;
  onOpenInventory: () => void;
  isBirthdayRoom?: boolean;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  questState,
  heroType,
  notification,
  onOpenSettings,
  onOpenInventory,
  isBirthdayRoom = false,
}) => {
  const [questExpanded, setQuestExpanded] = useState<boolean>(true);

  const hero = heroType === 'sister' ? birthdayConfig.heroes.sister : birthdayConfig.heroes.brother;
  const crystalsCount = Object.values(questState.crystalsCollected).filter(Boolean).length;
  const starsCount = Object.values(questState.starsCollected).filter(Boolean).length;
  const totalCrystals = birthdayConfig.questItems.totalCrystals;
  const totalStars = birthdayConfig.questItems.totalStars;

  return (
    <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-2.5 sm:p-4 select-none">
      {/* Top Header Row */}
      <div className="flex items-start justify-between w-full max-w-5xl mx-auto gap-2">
        {/* Left Column: Player Profile & Collapsible Quest Tracker */}
        <div className="flex flex-col gap-2 max-w-[240px] sm:max-w-xs pointer-events-auto">
          {/* Player Profile Card */}
          <div className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-900/80 border border-slate-700/70 rounded-2xl shadow-lg backdrop-blur-sm">
            <div 
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center font-bold text-xs sm:text-sm text-white shadow-inner shrink-0"
              style={{ backgroundColor: hero.outfitColor }}
            >
              {heroType === 'sister' ? '✨' : '♞'}
            </div>
            <div className="leading-tight overflow-hidden">
              <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5 truncate">
                <span>{hero.name}</span>
                <span className="text-[10px] text-amber-300 font-mono bg-amber-950/60 px-1.5 py-0.2 rounded border border-amber-600/30">
                  Уровень {hero.age}
                </span>
              </div>
              <div className="text-[10px] sm:text-[11px] text-slate-300 font-fun truncate font-medium">
                {hero.role}
              </div>
            </div>
          </div>

          {/* Compact Collapsible Quest Panel */}
          <div className="bg-slate-900/80 border border-slate-700/70 rounded-2xl shadow-lg backdrop-blur-sm overflow-hidden transition-all">
            <button
              onClick={() => setQuestExpanded(!questExpanded)}
              className="w-full flex items-center justify-between px-3 py-2 text-left bg-slate-800/60 hover:bg-slate-800/80 transition-colors touch-btn"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 font-fun">
                <Compass className="w-3.5 h-3.5 text-amber-400" />
                <span>{isBirthdayRoom ? 'Праздничная комната' : 'Сердце острова'}</span>
              </div>
              {questExpanded ? (
                <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            {questExpanded && (
              <div className="p-2.5 text-[11px] space-y-1.5 text-slate-200 border-t border-slate-800/80">
                {isBirthdayRoom ? (
                  <>
                    <div className="flex items-center gap-1.5 text-pink-300 font-medium">
                      <Gift className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                      <span>Осмотрите подарки {birthdayConfig.heroes.brother.name}а и {birthdayConfig.heroes.sister.name}!</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-amber-300 font-medium">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>Послушайте поздравление: {birthdayConfig.olderBrotherName}</span>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Primary Objective */}
                    <div className="flex items-center justify-between font-semibold">
                      <span className="text-slate-200">Найди {totalCrystals} магических кристалла</span>
                      <span className="font-mono text-sky-300 bg-sky-950/60 px-1.5 py-0.2 rounded border border-sky-600/40 text-[10px]">
                        {crystalsCount}/{totalCrystals}
                      </span>
                    </div>

                    {/* Quest Locations */}
                    <div className="space-y-1 pl-1 text-[10px] text-slate-300">
                      <div className="flex items-center gap-1.5">
                        {questState.crystalsCollected['crystal_parkour'] ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-sky-400 ml-0.5 mr-0.5" />
                        )}
                        <span className={questState.crystalsCollected['crystal_parkour'] ? 'line-through text-slate-500' : ''}>
                          Небесный паркур
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {questState.crystalsCollected['crystal_cave'] ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 ml-0.5 mr-0.5" />
                        )}
                        <span className={questState.crystalsCollected['crystal_cave'] ? 'line-through text-slate-500' : ''}>
                          Скрытая пещера
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {questState.crystalsCollected['crystal_waterfall'] ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 ml-0.5 mr-0.5" />
                        )}
                        <span className={questState.crystalsCollected['crystal_waterfall'] ? 'line-through text-slate-500' : ''}>
                          Грот водопада
                        </span>
                      </div>
                    </div>

                    {/* Final Objective */}
                    <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between text-[10px]">
                      <div className="flex items-center gap-1.5">
                        {questState.heartRestored ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                        ) : crystalsCount >= totalCrystals ? (
                          <Sparkles className="w-3 h-3 text-amber-400 shrink-0 animate-pulse" />
                        ) : (
                          <Lock className="w-3 h-3 text-slate-500 shrink-0" />
                        )}
                        <span className={questState.heartRestored ? 'text-emerald-400 font-bold' : crystalsCount >= totalCrystals ? 'text-amber-300 font-bold' : 'text-slate-400'}>
                          Пробуди Сердце острова
                        </span>
                      </div>
                      <span className="text-[9px] text-slate-400">
                        {questState.heartRestored ? 'Готово' : crystalsCount >= totalCrystals ? 'Доступно!' : 'Заблокировано'}
                      </span>
                    </div>

                    {questState.heartRestored && (
                      <div className="text-pink-300 font-bold pt-1 text-center bg-pink-950/40 p-1 rounded-lg border border-pink-500/30 text-[10px]">
                        ⭐ Войдите в праздничный портал!
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Center: Toast Notification */}
        {notification && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-40 max-w-sm px-3.5 py-2 bg-slate-900/90 border border-amber-400/80 rounded-2xl shadow-xl text-center text-xs font-bold text-white pointer-events-auto backdrop-blur-sm animate-fade-in">
            {notification}
          </div>
        )}

        {/* Right Column: Refined Counters & Utilities */}
        <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto">
          {/* Crystals Counter */}
          <div className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-900/80 border border-sky-500/40 rounded-xl shadow-md text-xs font-bold text-sky-200 backdrop-blur-sm">
            <Gem className="w-3.5 h-3.5 text-sky-400 fill-sky-400/30" />
            <span className="font-mono text-sky-300">{crystalsCount}/{totalCrystals}</span>
          </div>

          {/* Stars Counter */}
          <div className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-900/80 border border-amber-500/40 rounded-xl shadow-md text-xs font-bold text-amber-200 backdrop-blur-sm">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400/30" />
            <span className="font-mono text-amber-300">{starsCount}/{totalStars}</span>
          </div>

          {/* Inventory Button */}
          <button
            onClick={onOpenInventory}
            className="p-2 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/70 text-slate-200 rounded-xl shadow-md touch-btn backdrop-blur-sm"
            title="Инвентарь"
          >
            <Backpack className="w-4 h-4 text-emerald-400" />
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="p-2 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/70 text-slate-200 rounded-xl shadow-md touch-btn backdrop-blur-sm"
            title="Настройки"
          >
            <Settings className="w-4 h-4 text-slate-300" />
          </button>
        </div>
      </div>

      <div className="flex-1" />
    </div>
  );
};
