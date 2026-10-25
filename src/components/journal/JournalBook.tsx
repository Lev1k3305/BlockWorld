import React, { useState, useEffect } from 'react';
import { JournalOwner, JournalSectionId, Answer } from '../../types/journal';
import { JOURNAL_SECTIONS, JOURNAL_QUESTIONS, OWNER_CONFIGS } from '../../constants/questions';
import { journalStorage } from '../../services/journalStorage';
import { QuestionSectionPage } from './QuestionSectionPage';
import { PhotosSection } from './PhotosSection';
import { BookOpen, User, Heart, Sparkles, Compass, Image, ArrowRight, ArrowLeft } from 'lucide-react';

interface JournalBookProps {
  owner: JournalOwner;
  onSwitchOwner: (nextOwner: JournalOwner) => void;
  onNavigateHome: () => void;
}

export const JournalBook: React.FC<JournalBookProps> = ({
  owner,
  onSwitchOwner,
  onNavigateHome,
}) => {
  const config = OWNER_CONFIGS[owner];
  const otherOwner: JournalOwner = owner === 'alizhan' ? 'dilnaz' : 'alizhan';
  const otherConfig = OWNER_CONFIGS[otherOwner];

  const [activeSection, setActiveSection] = useState<JournalSectionId>('about');
  const [answersMap, setAnswersMap] = useState<Record<string, Answer>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnswers();
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
      {/* Top Banner: Journal Title & Switch Sister Toggle */}
      <div
        className="rounded-2xl p-6 mb-6 shadow-sm border-2 relative flex flex-wrap items-center justify-between gap-4"
        style={{
          backgroundColor: config.cardBg,
          borderColor: config.borderAccent,
        }}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-2xl border-2 flex items-center justify-center text-4xl shadow-xs"
            style={{ backgroundColor: config.badgeBg, borderColor: config.borderAccent }}
          >
            {config.avatarEmoji}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full"
                    style={{ backgroundColor: config.badgeBg, color: config.primaryTextColor }}>
                {config.role}
              </span>
              <span className="text-xs font-semibold text-[#8c7365]">
                Прогресс: {filledQuestions}/{totalQuestions}
              </span>
            </div>
            <h1 className="font-serif-book text-3xl sm:text-4xl font-bold mt-1"
                style={{ color: config.primaryTextColor }}>
              Интерактивный журнал {config.name}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Switch to sister's journal button */}
          <button
            onClick={() => onSwitchOwner(otherOwner)}
            className="px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-bold flex items-center gap-2 transition-transform hover:scale-102 active:scale-98 cursor-pointer shadow-2xs"
            style={{
              backgroundColor: otherConfig.cardBg,
              borderColor: otherConfig.borderAccent,
              color: otherConfig.primaryTextColor,
            }}
          >
            <span>{otherConfig.avatarEmoji}</span>
            <span>Открыть журнал {otherConfig.name}</span>
            <ArrowRight className="w-4 h-4" />
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
    </div>
  );
};
