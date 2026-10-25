import React from 'react';
import { Camera, Sparkles, Heart, BookOpen } from 'lucide-react';
import { AlbumOwner } from '../../types/album';

interface HeaderProps {
  activeOwner: AlbumOwner;
  onOwnerChange: (owner: AlbumOwner) => void;
  onGoHome?: () => void;
  isHome?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeOwner,
  onOwnerChange,
  onGoHome,
  isHome = true,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#faf7f2]/90 backdrop-blur-md border-b border-amber-900/10 shadow-xs transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Brand Logo & Tagline */}
        <div
          onClick={onGoHome}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-400 to-amber-300 p-0.5 shadow-sm group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#faf7f2] rounded-[14px] flex items-center justify-center">
              <Camera className="w-5 h-5 text-amber-800" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-serif font-bold tracking-tight text-amber-950">
                Наши моменты
              </h1>
              <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
            </div>
            <p className="text-xs text-amber-800/70 font-sans tracking-wide">
              Каждый день — новая история
            </p>
          </div>
        </div>

        {/* Owner Tab Switcher */}
        {isHome && (
          <nav className="flex items-center gap-1.5 p-1 bg-amber-900/5 rounded-2xl border border-amber-900/10">
            <button
              onClick={() => onOwnerChange('alizhan')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeOwner === 'alizhan'
                  ? 'bg-amber-900 text-amber-50 shadow-sm scale-100'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
              }`}
            >
              <div className="w-2 h-2 rounded-full bg-blue-400" />
              Альбомы Алижан
            </button>

            <button
              onClick={() => onOwnerChange('dilnaz')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeOwner === 'dilnaz'
                  ? 'bg-amber-900 text-amber-50 shadow-sm scale-100'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
              }`}
            >
              <div className="w-2 h-2 rounded-full bg-rose-400" />
              Альбомы Дильназ
            </button>
          </nav>
        )}

        {!isHome && onGoHome && (
          <button
            onClick={onGoHome}
            className="flex items-center gap-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-xl border border-stone-200 transition-all active:scale-95"
          >
            <BookOpen className="w-4 h-4 text-amber-700" />
            Все альбомы
          </button>
        )}
      </div>
    </header>
  );
};
