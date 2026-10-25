import React from 'react';
import { BookOpen, Heart, Clock, Sparkles, ArrowRight, Lock, Mail, Volume2 } from 'lucide-react';
import { JournalOwner } from '../../types/journal';
import { OWNER_CONFIGS } from '../../constants/questions';

interface UserSelectionPageProps {
  onSelectOwner: (owner: JournalOwner) => void;
  onOpenBrotherMessage: () => void;
  onOpenCommon: () => void;
  onOpenCapsule: () => void;
  hasPinMap?: Record<JournalOwner, boolean>;
}

export const UserSelectionPage: React.FC<UserSelectionPageProps> = ({
  onSelectOwner,
  onOpenBrotherMessage,
  onOpenCommon,
  onOpenCapsule,
  hasPinMap = { alizhan: false, dilnaz: false },
}) => {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 md:py-12 animate-page-flip">
      {/* Hero Welcome Banner */}
      <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12 relative">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100/90 border border-amber-300/80 text-amber-900 text-xs sm:text-sm font-semibold tracking-wide shadow-xs mb-4">
          <Sparkles className="w-4 h-4 text-amber-600 animate-pulse" />
          <span>Персональный семейный журнал</span>
        </div>

        <h1 className="font-serif-book text-3xl sm:text-5xl md:text-6xl font-bold text-[#3d2b1f] tracking-tight mb-3 sm:mb-4 px-2">
          Привет! Это наше маленькое семейное пространство ❤️
        </h1>

        <p className="font-handwriting text-2xl sm:text-3xl text-[#7c5e4c] leading-relaxed max-w-2xl mx-auto px-2">
          Выбери себя, чтобы открыть свою личную страницу.
        </p>

        {/* Paper tape decorative accent */}
        <div className="w-28 h-5 bg-amber-200/50 border-x-2 border-dashed border-amber-300/60 mx-auto mt-6 rotate-[-1deg] shadow-xs" />
      </div>

      {/* Main Choice Cards: Alizhan vs Dilnaz */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-10">
        {/* Alizhan Selection Card */}
        <div
          onClick={() => onSelectOwner('alizhan')}
          className="paper-sheet rounded-2xl p-6 sm:p-8 cursor-pointer relative group transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl border-2 border-sky-300 bg-slate-50/90 flex flex-col justify-between"
        >
          <div className="absolute -top-3 left-6 sm:left-8 px-3.5 py-1 bg-sky-200 border border-sky-300 text-sky-950 text-xs font-bold rounded-xs rotate-[-2deg] shadow-xs flex items-center gap-1.5">
            <span>👦 {OWNER_CONFIGS.alizhan.cardSubtitle}</span>
            {hasPinMap.alizhan && <Lock className="w-3 h-3 text-sky-800 inline" />}
          </div>

          <div>
            <div className="flex items-start justify-between gap-4 mt-2 mb-6">
              <div className="flex items-center gap-3.5">
                <div className="w-16 h-16 rounded-2xl bg-sky-100 border-2 border-sky-300 flex items-center justify-center text-4xl shadow-xs group-hover:scale-105 transition-transform">
                  {OWNER_CONFIGS.alizhan.avatarEmoji}
                </div>
                <div>
                  <span className="text-xs font-bold tracking-wider uppercase text-sky-900 bg-sky-100 px-2.5 py-0.5 rounded-full">
                    {OWNER_CONFIGS.alizhan.cardSubtitle}
                  </span>
                  <h2 className="font-serif-book text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
                    Алижан
                  </h2>
                </div>
              </div>
              <BookOpen className="w-8 h-8 text-sky-700 group-hover:rotate-6 transition-transform shrink-0" />
            </div>

            <p className="text-sm text-slate-600 leading-relaxed mb-6 font-fun">
              Личная книга с любимыми вещами, мечтами, суперсилами, вопросами и словами от старшего брата.
            </p>
          </div>

          <div className="pt-4 border-t border-sky-200 flex items-center justify-between gap-2">
            <span className="font-serif-book text-base font-bold text-sky-900 flex items-center gap-2">
              <span>Я — Алижан</span>
              {hasPinMap.alizhan && (
                <span className="text-xs font-normal text-sky-700 bg-sky-100 px-2 py-0.5 rounded-full">
                  PIN
                </span>
              )}
            </span>
            <span className="px-4 py-2.5 rounded-xl bg-sky-700 text-white font-bold text-sm flex items-center gap-2 group-hover:bg-sky-800 transition-colors shadow-xs">
              <span>Войти в журнал</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
        </div>

        {/* Dilnaz Selection Card */}
        <div
          onClick={() => onSelectOwner('dilnaz')}
          className="paper-sheet rounded-2xl p-6 sm:p-8 cursor-pointer relative group transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl border-2 border-purple-300 bg-purple-50/60 flex flex-col justify-between"
        >
          <div className="absolute -top-3 left-6 sm:left-8 px-3.5 py-1 bg-purple-200 border border-purple-300 text-purple-950 text-xs font-bold rounded-xs rotate-[1.5deg] shadow-xs flex items-center gap-1.5">
            <span>👧 {OWNER_CONFIGS.dilnaz.cardSubtitle}</span>
            {hasPinMap.dilnaz && <Lock className="w-3 h-3 text-purple-800 inline" />}
          </div>

          <div>
            <div className="flex items-start justify-between gap-4 mt-2 mb-6">
              <div className="flex items-center gap-3.5">
                <div className="w-16 h-16 rounded-2xl bg-purple-100 border-2 border-purple-300 flex items-center justify-center text-4xl shadow-xs group-hover:scale-105 transition-transform">
                  {OWNER_CONFIGS.dilnaz.avatarEmoji}
                </div>
                <div>
                  <span className="text-xs font-bold tracking-wider uppercase text-purple-900 bg-purple-100 px-2.5 py-0.5 rounded-full">
                    {OWNER_CONFIGS.dilnaz.cardSubtitle}
                  </span>
                  <h2 className="font-serif-book text-2xl sm:text-3xl font-bold text-purple-950 mt-1">
                    Дильназ
                  </h2>
                </div>
              </div>
              <BookOpen className="w-8 h-8 text-purple-600 group-hover:rotate-6 transition-transform shrink-0" />
            </div>

            <p className="text-sm text-purple-900/80 leading-relaxed mb-6 font-fun">
              Персональная книга с историями, рисунками, любимыми моментами и личным посланием от брата.
            </p>
          </div>

          <div className="pt-4 border-t border-purple-200 flex items-center justify-between gap-2">
            <span className="font-serif-book text-base font-bold text-purple-900 flex items-center gap-2">
              <span>Я — Дильназ</span>
              {hasPinMap.dilnaz && (
                <span className="text-xs font-normal text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                  PIN
                </span>
              )}
            </span>
            <span className="px-4 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-sm flex items-center gap-2 group-hover:bg-purple-700 transition-colors shadow-xs">
              <span>Войти в журнал</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
        </div>
      </div>

      {/* Special Feature Banner: Senior Brother's Audio Message */}
      <div
        onClick={onOpenBrotherMessage}
        className="rounded-2xl p-6 sm:p-8 bg-gradient-to-r from-[#fff9f0] via-[#fdf7f0] to-[#fcf4fc] border-2 border-amber-300/90 shadow-md cursor-pointer group hover:shadow-lg transition-all duration-300 relative overflow-hidden mb-10"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/20 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 border-2 border-amber-300/80 text-amber-800 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 group-hover:rotate-[-3deg] transition-transform">
              <Mail className="w-7 h-7 text-amber-800" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-200/80 text-amber-900 text-xs font-bold uppercase tracking-wider mb-1.5">
                <Volume2 className="w-3.5 h-3.5 text-amber-700 animate-pulse" />
                <span>Особенный раздел</span>
              </div>
              <h3 className="font-serif-book text-2xl sm:text-3xl font-bold text-[#3d2b1f]">
                Послание от старшего брата
              </h3>
              <p className="font-handwriting text-xl text-[#7c5e4c] mt-0.5">
                «От брата с любовью» • Голосовое аудиопоздравление для Алижана и Дильназ
              </p>
            </div>
          </div>

          <button className="px-5 py-3 rounded-xl bg-amber-800 hover:bg-amber-900 text-amber-50 font-bold text-sm flex items-center gap-2 shadow-sm transition-transform active:scale-98 shrink-0 cursor-pointer">
            <span>Открыть письмо</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Secondary Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* What We Have In Common */}
        <div
          onClick={onOpenCommon}
          className="paper-sheet rounded-2xl p-6 cursor-pointer group transition-all duration-200 hover:border-rose-300 hover:shadow-lg border border-[#ebdcd0]"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 border border-rose-300 text-rose-700 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <Heart className="w-5 h-5 fill-rose-200 text-rose-600" />
            </div>
            <div>
              <h3 className="font-serif-book text-xl font-bold text-[#4a3528]">
                Что у нас общего?
              </h3>
              <p className="text-xs text-[#8c7365]">Интерактивное сравнение ответов</p>
            </div>
          </div>
          <p className="text-xs text-[#6e584b] leading-relaxed mb-4">
            Добровольное сравнение предпочтений, общих мечт и совпадений Алижана и Дильназ.
          </p>
          <div className="flex items-center gap-2 text-xs font-bold text-rose-700 group-hover:translate-x-1 transition-transform">
            <span>Посмотреть совпадения</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Time Capsule */}
        <div
          onClick={onOpenCapsule}
          className="paper-sheet rounded-2xl p-6 cursor-pointer group transition-all duration-200 hover:border-amber-400 hover:shadow-lg border border-[#ebdcd0]"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <Clock className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h3 className="font-serif-book text-xl font-bold text-[#4a3528]">
                Капсула времени
              </h3>
              <p className="text-xs text-[#8c7365]">Сохранение снимков по датам</p>
            </div>
          </div>
          <p className="text-xs text-[#6e584b] leading-relaxed mb-4">
            Фиксируйте текущие ответы и сравнивайте с будущими записями через время!
          </p>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-800 group-hover:translate-x-1 transition-transform">
            <span>Открыть капсулу времени</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
};
