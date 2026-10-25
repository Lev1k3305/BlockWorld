import React from 'react';
import { BookOpen, Clock, Heart, LogOut, Mail, Sparkles } from 'lucide-react';
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
    <header className="sticky top-0 z-30 bg-[#fbf8f3]/95 backdrop-blur-md border-b border-[#ebdcd0] shadow-xs px-4 py-3">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Brand Logo & Selection Screen Navigation */}
        <button
          onClick={onNavigateSelect}
          className="flex items-center gap-2.5 text-left group cursor-pointer transition-transform active:scale-98"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300/80 flex items-center justify-center text-amber-800 shadow-xs group-hover:rotate-[-3deg] transition-transform">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-serif-book text-2xl font-bold text-[#4a3528] leading-none group-hover:text-amber-800 transition-colors">
              Два характера
            </h1>
            <p className="font-handwriting text-sm text-[#8c7365] -mt-0.5">
              Семейный журнал
            </p>
          </div>
        </button>

        {/* Current Active Journal Status (When inside a personal journal) */}
        {currentView === 'journal' && activeConfig && (
          <div className="hidden md:flex items-center gap-2 px-3.5 py-1 rounded-full border text-xs font-bold shadow-2xs"
               style={{
                 backgroundColor: activeConfig.badgeBg,
                 borderColor: activeConfig.borderAccent,
                 color: activeConfig.primaryTextColor,
               }}>
            <span className="text-sm">{activeConfig.avatarEmoji}</span>
            <span>Журнал {activeConfig.name}</span>
          </div>
        )}

        {/* Navigation Quick Links */}
        <nav className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {/* Brother's Message Shared Entry */}
          <button
            onClick={onOpenBrotherMessage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold bg-amber-100/90 text-amber-900 border border-amber-300 hover:bg-amber-200 transition-colors cursor-pointer shadow-2xs"
          >
            <Mail className="w-4 h-4 text-amber-800" />
            <span>Послание от брата</span>
          </button>

          {/* Common Section Button */}
          <button
            onClick={onOpenCommon}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              currentView === 'common'
                ? 'bg-rose-100 text-rose-800 border border-rose-300 shadow-xs'
                : 'text-[#6e584b] hover:bg-rose-50'
            }`}
          >
            <Heart className="w-4 h-4 text-rose-500" />
            <span className="hidden sm:inline">Что у нас общего?</span>
            <span className="sm:hidden">Общее</span>
          </button>

          {/* Time Capsule Button */}
          <button
            onClick={onOpenCapsule}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              currentView === 'capsule'
                ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-xs'
                : 'text-[#6e584b] hover:bg-amber-50'
            }`}
          >
            <Clock className="w-4 h-4 text-amber-700" />
            <span className="hidden sm:inline">Капсула времени</span>
            <span className="sm:hidden">Капсула</span>
          </button>

          {/* Exit Journal Button (Shown when logged into a profile or viewing non-selection view) */}
          {currentView !== 'select' && (
            <button
              onClick={onNavigateSelect}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-300/80 transition-all cursor-pointer shadow-2xs"
              title="Выйти из текущего журнала на экран выбора"
            >
              <LogOut className="w-4 h-4 text-stone-600" />
              <span>Выйти из журнала</span>
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};
