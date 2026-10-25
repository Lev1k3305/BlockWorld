import React from 'react';
import { BookOpen, Clock, Heart, Users, Mail } from 'lucide-react';
import { JournalOwner } from '../../types/journal';
import { OWNER_CONFIGS } from '../../constants/questions';

export type ViewMode = 'select' | 'journal' | 'common' | 'capsule';

interface HeaderProps {
  currentView: ViewMode;
  activeOwner?: JournalOwner | null;
  onNavigateSelect: () => void;
  onOpenBrotherMessage: () => void;
  onOpenCommon: () => void;
  onOpenCapsule: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  activeOwner,
  onNavigateSelect,
  onOpenBrotherMessage,
  onOpenCommon,
  onOpenCapsule,
}) => {
  const activeConfig = activeOwner ? OWNER_CONFIGS[activeOwner] : null;

  return (
    <header className="sticky top-0 z-30 bg-[#fbf8f3]/95 backdrop-blur-md border-b border-[#ebdcd0] shadow-xs px-3 sm:px-4 py-2.5">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2 sm:gap-3">
        {/* Brand Logo & Switch Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onNavigateSelect}
            className="flex items-center gap-2 text-left group cursor-pointer transition-transform active:scale-98"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-100 border border-amber-300/80 flex items-center justify-center text-amber-800 shadow-xs group-hover:rotate-[-3deg] transition-transform shrink-0">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h1 className="font-serif-book text-xl sm:text-2xl font-bold text-[#4a3528] leading-none group-hover:text-amber-800 transition-colors">
                Два характера
              </h1>
              <p className="font-handwriting text-xs sm:text-sm text-[#8c7365] -mt-0.5">
                Семейный журнал
              </p>
            </div>
          </button>

          {/* Active Profile Status & Switch Button */}
          {activeConfig && (
            <button
              onClick={onNavigateSelect}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-bold shadow-2xs hover:opacity-90 transition-opacity cursor-pointer shrink-0"
              style={{
                backgroundColor: activeConfig.badgeBg,
                borderColor: activeConfig.borderAccent,
                color: activeConfig.primaryTextColor,
              }}
              title="Нажмите, чтобы сменить профиль"
            >
              <span>{activeConfig.avatarEmoji}</span>
              <span className="hidden xs:inline">{activeConfig.name}</span>
              <span className="text-[10px] opacity-80 underline ml-0.5">Сменить</span>
            </button>
          )}
        </div>

        {/* Navigation Quick Links */}
        <nav className="flex items-center gap-1 sm:gap-2 flex-wrap">
          {/* Brother's Message Entry */}
          <button
            onClick={onOpenBrotherMessage}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold bg-amber-100/90 text-amber-900 border border-amber-300 hover:bg-amber-200 transition-colors cursor-pointer shadow-2xs"
          >
            <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-800 shrink-0" />
            <span>Послание от брата</span>
          </button>

          {/* Common Section Button */}
          <button
            onClick={onOpenCommon}
            className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              currentView === 'common'
                ? 'bg-rose-100 text-rose-800 border border-rose-300 shadow-xs font-bold'
                : 'text-[#6e584b] hover:bg-rose-50'
            }`}
          >
            <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-500 shrink-0" />
            <span className="hidden md:inline">Что у нас общего?</span>
            <span className="md:hidden">Общее</span>
          </button>

          {/* Time Capsule Button */}
          <button
            onClick={onOpenCapsule}
            className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              currentView === 'capsule'
                ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-xs font-bold'
                : 'text-[#6e584b] hover:bg-amber-50'
            }`}
          >
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-700 shrink-0" />
            <span className="hidden md:inline">Капсула времени</span>
            <span className="md:hidden">Капсула</span>
          </button>

          {/* Switch Profile Button */}
          {activeOwner && currentView !== 'select' && (
            <button
              onClick={onNavigateSelect}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-300 transition-all cursor-pointer shadow-2xs"
              title="Вернуться на экран выбора профиля"
            >
              <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-600 shrink-0" />
              <span>Сменить профиль</span>
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};
