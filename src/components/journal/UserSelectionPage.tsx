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
      <div className="text-center max-w-3xl mx-auto mb-12 relative">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100/90 border border-amber-300/80 text-amber-900 text-xs sm:text-sm font-semibold tracking-wide shadow-xs mb-4">
          <Sparkles className="w-4 h-4 text-amber-600 animate-pulse" />
          <span>Персональный семейный журнал</span>
        </div>

        <h1 className="font-serif-book text-4xl sm:text-5xl md:text-6xl font-bold text-[#3d2b1f] tracking-tight mb-4">
          Два характера
        </h1>

        <p className="font-handwriting text-2xl sm:text-3xl text-[#7c5e4c] leading-relaxed max-w-2xl mx-auto">
          «Две истории. Две мечты. Выберите свой личный журнал.»
        </p>

        <p className="mt-3 text-sm text-[#8c7365] max-w-xl mx-auto leading-normal">
          Уютное пространство для сестёр Алижан и Дильназ. Войдите в свою персональную книгу или откройте семейные разделы.
        </p>

        {/* Paper tape decorative accent */}
        <div className="w-28 h-5 bg-amber-200/50 border-x-2 border-dashed border-amber-300/60 mx-auto mt-6 rotate-[-1deg] shadow-xs" />
      </div>

      {/* Main Choice Cards: "Я Алижан" vs "Я Дильназ" */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        {/* Alizhan Selection Card */}
        <div
          onClick={() => onSelectOwner('alizhan')}
          className="paper-sheet-alizhan rounded-2xl p-6 sm:p-8 cursor-pointer relative group transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl border-2 border-[#f2beaf] flex flex-col justify-between"
        >
          {/* Top Paper Tape */}
          <div className="absolute -top-3 left-8 px-4 py-1 bg-rose-200/90 border border-rose-300/80 text-rose-900 text-xs font-bold rounded-xs rotate-[-2deg] shadow-xs flex items-center gap-1.5">
            <span>🌸 Книга Алижан</span>
            {hasPinMap.alizhan && <Lock className="w-3 h-3 text-rose-800 inline" />}
          </div>

          <div>
            <div className="flex items-start justify-between gap-4 mt-2 mb-6">
              <div className="flex items-center gap-3.5">
                <div className="w-16 h-16 rounded-2xl bg-[#fcece6] border-2 border-[#f2beaf] flex items-center justify-center text-4xl shadow-xs group-hover:scale-105 transition-transform">
                  {OWNER_CONFIGS.alizhan.avatarEmoji}
                </div>
                <div>
                  <span className="text-xs font-bold tracking-wider uppercase text-[#c05638] bg-[#fcece6] px-2.5 py-0.5 rounded-full">
                    {OWNER_CONFIGS.alizhan.role}
                  </span>
                  <h2 className="font-serif-book text-2xl sm:text-3xl font-bold text-[#5c2c20] mt-1">
                    Алижан
                  </h2>
                </div>
              </div>
              <BookOpen className="w-8 h-8 text-[#e07a5f] group-hover:rotate-6 transition-transform" />
            </div>

            <p className="text-sm text-[#7c4d40] leading-relaxed mb-6 font-fun">
              Персональная книга с любимыми вещами, мечтами, рисунками и воспоминаниями Алижан.
            </p>
          </div>

          <div className="pt-4 border-t border-[#f2beaf]/60 flex items-center justify-between">
            <span className="font-serif-book text-base font-bold text-[#c05638] flex items-center gap-2">
              <span>Я Алижан</span>
              {hasPinMap.alizhan && (
                <span className="text-xs font-normal text-rose-600 bg-rose-100 px-2 py-0.5 rounded-full">
                  PIN-защита
                </span>
              )}
            </span>
            <span className="px-4 py-2 rounded-xl bg-[#e07a5f] text-white font-bold text-sm flex items-center gap-2 group-hover:bg-[#c05638] transition-colors shadow-xs">
              <span>Войти в журнал</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
        </div>

        {/* Dilnaz Selection Card */}
        <div
          onClick={() => onSelectOwner('dilnaz')}
          className="paper-sheet-dilnaz rounded-2xl p-6 sm:p-8 cursor-pointer relative group transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl border-2 border-[#c9bbf2] flex flex-col justify-between"
        >
          {/* Top Paper Tape */}
          <div className="absolute -top-3 left-8 px-4 py-1 bg-purple-200/90 border border-purple-300/80 text-purple-900 text-xs font-bold rounded-xs rotate-[1.5deg] shadow-xs flex items-center gap-1.5">
            <span>🪻 Книга Дильназ</span>
            {hasPinMap.dilnaz && <Lock className="w-3 h-3 text-purple-800 inline" />}
          </div>

          <div>
            <div className="flex items-start justify-between gap-4 mt-2 mb-6">
              <div className="flex items-center gap-3.5">
                <div className="w-16 h-16 rounded-2xl bg-[#f0ecfd] border-2 border-[#c9bbf2] flex items-center justify-center text-4xl shadow-xs group-hover:scale-105 transition-transform">
                  {OWNER_CONFIGS.dilnaz.avatarEmoji}
                </div>
                <div>
                  <span className="text-xs font-bold tracking-wider uppercase text-[#6b4ebd] bg-[#f0ecfd] px-2.5 py-0.5 rounded-full">
                    {OWNER_CONFIGS.dilnaz.role}
                  </span>
                  <h2 className="font-serif-book text-2xl sm:text-3xl font-bold text-[#372763] mt-1">
                    Дильназ
                  </h2>
                </div>
              </div>
              <BookOpen className="w-8 h-8 text-[#8d72e1] group-hover:rotate-6 transition-transform" />
            </div>

            <p className="text-sm text-[#523d85] leading-relaxed mb-6 font-fun">
              Персональная книга с секретами, суперсилами, забавными моментами и рисунками Дильназ.
            </p>
          </div>

          <div className="pt-4 border-t border-[#c9bbf2]/60 flex items-center justify-between">
            <span className="font-serif-book text-base font-bold text-[#6b4ebd] flex items-center gap-2">
              <span>Я Дильназ</span>
              {hasPinMap.dilnaz && (
                <span className="text-xs font-normal text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">
                  PIN-защита
                </span>
              )}
            </span>
            <span className="px-4 py-2 rounded-xl bg-[#8d72e1] text-white font-bold text-sm flex items-center gap-2 group-hover:bg-[#6b4ebd] transition-colors shadow-xs">
              <span>Войти в журнал</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
        </div>
      </div>

      {/* Special Feature Banner: Brother's Audio Message */}
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
                <span>Особенный подарок</span>
              </div>
              <h3 className="font-serif-book text-2xl sm:text-3xl font-bold text-[#3d2b1f]">
                Послание от старшего брата
              </h3>
              <p className="font-handwriting text-xl text-[#7c5e4c] mt-0.5">
                «От брата с любовью» • Личное голосовое поздравление для Алижан и Дильназ
              </p>
            </div>
          </div>

          <button className="px-5 py-3 rounded-xl bg-amber-800 hover:bg-amber-900 text-amber-50 font-bold text-sm flex items-center gap-2 shadow-sm transition-transform active:scale-98 shrink-0 cursor-pointer">
            <span>Открыть письмо</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Secondary Family Sections Grid */}
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
            Посмотрите, где совпали любимые цвета, песни и мечты Алижан и Дильназ!
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
              <p className="text-xs text-[#8c7365]">Сохранение снимков ответов по датам</p>
            </div>
          </div>
          <p className="text-xs text-[#6e584b] leading-relaxed mb-4">
            Возвращайтесь к сохранённым датам, чтобы увидеть, как меняются мысли сестёр.
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
