import React from 'react';
import { JournalOwner, JournalSectionId, Answer } from '../../types/journal';
import { JOURNAL_QUESTIONS, JOURNAL_SECTIONS, OWNER_CONFIGS } from '../../constants/questions';
import { QuestionCard } from './QuestionCard';
import { Sparkles, CheckCircle2, MessageSquare } from 'lucide-react';

interface QuestionSectionPageProps {
  owner: JournalOwner;
  sectionId: JournalSectionId;
  answersMap: Record<string, Answer>;
  onSaveAnswer: (
    questionId: string,
    value: string | string[],
    attachments?: { photoUrl?: string; drawingUrl?: string; voiceUrl?: string },
    isShared?: boolean
  ) => void;
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
    const hasVal = Array.isArray(ans.value)
      ? ans.value.length > 0
      : typeof ans.value === 'string' && ans.value.trim().length > 0;
    const hasAtt = Boolean(
      ans.attachments?.photoUrl || ans.attachments?.drawingUrl || ans.attachments?.voiceUrl
    );
    return hasVal || hasAtt;
  }).length;

  return (
    <div className="space-y-6 animate-page-flip">
      {/* Section Header Banner */}
      <div className="p-6 rounded-2xl bg-white border border-[#cbd5e1] shadow-2xs relative">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2"
              style={{ backgroundColor: config.badgeBg, color: config.primaryTextColor }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {config.name} • {sectionInfo?.title}
              </span>
            </div>
            <h2 className="font-serif-book text-3xl sm:text-4xl font-bold text-[#1e293b]">
              {sectionInfo?.title}
            </h2>
            <p className="font-handwriting text-xl text-[#64748b] mt-1">
              {sectionInfo?.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
            <CheckCircle2 className="w-5 h-5 text-amber-600" />
            <div className="text-right">
              <div className="text-xs font-semibold text-slate-500">Заполнено</div>
              <div className="text-sm font-bold">
                {answeredCount} из {questions.length} вопросов
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Future Questions Banner for Chapter 7 */}
        {sectionId === 'chapter7' && (
          <div className="mt-4 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
            <MessageSquare className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block mb-0.5">Особенная глава: Вопросы от старшего брата</span>
              <span>
                Отвечай с душой! Старший брат сможет читать твои ответы и добавлять сюда новые интересные вопросы в будущем.
              </span>
            </div>
          </div>
        )}
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
