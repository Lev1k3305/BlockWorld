import React from 'react';
import { JournalOwner, JournalSectionId, Answer } from '../../types/journal';
import { JOURNAL_QUESTIONS, JOURNAL_SECTIONS, OWNER_CONFIGS } from '../../constants/questions';
import { QuestionCard } from './QuestionCard';
import { Sparkles, CheckCircle2 } from 'lucide-react';

interface QuestionSectionPageProps {
  owner: JournalOwner;
  sectionId: JournalSectionId;
  answersMap: Record<string, Answer>;
  onSaveAnswer: (questionId: string, value: string | string[]) => void;
  onDeleteAnswer: (answerId: string) => void;
}

export const QuestionSectionPage: React.FC<QuestionSectionPageProps> = ({
  owner,
  sectionId,
  answersMap,
  onSaveAnswer,
  onDeleteAnswer,
}) => {
  const config = OWNER_CONFIGS[owner];
  const sectionInfo = JOURNAL_SECTIONS.find((s) => s.id === sectionId);
  const questions = JOURNAL_QUESTIONS.filter((q) => q.sectionId === sectionId);

  const answeredCount = questions.filter((q) => {
    const ans = answersMap[q.id];
    if (!ans) return false;
    if (Array.isArray(ans.value)) return ans.value.length > 0;
    return typeof ans.value === 'string' && ans.value.trim().length > 0;
  }).length;

  return (
    <div className="space-y-6 animate-page-flip">
      {/* Section Header Banner */}
      <div className="p-6 rounded-2xl bg-[#fdfbf7] border border-[#ebdcd0] shadow-2xs relative">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2"
                 style={{ backgroundColor: config.badgeBg, color: config.primaryTextColor }}>
              <Sparkles className="w-3.5 h-3.5" />
              <span>{config.name} • {sectionInfo?.title}</span>
            </div>
            <h2 className="font-serif-book text-3xl sm:text-4xl font-bold text-[#3d2b1f]">
              {sectionInfo?.title}
            </h2>
            <p className="font-handwriting text-xl text-[#7c5e4c] mt-1">
              {sectionInfo?.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
            <CheckCircle2 className="w-5 h-5 text-amber-600" />
            <div className="text-right">
              <div className="text-xs font-semibold text-[#8c7365]">Заполнено</div>
              <div className="text-sm font-bold">
                {answeredCount} из {questions.length} вопросов
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-6">
        {questions.map((question) => (
          <QuestionCard
            key={question.id}
            question={question}
            owner={owner}
            currentAnswer={answersMap[question.id]}
            onSaveAnswer={onSaveAnswer}
            onDeleteAnswer={onDeleteAnswer}
          />
        ))}
      </div>
    </div>
  );
};
