import React, { useState, useEffect } from 'react';
import { Heart, Sparkles, CheckCircle, ArrowRight, Lightbulb, Users, Info, Lock } from 'lucide-react';
import { Answer, Question } from '../../types/journal';
import { JOURNAL_QUESTIONS, JOURNAL_SECTIONS, OWNER_CONFIGS, getQuestionTitle } from '../../constants/questions';
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
        // Only include answers that are marked as shared (or undefined default true)
        if (ans.isShared !== false) {
          if (ans.owner === 'alizhan') {
            alizhanMap[ans.questionId] = ans;
          } else if (ans.owner === 'dilnaz') {
            dilnazMap[ans.questionId] = ans;
          }
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

  const declension = (n: number, singular: string, few: string, many: string) => {
    const abs = Math.abs(n) % 100;
    const n1 = abs % 10;
    if (abs > 10 && abs < 20) return many;
    if (n1 > 1 && n1 < 5) return few;
    if (n1 === 1) return singular;
    return many;
  };

  const checkValuesMatch = (
    v1: string | string[],
    v2: string | string[]
  ): { isMatch: boolean; commonItems: string[] } => {
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

    const has1 =
      a1 &&
      ((Array.isArray(a1.value) && a1.value.length > 0) ||
        (typeof a1.value === 'string' && a1.value.trim().length > 0) ||
        Boolean(a1.attachments?.photoUrl || a1.attachments?.drawingUrl || a1.attachments?.voiceUrl));

    const has2 =
      a2 &&
      ((Array.isArray(a2.value) && a2.value.length > 0) ||
        (typeof a2.value === 'string' && a2.value.trim().length > 0) ||
        Boolean(a2.attachments?.photoUrl || a2.attachments?.drawingUrl || a2.attachments?.voiceUrl));

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
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-sky-50 via-slate-50 to-purple-50 border-2 border-slate-200 shadow-xs text-center mb-8 relative overflow-hidden">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-100 border border-rose-300 text-rose-800 text-xs font-bold uppercase tracking-wider mb-3">
          <Heart className="w-4 h-4 fill-rose-300 text-rose-600" />
          <span>Добровольное сравнение ответов</span>
        </div>

        <h1 className="font-serif-book text-3xl sm:text-5xl font-bold text-[#1e293b] mb-2">
          Что у нас общего?
        </h1>

        <p className="font-handwriting text-2xl text-[#64748b] max-w-xl mx-auto">
          «Две истории. Две мечты. Общие точки соприкосновения Алижана и Дильназ»
        </p>

        {!isLoading && (
          <div className="mt-6 inline-flex flex-col sm:flex-row items-center gap-3 p-4 rounded-xl bg-white/90 border border-slate-200 shadow-2xs">
            <div className="w-10 h-10 rounded-full bg-rose-100 border border-rose-300 flex items-center justify-center text-rose-600 text-xl font-bold">
              ✨
            </div>
            <div className="text-left">
              <div className="text-sm font-bold text-[#1e293b]">
                {bothAnsweredQuestions.length === 0
                  ? 'Алижан и Дильназ пока ещё заполняют свои журналы'
                  : totalMatchesCount > 0
                  ? `У Алижана и Дильназ совпали ${totalMatchesCount} ${declension(totalMatchesCount, 'ответ', 'ответа', 'ответов')}!`
                  : `Оба ответили на ${bothAnsweredQuestions.length} ${declension(bothAnsweredQuestions.length, 'вопрос', 'вопроса', 'вопросов')}!`}
              </div>
              <p className="text-xs text-[#64748b]">
                {bothAnsweredQuestions.length > 0
                  ? `Сравнение составлено на основе ${bothAnsweredQuestions.length} ${declension(bothAnsweredQuestions.length, 'вопроса', 'вопросов', 'вопросов')}, открытых для общего просмотра.`
                  : 'Заполните личные журналы и поделитесь ответами, чтобы увидеть совпадения!'}
              </p>
            </div>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-slate-500 font-serif-book">
          Сравнение журналов Алижана и Дильназ...
        </div>
      ) : bothAnsweredQuestions.length === 0 && singleAnsweredQuestions.length === 0 ? (
        /* Empty State */
        <div className="p-10 rounded-2xl bg-white border-2 border-dashed border-[#cbd5e1] text-center max-w-md mx-auto">
          <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto mb-3">
            <Users className="w-7 h-7" />
          </div>
          <h3 className="font-serif-book text-2xl font-bold text-[#1e293b] mb-2">
            Ответы пока не заполнены
          </h3>
          <p className="font-handwriting text-lg text-[#64748b] mb-4">
            Откройте личную книгу Алижана или Дильназ и ответьте на первые вопросы!
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Shared Answers Grid */}
          {bothAnsweredQuestions.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-amber-600" />
                <h2 className="font-serif-book text-2xl font-bold text-[#1e293b]">
                  Общие вопросы ({bothAnsweredQuestions.length})
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bothAnsweredQuestions.map(({ question, alizhanAns, dilnazAns, isMatch }) => {
                  const title = getQuestionTitle(question, 'alizhan');

                  return (
                    <div
                      key={question.id}
                      className={`rounded-2xl p-5 border transition-all ${
                        isMatch
                          ? 'bg-gradient-to-br from-amber-50/60 to-rose-50/60 border-rose-300 shadow-xs'
                          : 'bg-white border-[#cbd5e1]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                          {JOURNAL_SECTIONS.find((s) => s.id === question.sectionId)?.title}
                        </span>
                        {isMatch && (
                          <span className="text-xs font-bold text-rose-800 bg-rose-100 px-2.5 py-0.5 rounded-full border border-rose-200 flex items-center gap-1">
                            <Heart className="w-3 h-3 fill-rose-500 text-rose-600" />
                            <span>Совпадение!</span>
                          </span>
                        )}
                      </div>

                      <h3 className="font-serif-book text-xl font-bold text-[#1e293b] mb-3">
                        {title}
                      </h3>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {/* Alizhan Answer Box */}
                        <div className="p-3 rounded-xl bg-sky-50/80 border border-sky-200">
                          <div className="font-bold text-sky-900 mb-1 flex items-center gap-1">
                            <span>👦</span>
                            <span>Алижан:</span>
                          </div>
                          <p className="font-handwriting text-lg text-sky-950">
                            {Array.isArray(alizhanAns.value)
                              ? alizhanAns.value.join(', ')
                              : alizhanAns.value || 'Загружено вложение'}
                          </p>
                        </div>

                        {/* Dilnaz Answer Box */}
                        <div className="p-3 rounded-xl bg-purple-50/80 border border-purple-200">
                          <div className="font-bold text-purple-900 mb-1 flex items-center gap-1">
                            <span>👧</span>
                            <span>Дильназ:</span>
                          </div>
                          <p className="font-handwriting text-lg text-purple-950">
                            {Array.isArray(dilnazAns.value)
                              ? dilnazAns.value.join(', ')
                              : dilnazAns.value || 'Загружено вложение'}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Questions answered by only 1 person */}
          {singleAnsweredQuestions.length > 0 && (
            <div className="pt-6 border-t border-[#cbd5e1]">
              <div className="flex items-center gap-2 mb-4">
                <Info className="w-5 h-5 text-amber-700" />
                <h2 className="font-serif-book text-2xl font-bold text-[#1e293b]">
                  Ждём ответа второго человека ({singleAnsweredQuestions.length})
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {singleAnsweredQuestions.map(({ question, answeredBy, ans }) => {
                  const ownerConf = OWNER_CONFIGS[answeredBy];
                  const otherPerson = answeredBy === 'alizhan' ? 'Дильназ' : 'Алижана';
                  const title = getQuestionTitle(question, answeredBy);

                  return (
                    <div
                      key={question.id}
                      className="rounded-2xl p-4 bg-white border border-[#cbd5e1] flex items-center justify-between gap-4"
                    >
                      <div>
                        <span className="text-[11px] font-semibold text-slate-500">
                          {JOURNAL_SECTIONS.find((s) => s.id === question.sectionId)?.title}
                        </span>
                        <h4 className="font-serif-book text-lg font-bold text-[#1e293b]">
                          {title}
                        </h4>
                        <p className="font-handwriting text-lg text-slate-700 mt-0.5">
                          {ownerConf.name}: «
                          {Array.isArray(ans.value) ? ans.value.join(', ') : ans.value || 'Вложение'}»
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 block">
                          Ждём {otherPerson}
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
