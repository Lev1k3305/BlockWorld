import React, { useState, useEffect } from 'react';
import { JournalOwner, JournalSectionId, Answer } from '../../types/journal';
import { JOURNAL_SECTIONS, JOURNAL_QUESTIONS, OWNER_CONFIGS } from '../../constants/questions';
import { journalStorage } from '../../services/journalStorage';
import { pinService } from '../../services/pinService';
import { QuestionSectionPage } from './QuestionSectionPage';
import { PhotosSection } from './PhotosSection';
import { BookOpen, User, Heart, Sparkles, Compass, Image, LogOut, Lock, Key, Check, X, ShieldCheck } from 'lucide-react';

interface JournalBookProps {
  owner: JournalOwner;
  onExitJournal: () => void;
}

export const JournalBook: React.FC<JournalBookProps> = ({
  owner,
  onExitJournal,
}) => {
  const config = OWNER_CONFIGS[owner];

  const [activeSection, setActiveSection] = useState<JournalSectionId>('about');
  const [answersMap, setAnswersMap] = useState<Record<string, Answer>>({});
  const [isLoading, setIsLoading] = useState(true);

  // PIN settings modal state
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [hasExistingPin, setHasExistingPin] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinConfirm, setPinConfirm] = useState('');
  const [pinMessage, setPinMessage] = useState<string | null>(null);

  useEffect(() => {
    loadAnswers();
    setHasExistingPin(pinService.hasPin(owner));
  }, [owner]);

  const loadAnswers = async () => {
    setIsLoading(true);
    try {
      const answersList = await journalStorage.getAnswersByOwner(owner);
      const map: Record<string, Answer> = {};
      answersList.forEach((ans) => {
        map[ans.questionId] = ans;
      });
      setAnswersMap(map);
    } catch (err) {
      console.error('Failed to load answers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAnswer = async (questionId: string, value: string | string[]) => {
    const question = JOURNAL_QUESTIONS.find((q) => q.id === questionId);
    if (!question) return;

    const answerId = `${owner}_${questionId}`;
    const newAnswer: Answer = {
      id: answerId,
      owner,
      questionId,
      sectionId: question.sectionId,
      value,
      updatedAt: Date.now(),
    };

    try {
      await journalStorage.saveAnswer(newAnswer);
      setAnswersMap((prev) => ({
        ...prev,
        [questionId]: newAnswer,
      }));
    } catch (err) {
      console.error('Failed to save answer:', err);
    }
  };

  const handleDeleteAnswer = async (answerId: string) => {
    try {
      await journalStorage.deleteAnswer(answerId);
      const questionId = answerId.replace(`${owner}_`, '');
      setAnswersMap((prev) => {
        const updated = { ...prev };
        delete updated[questionId];
        return updated;
      });
    } catch (err) {
      console.error('Failed to delete answer:', err);
    }
  };

  // PIN Settings Modal Handlers
  const handleSavePin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinMessage(null);

    if (pinInput.length < 4) {
      setPinMessage('PIN-код должен состоять минимум из 4 символов/цифр.');
      return;
    }

    if (pinInput !== pinConfirm) {
      setPinMessage('Введённые PIN-коды не совпадают.');
      return;
    }

    await pinService.setPin(owner, pinInput);
    setHasExistingPin(true);
    setIsPinModalOpen(false);
    setPinInput('');
    setPinConfirm('');
  };

  const handleRemovePin = () => {
    pinService.removePin(owner);
    setHasExistingPin(false);
    setIsPinModalOpen(false);
    setPinInput('');
    setPinConfirm('');
  };

  // Calculate total journal progress
  const totalQuestions = JOURNAL_QUESTIONS.length;
  const filledQuestions = JOURNAL_QUESTIONS.filter((q) => {
    const ans = answersMap[q.id];
    if (!ans) return false;
    if (Array.isArray(ans.value)) return ans.value.length > 0;
    return typeof ans.value === 'string' && ans.value.trim().length > 0;
  }).length;

  const progressPercent = Math.round((filledQuestions / totalQuestions) * 100);

  const getSectionIcon = (iconName: string) => {
    switch (iconName) {
      case 'User': return <User className="w-4 h-4" />;
      case 'Heart': return <Heart className="w-4 h-4" />;
      case 'Sparkles': return <Sparkles className="w-4 h-4" />;
      case 'Compass': return <Compass className="w-4 h-4" />;
      case 'BookOpen': return <BookOpen className="w-4 h-4" />;
      case 'Image': return <Image className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 md:py-8">
      {/* Top Banner: Personal Journal Title & Actions */}
      <div
        className="rounded-2xl p-6 mb-6 shadow-sm border-2 relative flex flex-wrap items-center justify-between gap-4"
        style={{
          backgroundColor: config.cardBg,
          borderColor: config.borderAccent,
        }}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-2xl border-2 flex items-center justify-center text-4xl shadow-xs shrink-0"
            style={{ backgroundColor: config.badgeBg, borderColor: config.borderAccent }}
          >
            {config.avatarEmoji}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full"
                    style={{ backgroundColor: config.badgeBg, color: config.primaryTextColor }}>
                {config.role}
              </span>
              <span className="text-xs font-semibold text-[#8c7365]">
                Заполнено: {filledQuestions}/{totalQuestions}
              </span>
            </div>
            <h1 className="font-serif-book text-3xl sm:text-4xl font-bold mt-1"
                style={{ color: config.primaryTextColor }}>
              Личная книга {config.name}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* PIN Settings Button */}
          <button
            onClick={() => {
              setPinMessage(null);
              setPinInput('');
              setPinConfirm('');
              setIsPinModalOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-white/90 hover:bg-white text-stone-700 border border-stone-300/80 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
            title="Настройка PIN-кода для журнала"
          >
            <Lock className="w-4 h-4 text-amber-700" />
            <span>{hasExistingPin ? 'Изменить PIN' : 'Установить PIN'}</span>
          </button>

          {/* Exit Journal Button */}
          <button
            onClick={onExitJournal}
            className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-900 text-stone-100 text-xs sm:text-sm font-bold flex items-center gap-2 transition-transform active:scale-98 cursor-pointer shadow-xs"
          >
            <LogOut className="w-4 h-4" />
            <span>Выйти из журнала</span>
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-[#ebdcd0]/60 rounded-full h-2.5 mb-6 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${progressPercent}%`,
            backgroundColor: config.accentColor,
          }}
        />
      </div>

      {/* Section Tabs / Bookmarks */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 no-scrollbar border-b border-[#ebdcd0]">
        {JOURNAL_SECTIONS.map((sec) => {
          const isActive = activeSection === sec.id;
          return (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer border shadow-2xs ${
                isActive
                  ? 'scale-102 font-extrabold shadow-xs'
                  : 'bg-white/80 text-[#6e584b] border-[#ebdcd0] hover:bg-amber-50'
              }`}
              style={{
                backgroundColor: isActive ? config.badgeBg : undefined,
                borderColor: isActive ? config.borderAccent : undefined,
                color: isActive ? config.primaryTextColor : undefined,
              }}
            >
              {getSectionIcon(sec.iconName)}
              <span>{sec.title}</span>
            </button>
          );
        })}
      </div>

      {/* Active Section Content */}
      {isLoading ? (
        <div className="py-16 text-center text-[#8c7365] font-serif-book">
          Загрузка личного журнала {config.name}...
        </div>
      ) : activeSection === 'media' ? (
        <PhotosSection owner={owner} />
      ) : (
        <QuestionSectionPage
          owner={owner}
          sectionId={activeSection}
          answersMap={answersMap}
          onSaveAnswer={handleSaveAnswer}
          onDeleteAnswer={handleDeleteAnswer}
        />
      )}

      {/* Modal: Set/Change Local PIN */}
      {isPinModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-page-flip">
          <div className="bg-[#fdfbf7] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#ebdcd0] relative">
            <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-[#ebdcd0]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Key className="w-4 h-4" />
                </div>
                <h3 className="font-serif-book text-xl font-bold text-[#3d2b1f]">
                  PIN-код для журнала {config.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPinModalOpen(false)}
                className="p-1 rounded-full hover:bg-stone-200 text-stone-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#7c5e4c] mb-4 leading-relaxed">
              Установите 4-значный код для защиты входа в этот журнал на данном устройстве. Код сохраняется локально в зашифрованном виде (SHA-256).
            </p>

            <form onSubmit={handleSavePin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#5c473a] uppercase tracking-wider mb-1">
                  Новый PIN-код
                </label>
                <input
                  type="password"
                  maxLength={8}
                  required
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="Введите PIN (например: 1234)"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#ebdcd0] bg-white text-sm text-[#3d2b1f] focus:outline-none tracking-widest font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5c473a] uppercase tracking-wider mb-1">
                  Повторите PIN-код
                </label>
                <input
                  type="password"
                  maxLength={8}
                  required
                  value={pinConfirm}
                  onChange={(e) => setPinConfirm(e.target.value)}
                  placeholder="Повторите PIN..."
                  className="w-full px-3.5 py-2 rounded-xl border border-[#ebdcd0] bg-white text-sm text-[#3d2b1f] focus:outline-none tracking-widest font-mono"
                />
              </div>

              {pinMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
                  {pinMessage}
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-[#ebdcd0]">
                {hasExistingPin ? (
                  <button
                    type="button"
                    onClick={handleRemovePin}
                    className="text-xs font-bold text-rose-600 hover:text-rose-800 underline cursor-pointer"
                  >
                    Снять защиту
                  </button>
                ) : <div />}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPinModalOpen(false)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#8c7365] hover:bg-stone-100 cursor-pointer"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-amber-800 text-white font-bold text-xs shadow-xs hover:bg-amber-900 cursor-pointer"
                  >
                    Сохранить PIN
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
