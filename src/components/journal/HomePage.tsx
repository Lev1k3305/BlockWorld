import React from 'react';
import { BookOpen, Heart, Clock, Sparkles, ArrowRight, Star, Compass } from 'lucide-react';
import { JournalOwner } from '../../types/journal';
import { OWNER_CONFIGS } from '../../constants/questions';

interface HomePageProps {
  onOpenOwnerBook: (owner: JournalOwner) => void;
  onOpenCommon: () => void;
  onOpenCapsule: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onOpenOwnerBook,
  onOpenCommon,
  onOpenCapsule,
}) => {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 md:py-12 animate-page-flip">
      {/* Hero Welcome Banner */}
      <div className="text-center max-w-3xl mx-auto mb-12 relative">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100/80 border border-amber-300/70 text-amber-900 text-xs sm:text-sm font-semibold tracking-wide shadow-xs mb-4">
          <Sparkles className="w-4 h-4 text-amber-600 animate-pulse" />
          <span>Персональный интерактивный журнал</span>
        </div>

        <h1 className="font-serif-book text-4xl sm:text-5xl md:text-6xl font-bold text-[#3d2b1f] tracking-tight mb-4">
          Два характера
        </h1>

        <p className="font-handwriting text-2xl sm:text-3xl text-[#7c5e4c] leading-relaxed max-w-2xl mx-auto">
          «Две истории. Две мечты. Тысячи маленьких воспоминаний.»
        </p>

        <p className="mt-3 text-sm text-[#8c7365] max-w-xl mx-auto leading-normal">
          Уютное место, где Алижан и Дильназ ведут свои личные журналы, отвечают на вопросы, записывают мечты и создают семейную капсулу времени.
        </p>

        {/* Paper tape decorative accent */}
        <div className="w-24 h-5 bg-amber-200/50 border-x-2 border-dashed border-amber-300/60 mx-auto mt-6 rotate-[-1deg] shadow-xs" />
      </div>

      {/* Main Grid: 2 Personal Books + 2 Interactive Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Alizhan's Book Card */}
        <div
          onClick={() => onOpenOwnerBook('alizhan')}
          className="paper-sheet-alizhan rounded-2xl p-6 sm:p-8 cursor-pointer relative group transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl border-2 border-[#f2beaf]"
        >
          {/* Paper tape element */}
          <div className="absolute -top-3 left-8 px-4 py-1 bg-rose-200/80 border border-rose-300/80 text-rose-900 text-xs font-bold rounded-xs rotate-[-2deg] shadow-xs">
            🌸 Журнал Алижан
          </div>

          <div className="flex items-start justify-between gap-4 mt-2 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-[#fcece6] border-2 border-[#f2beaf] flex items-center justify-center text-3xl shadow-xs group-hover:scale-105 transition-transform">
                {OWNER_CONFIGS.alizhan.avatarEmoji}
              </div>
              <div>
                <span className="text-xs font-bold tracking-wider uppercase text-[#c05638] bg-[#fcece6] px-2.5 py-0.5 rounded-full">
                  {OWNER_CONFIGS.alizhan.role}
                </span>
                <h2 className="font-serif-book text-2xl sm:text-3xl font-bold text-[#5c2c20] mt-1">
                  Личная книга Алижан
                </h2>
              </div>
            </div>
            <BookOpen className="w-7 h-7 text-[#e07a5f] group-hover:rotate-6 transition-transform" />
          </div>

          <p className="text-sm text-[#7c4d40] leading-relaxed mb-6 font-fun">
            Ответы на вопросы, любимые вещи, вдохновляющие мечты и творчество Алижан.
          </p>

          <div className="flex items-center justify-between pt-4 border-t border-[#f2beaf]/50">
            <span className="font-handwriting text-lg text-[#a34a31]">
              Открыть журнал...
            </span>
            <span className="w-9 h-9 rounded-full bg-[#e07a5f] text-white flex items-center justify-center group-hover:translate-x-1 transition-transform shadow-xs">
              <ArrowRight className="w-5 h-5" />
            </span>
          </div>
        </div>

        {/* Dilnaz's Book Card */}
        <div
          onClick={() => onOpenOwnerBook('dilnaz')}
          className="paper-sheet-dilnaz rounded-2xl p-6 sm:p-8 cursor-pointer relative group transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl border-2 border-[#c9bbf2]"
        >
          {/* Paper tape element */}
          <div className="absolute -top-3 left-8 px-4 py-1 bg-purple-200/80 border border-purple-300/80 text-purple-900 text-xs font-bold rounded-xs rotate-[1.5deg] shadow-xs">
            🪻 Журнал Дильназ
          </div>

          <div className="flex items-start justify-between gap-4 mt-2 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-[#f0ecfd] border-2 border-[#c9bbf2] flex items-center justify-center text-3xl shadow-xs group-hover:scale-105 transition-transform">
                {OWNER_CONFIGS.dilnaz.avatarEmoji}
              </div>
              <div>
                <span className="text-xs font-bold tracking-wider uppercase text-[#6b4ebd] bg-[#f0ecfd] px-2.5 py-0.5 rounded-full">
                  {OWNER_CONFIGS.dilnaz.role}
                </span>
                <h2 className="font-serif-book text-2xl sm:text-3xl font-bold text-[#372763] mt-1">
                  Личная книга Дильназ
                </h2>
              </div>
            </div>
            <BookOpen className="w-7 h-7 text-[#8d72e1] group-hover:rotate-6 transition-transform" />
          </div>

          <p className="text-sm text-[#523d85] leading-relaxed mb-6 font-fun">
            Секреты, суперсилы, рисунки, забавные факты и добрые воспоминания Дильназ.
          </p>

          <div className="flex items-center justify-between pt-4 border-t border-[#c9bbf2]/50">
            <span className="font-handwriting text-lg text-[#5d3f9e]">
              Открыть журнал...
            </span>
            <span className="w-9 h-9 rounded-full bg-[#8d72e1] text-white flex items-center justify-center group-hover:translate-x-1 transition-transform shadow-xs">
              <ArrowRight className="w-5 h-5" />
            </span>
          </div>
        </div>
      </div>

      {/* Secondary Sections Grid: What We Have In Common & Time Capsule */}
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
            Узнайте, где совпали любимые цвета, песни и мечты Алижан и Дильназ, а в чём они по-своему уникальны!
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
            Создайте запись «Мои ответы сегодня» и возвращайтесь к ней через месяцы и годы, чтобы увидеть, как меняются мысли.
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
