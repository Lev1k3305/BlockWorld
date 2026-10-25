import React, { useState } from 'react';
import { BookOpen, Sparkles } from 'lucide-react';

interface OpeningSceneProps {
  onNext: () => void;
}

export const OpeningScene: React.FC<OpeningSceneProps> = ({ onNext }) => {
  const [isOpening, setIsOpening] = useState(false);

  const handleOpenBook = () => {
    setIsOpening(true);
    setTimeout(() => {
      onNext();
    }, 1200);
  };

  return (
    <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center select-none">
      {/* Decorative ambient glow behind book */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 sm:w-96 sm:h-96 bg-gradient-to-tr from-pink-600/30 via-purple-600/30 to-amber-500/30 rounded-full blur-3xl pointer-events-none animate-pulse" />

      {/* Floating Glowing Storybook Container */}
      <div
        className={`relative mb-8 sm:mb-12 transition-all duration-1000 transform ${
          isOpening
            ? 'scale-125 rotate-6 opacity-0 filter blur-sm'
            : 'hover:scale-105 animate-bounce'
        }`}
        style={{ animationDuration: '4s' }}
      >
        <div className="relative w-40 h-48 sm:w-52 sm:h-64 bg-gradient-to-b from-amber-700 via-purple-900 to-indigo-950 border-4 border-amber-300/80 rounded-2xl shadow-[0_0_50px_rgba(251,191,36,0.4)] flex flex-col items-center justify-center p-4 overflow-hidden">
          {/* Gold Filigree Corner Accents */}
          <div className="absolute top-2 left-2 border-t-2 border-l-2 border-amber-300/70 w-4 h-4" />
          <div className="absolute top-2 right-2 border-t-2 border-r-2 border-amber-300/70 w-4 h-4" />
          <div className="absolute bottom-2 left-2 border-b-2 border-l-2 border-amber-300/70 w-4 h-4" />
          <div className="absolute bottom-2 right-2 border-b-2 border-r-2 border-amber-300/70 w-4 h-4" />

          {/* Book Spine Accent Line */}
          <div className="absolute left-3 top-0 bottom-0 w-1 bg-amber-400/50 shadow-sm" />

          {/* Book Emblem */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-amber-400/20 border-2 border-amber-300/60 flex items-center justify-center mb-3 shadow-inner">
            <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-amber-300 animate-pulse" />
          </div>

          <p className="font-serif text-amber-200/90 text-xs sm:text-sm tracking-widest uppercase text-center font-bold">
            Книга Чудес
          </p>
        </div>
      </div>

      {/* Intro Text Sequence */}
      <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
        <p className="text-base sm:text-xl md:text-2xl text-purple-200/90 font-light tracking-wide font-sans animate-fade-in">
          «Эта история появилась благодаря двум особенным людям...»
        </p>

        {/* Revealed Main Names */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight font-serif text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-amber-200 to-purple-300 drop-shadow-[0_4px_20px_rgba(244,114,182,0.5)]">
          Алижан и Дильназ
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-lg text-amber-200/80 italic font-serif max-w-lg mx-auto">
          «История, которую создал для вас ваш старший брат»
        </p>
      </div>

      {/* Prominent Action Button */}
      <div className="mt-8 sm:mt-12">
        <button
          onClick={handleOpenBook}
          disabled={isOpening}
          className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:via-purple-500 hover:to-indigo-500 text-white font-bold text-lg sm:text-xl rounded-full shadow-[0_0_30px_rgba(219,39,119,0.5)] border border-pink-300/40 transform hover:-translate-y-1 active:translate-y-0 transition-all duration-300 cursor-pointer overflow-hidden"
        >
          {/* Button Shine Overlay */}
          <span className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out pointer-events-none" />

          <BookOpen className="w-6 h-6 text-amber-300 group-hover:rotate-12 transition-transform duration-300" />
          <span className="tracking-wide">Открыть нашу историю</span>
        </button>
      </div>
    </div>
  );
};
