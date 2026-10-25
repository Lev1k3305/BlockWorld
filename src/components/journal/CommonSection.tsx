import React, { useState, useEffect } from 'react';
import { Heart, Sparkles, CheckCircle, ArrowRight, Lightbulb, Users, Info } from 'lucide-react';
import { Answer, Question } from '../../types/journal';
import { JOURNAL_QUESTIONS, JOURNAL_SECTIONS, OWNER_CONFIGS } from '../../constants/questions';
import { journalStorage } from '../../services/journalStorage';

export const CommonSection: React.FC = () => {
  const [alizhanAnswers, setAlizhanAnswers] = useState<Record<string, Answer>>({});
  const [dilnazAnswers, setDilnazAnswers] = useState<Record<string, Answer>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAllAnswers();
  }, []);

  const loadAllAnswers = async () => {
    setIsLoading(true);
    try {
      const all = await journalStorage.getAllAnswers();
      const alizhanMap: Record<string, Answer> = {};
      const dilnazMap: Record<string, Answer> = {};

      all.forEach((ans) => {
        if (ans.owner === 'alizhan') {
          alizhanMap[ans.questionId] = ans;
        } else if (ans.owner === 'dilnaz') {
          dilnazMap[ans.questionId] = ans;
        }
      });

      setAlizhanAnswers(alizhanMap);
      setDilnazAnswers(dilnazMap);
    } catch (err) {
      console.error('Failed to load comparison answers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper for Russian plural declensions
  const declension = (n: number, singular: string, few: string, many: string) => {
    const abs = Math.abs(n) % 100;
    const n1 = abs % 10;
    if (abs > 10 && abs < 20) return many;
    if (n1 > 1 && n1 < 5) return few;
    if (n1 === 1) return singular;
    return many;
  };

  // Helper to normalize and check if two values match
  const checkValuesMatch = (v1: string | string[], v2: string | string[]): { isMatch: boolean; commonItems: string[] } => {
    const list1 = Array.isArray(v1) ? v1 : [v1];
    const list2 = Array.isArray(v2) ? v2 : [v2];

    const norm1 = list1.map((s) => s.trim().toLowerCase());
    const norm2 = list2.map((s) => s.trim().toLowerCase());

    const commonItems: string[] = [];
    list1.forEach((item, idx) => {
      const norm = norm1[idx];
      if (norm2.includes(norm) && !commonItems.includes(item)) {
        commonItems.push(item);
      }
    });

    const isMatch = commonItems.length > 0;
    return { isMatch, commonItems };
  };

  // Compute matched vs answered questions
  const bothAnsweredQuestions: {
    question: Question;
    alizhanAns: Answer;
    dilnazAns: Answer;
    isMatch: boolean;
    commonItems: string[];
  }[] = [];

  const singleAnsweredQuestions: {
    question: Question;
    answeredBy: 'alizhan' | 'dilnaz';
    ans: Answer;
  }[] = [];

  JOURNAL_QUESTIONS.forEach((q) => {
    const a1 = alizhanAnswers[q.id];
    const a2 = dilnazAnswers[q.id];

    const has1 = a1 && ((Array.isArray(a1.value) && a1.value.length > 0) || (typeof a1.value === 'string' && a1.value.trim().length > 0));
    const has2 = a2 && ((Array.isArray(a2.value) && a2.value.length > 0) || (typeof a2.value === 'string' && a2.value.trim().length > 0));

    if (has1 && has2) {
      const { isMatch, commonItems } = checkValuesMatch(a1.value, a2.value);
      bothAnsweredQuestions.push({
        question: q,
        alizhanAns: a1,
        dilnazAns: a2,
        isMatch,
        commonItems,
      });
    } else if (has1) {
      singleAnsweredQuestions.push({
        question: q,
        answeredBy: 'alizhan',
        ans: a1,
      });
    } else if (has2) {
      singleAnsweredQuestions.push({
        question: q,
        answeredBy: 'dilnaz',
        ans: a2,
      });
    }
  });

  const totalMatchesCount = bothAnsweredQuestions.filter((item) => item.isMatch).length;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-page-flip">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#fef5f0] via-[#fdfbf7] to-[#f5f2fe] border-2 border-rose-200/80 shadow-xs text-center mb-8 relative overflow-hidden">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-100 border border-rose-300 text-rose-800 text-xs font-bold uppercase tracking-wider mb-3">
          <Heart className="w-4 h-4 fill-rose-300 text-rose-600" />
          <span>Сравнение ответов сестёр</span>
        </div>

        <h1 className="font-serif-book text-3xl sm:text-5xl font-bold text-[#3d2b1f] mb-2">
          Что у нас общего?
        </h1>

        <p className="font-handwriting text-2xl text-[#7c5e4c] max-w-xl mx-auto">
          «Две разных души, связанные миллионом нежных нитей»
        </p>

        {/* Real Answers Match Highlight Badge */}
        {!isLoading && (
          <div className="mt-6 inline-flex flex-col sm:flex-row items-center gap-3 p-4 rounded-xl bg-white/90 border border-rose-200 shadow-2xs">
            <div className="w-10 h-10 rounded-full bg-rose-100 border border-rose-300 flex items-center justify-center text-rose-600 text-xl font-bold">
              ✨
            </div>
            <div className="text-left">
              <div className="text-sm font-bold text-[#3d2b1f]">
                {bothAnsweredQuestions.length === 0
                  ? 'Сестры пока ещё заполняют свои журналы'
                  : totalMatchesCount > 0
                  ? `У Алижан и Дильназ совпали ${totalMatchesCount} ${declension(totalMatchesCount, 'ответ', 'ответа', 'ответов')}!`
                  : `Обе девочки ответили на ${bothAnsweredQuestions.length} ${declension(bothAnsweredQuestions.length, 'вопрос', 'вопроса', 'вопросов')}!`}
              </div>
              <p className="text-xs text-[#8c7365]">
                {bothAnsweredQuestions.length > 0
                  ? `Сравнение составлено на основе ${bothAnsweredQuestions.length} ${declension(bothAnsweredQuestions.length, 'вопроса', 'вопросов', 'вопросов')}, заполненных обеими сестрами.`
                  : 'Заполните личные журналы, чтобы увидеть забавные совпадения!'}
              </p>
            </div>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-[#8c7365] font-serif-book">
          Сравнение журналов Алижан и Дильназ...
        </div>
      ) : bothAnsweredQuestions.length === 0 && singleAnsweredQuestions.length === 0 ? (
        /* Empty State */
        <div className="p-10 rounded-2xl bg-[#fdfbf7] border-2 border-dashed border-[#ebdcd0] text-center max-w-md mx-auto">
          <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto mb-3">
            <Users className="w-7 h-7" />
          </div>
          <h3 className="font-serif-book text-2xl font-bold text-[#3d2b1f] mb-2">
            Ответы пока не заполнены
          </h3>
          <p className="font-handwriting text-lg text-[#7c5e4c] mb-4">
            Откройте личную книгу Алижан или Дильназ и ответьте на первые вопросы!
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Section: Matches */}
          {bothAnsweredQuestions.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-amber-600" />
                <h2 className="font-serif-book text-2xl font-bold text-[#3d2b1f]">
                  Общие ответы сестёр ({bothAnsweredQuestions.length})
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bothAnsweredQuestions.map(({ question, alizhanAns, dilnazAns, isMatch, commonItems }) => (
                  <div
                    key={question.id}
                    className={`rounded-2xl p-5 border transition-all ${
                      isMatch
                        ? 'bg-gradient-to-br from-[#fffaf7] to-[#fdf8f5] border-rose-300 shadow-xs'
                        : 'bg-white border-[#ebdcd0]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-xs font-bold text-[#8c7365] bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                        {JOURNAL_SECTIONS.find((s) => s.id === question.sectionId)?.title}
                      </span>
                      {isMatch && (
                        <span className="text-xs font-bold text-rose-800 bg-rose-100 px-2.5 py-0.5 rounded-full border border-rose-200 flex items-center gap-1">
                          <Heart className="w-3 h-3 fill-rose-500 text-rose-600" />
                          <span>Совпадение!</span>
                        </span>
                      )}
                    </div>

                    <h3 className="font-serif-book text-xl font-bold text-[#3d2b1f] mb-3">
                      {question.title}
                    </h3>

                    {/* Dual Cards */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {/* Alizhan Answer Box */}
                      <div className="p-3 rounded-xl bg-[#fcece6]/70 border border-[#f2beaf]">
                        <div className="font-bold text-[#c05638] mb-1 flex items-center gap-1">
                          <span>🌸</span>
                          <span>Алижан:</span>
                        </div>
                        <p className="font-handwriting text-lg text-[#5c2c20]">
                          {Array.isArray(alizhanAns.value) ? alizhanAns.value.join(', ') : alizhanAns.value}
                        </p>
                      </div>

                      {/* Dilnaz Answer Box */}
                      <div className="p-3 rounded-xl bg-[#f0ecfd]/70 border border-[#c9bbf2]">
                        <div className="font-bold text-[#6b4ebd] mb-1 flex items-center gap-1">
                          <span>🪻</span>
                          <span>Дильназ:</span>
                        </div>
                        <p className="font-handwriting text-lg text-[#372763]">
                          {Array.isArray(dilnazAns.value) ? dilnazAns.value.join(', ') : dilnazAns.value}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: Single Answered Questions (Waiting for Sister) */}
          {singleAnsweredQuestions.length > 0 && (
            <div className="pt-6 border-t border-[#ebdcd0]">
              <div className="flex items-center gap-2 mb-4">
                <Info className="w-5 h-5 text-amber-700" />
                <h2 className="font-serif-book text-2xl font-bold text-[#3d2b1f]">
                  Ответила только одна из сестёр ({singleAnsweredQuestions.length})
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {singleAnsweredQuestions.map(({ question, answeredBy, ans }) => {
                  const ownerConf = OWNER_CONFIGS[answeredBy];
                  const otherSister = answeredBy === 'alizhan' ? 'Дильназ' : 'Алижан';

                  return (
                    <div
                      key={question.id}
                      className="rounded-2xl p-4 bg-[#fdfbf7] border border-[#ebdcd0] flex items-center justify-between gap-4"
                    >
                      <div>
                        <span className="text-[11px] font-semibold text-[#8c7365]">
                          {JOURNAL_SECTIONS.find((s) => s.id === question.sectionId)?.title}
                        </span>
                        <h4 className="font-serif-book text-lg font-bold text-[#3d2b1f]">
                          {question.title}
                        </h4>
                        <p className="font-handwriting text-lg text-[#5c473a] mt-0.5">
                          {ownerConf.name}: «{Array.isArray(ans.value) ? ans.value.join(', ') : ans.value}»
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-medium text-[#8c7365] bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 block">
                          Ждём ответа {otherSister}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
