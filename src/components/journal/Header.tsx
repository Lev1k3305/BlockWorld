import React from 'react';
import { BookOpen, Sparkles, Clock, Heart, Home } from 'lucide-react';
import { JournalOwner } from '../../types/journal';
import { OWNER_CONFIGS } from '../../constants/questions';

interface HeaderProps {
  currentView: 'home' | 'journal' | 'common' | 'capsule';
  activeOwner?: JournalOwner;
  onNavigateHome: () => void;
  onOpenOwnerBook: (owner: JournalOwner) => void;
  onOpenCommon: () => void;
  onOpenCapsule: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  activeOwner,
  onNavigateHome,
  onOpenOwnerBook,
  onOpenCommon,
  onOpenCapsule,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#fbf8f3]/90 backdrop-blur-md border-b border-[#ebdcd0] shadow-xs px-4 py-3">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Brand Logo & Home Button */}
        <button
          onClick={onNavigateHome}
          className="flex items-center gap-2 text-left group cursor-pointer transition-transform active:scale-98"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300/60 flex items-center justify-center text-amber-800 shadow-xs group-hover:rotate-[-3deg] transition-transform">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-serif-book text-2xl font-bold text-[#4a3528] leading-none group-hover:text-amber-800 transition-colors">
              Два характера
            </h1>
            <p className="font-handwriting text-sm text-[#8c7365] -mt-0.5">
              Семейная капсула времени
            </p>
          </div>
        </button>

        {/* Navigation Quick Links */}
        <nav className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {currentView !== 'home' && (
            <button
              onClick={onNavigateHome}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-[#5c473a] hover:bg-amber-100/60 transition-colors cursor-pointer"
            >
              <Home className="w-4 h-4 text-amber-700" />
              <span>Главная</span>
            </button>
          )}

          {/* Alizhan Book Button */}
          <button
            onClick={() => onOpenOwnerBook('alizhan')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
              currentView === 'journal' && activeOwner === 'alizhan'
                ? 'bg-[#fcece6] text-[#c05638] border border-[#f2beaf] shadow-xs'
                : 'text-[#6e584b] hover:bg-[#fcece6]/60'
            }`}
          >
            <span className="text-base">{OWNER_CONFIGS.alizhan.avatarEmoji}</span>
            <span>Книга Алижан</span>
          </button>

          {/* Dilnaz Book Button */}
          <button
            onClick={() => onOpenOwnerBook('dilnaz')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
              currentView === 'journal' && activeOwner === 'dilnaz'
                ? 'bg-[#f0ecfd] text-[#6b4ebd] border border-[#c9bbf2] shadow-xs'
                : 'text-[#6e584b] hover:bg-[#f0ecfd]/60'
            }`}
          >
            <span className="text-base">{OWNER_CONFIGS.dilnaz.avatarEmoji}</span>
            <span>Книга Дильназ</span>
          </button>

          {/* Common Section Button */}
          <button
            onClick={onOpenCommon}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
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
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
              currentView === 'capsule'
                ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-xs'
                : 'text-[#6e584b] hover:bg-amber-50'
            }`}
          >
            <Clock className="w-4 h-4 text-amber-700" />
            <span className="hidden sm:inline">Капсула времени</span>
            <span className="sm:hidden">Капсула</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
