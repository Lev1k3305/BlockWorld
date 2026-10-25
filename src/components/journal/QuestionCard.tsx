import React, { useState, useEffect } from 'react';
import { Check, Edit2, RotateCcw, Sparkles } from 'lucide-react';
import { Question, JournalOwner, Answer } from '../../types/journal';
import { OWNER_CONFIGS } from '../../constants/questions';

interface QuestionCardProps {
  question: Question;
  owner: JournalOwner;
  currentAnswer?: Answer;
  onSaveAnswer: (questionId: string, value: string | string[]) => void;
  onDeleteAnswer: (answerId: string) => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  owner,
  currentAnswer,
  onSaveAnswer,
  onDeleteAnswer,
}) => {
  const config = OWNER_CONFIGS[owner];

  // Helper to extract string array or single value
  const getInitialValue = (): { textVal: string; arrayVal: string[]; customVal: string } => {
    if (!currentAnswer || currentAnswer.value === undefined || currentAnswer.value === null) {
      return { textVal: '', arrayVal: [], customVal: '' };
    }
    if (Array.isArray(currentAnswer.value)) {
      // Find options matched vs custom write in
      const knownOptionVals = question.options?.map((o) => o.value) || [];
      const knowns = currentAnswer.value.filter((v) => knownOptionVals.includes(v));
      const customs = currentAnswer.value.filter((v) => !knownOptionVals.includes(v));
      return { textVal: '', arrayVal: knowns, customVal: customs.join(', ') };
    }
    if (typeof currentAnswer.value === 'string') {
      const knownOptionVals = question.options?.map((o) => o.value) || [];
      if (knownOptionVals.includes(currentAnswer.value)) {
        return { textVal: currentAnswer.value, arrayVal: [currentAnswer.value], customVal: '' };
      }
      return { textVal: currentAnswer.value, arrayVal: [], customVal: currentAnswer.value };
    }
    return { textVal: '', arrayVal: [], customVal: '' };
  };

  const [textInput, setTextInput] = useState<string>('');
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [customInput, setCustomInput] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(!currentAnswer);

  useEffect(() => {
    const init = getInitialValue();
    setTextInput(init.textVal || (typeof currentAnswer?.value === 'string' ? currentAnswer.value : ''));
    setSelectedOptions(init.arrayVal);
    setCustomInput(init.customVal);
    setIsEditing(!currentAnswer);
  }, [currentAnswer, question.id]);

  const handleSingleSelect = (val: string) => {
    setSelectedOptions([val]);
    setTextInput(val);
    setCustomInput('');
    onSaveAnswer(question.id, val);
    setIsEditing(false);
  };

  const handleMultiToggle = (val: string) => {
    let updated: string[];
    if (selectedOptions.includes(val)) {
      updated = selectedOptions.filter((item) => item !== val);
    } else {
      updated = [...selectedOptions, val];
    }
    setSelectedOptions(updated);

    const finalVal = customInput.trim() ? [...updated, customInput.trim()] : updated;
    onSaveAnswer(question.id, finalVal);
  };

  const handleTextSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (question.type === 'text' || question.type === 'textarea') {
      if (textInput.trim()) {
        onSaveAnswer(question.id, textInput.trim());
        setIsEditing(false);
      }
    } else if (question.type === 'single-choice') {
      const val = customInput.trim() || textInput;
      if (val) {
        onSaveAnswer(question.id, val);
        setIsEditing(false);
      }
    } else if (question.type === 'multi-choice') {
      const finalVal = customInput.trim() ? [...selectedOptions, customInput.trim()] : selectedOptions;
      if (finalVal.length > 0) {
        onSaveAnswer(question.id, finalVal);
        setIsEditing(false);
      }
    }
  };

  const handleClearAnswer = () => {
    if (currentAnswer) {
      onDeleteAnswer(currentAnswer.id);
    }
    setTextInput('');
    setSelectedOptions([]);
    setCustomInput('');
    setIsEditing(true);
  };

  const hasAnswer = currentAnswer && (
    (typeof currentAnswer.value === 'string' && currentAnswer.value.trim().length > 0) ||
    (Array.isArray(currentAnswer.value) && currentAnswer.value.length > 0)
  );

  return (
    <div
      className={`rounded-2xl p-5 sm:p-6 transition-all duration-200 border relative ${
        owner === 'alizhan' ? 'bg-[#fffaf7] border-[#f7ded6]' : 'bg-[#faf9fe] border-[#e6e1f9]'
      }`}
    >
      {/* Question Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h3 className="font-serif-book text-xl sm:text-2xl font-bold text-[#4a3528]">
            {question.title}
          </h3>
          {question.subtitle && (
            <p className="font-handwriting text-base text-[#8c7365] mt-0.5">
              {question.subtitle}
            </p>
          )}
        </div>

        {hasAnswer && !isEditing && (
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setIsEditing(true)}
              className="p-1.5 rounded-lg text-xs font-medium text-[#7c5e4c] hover:bg-amber-100/70 transition-colors cursor-pointer flex items-center gap-1"
              title="Изменить ответ"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Изменить</span>
            </button>
            <button
              onClick={handleClearAnswer}
              className="p-1.5 rounded-lg text-xs font-medium text-rose-700 hover:bg-rose-100/60 transition-colors cursor-pointer flex items-center gap-1"
              title="Очистить ответ"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Очистить</span>
            </button>
          </div>
        )}
      </div>

      {/* Answer Displayed View (When Saved & Not Editing) */}
      {hasAnswer && !isEditing ? (
        <div className="mt-4 p-4 rounded-xl bg-[#fdfbf7] border border-[#ebdcd0] shadow-2xs relative">
          <div className="flex items-center gap-2 mb-1.5 text-xs font-bold uppercase tracking-wider text-amber-800">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Ответ {config.name}:</span>
          </div>

          {Array.isArray(currentAnswer.value) ? (
            <div className="flex flex-wrap gap-2 mt-2">
              {currentAnswer.value.map((item, idx) => (
                <span
                  key={idx}
                  className={`px-3 py-1 rounded-full text-sm font-semibold shadow-2xs border ${
                    owner === 'alizhan'
                      ? 'bg-[#fcece6] text-[#b0482d] border-[#f2beaf]'
                      : 'bg-[#f0ecfd] text-[#593db5] border-[#c9bbf2]'
                  }`}
                >
                  {item}
                </span>
              ))}
            </div>
          ) : (
            <p className="font-handwriting text-2xl text-[#3d2b1f] whitespace-pre-wrap leading-relaxed">
              «{currentAnswer.value}»
            </p>
          )}
        </div>
      ) : (
        /* Answer Interactive Input View */
        <div className="mt-4">
          {/* Format: Single Choice */}
          {question.type === 'single-choice' && (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {question.options?.map((opt) => {
                  const isSelected =
                    (selectedOptions.includes(opt.value) || textInput === opt.value) && !customInput;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleSingleSelect(opt.value)}
                      className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer flex items-center gap-1.5 border shadow-2xs ${
                        isSelected
                          ? owner === 'alizhan'
                            ? 'bg-[#e07a5f] text-white border-[#c05638] scale-102'
                            : 'bg-[#8d72e1] text-white border-[#6b4ebd] scale-102'
                          : 'bg-white text-[#4a3528] border-[#ebdcd0] hover:bg-amber-50'
                      }`}
                    >
                      {opt.emoji && <span>{opt.emoji}</span>}
                      <span>{opt.label}</span>
                      {isSelected && <Check className="w-4 h-4 ml-1" />}
                    </button>
                  );
                })}
              </div>

              {question.allowCustomInput && (
                <div className="pt-2 flex items-center gap-2">
                  <input
                    type="text"
                    value={customInput}
                    onChange={(e) => {
                      setCustomInput(e.target.value);
                      setSelectedOptions([]);
                      setTextInput(e.target.value);
                    }}
                    placeholder="Или напиши свой вариант..."
                    className="flex-1 px-3.5 py-2 rounded-xl border border-[#ebdcd0] bg-white text-sm text-[#3d2b1f] focus:outline-none focus:ring-2 focus:ring-amber-300"
                  />
                  {customInput.trim() && (
                    <button
                      type="button"
                      onClick={handleTextSubmit}
                      className={`px-4 py-2 rounded-xl text-xs font-bold text-white cursor-pointer shadow-2xs ${
                        owner === 'alizhan' ? 'bg-[#e07a5f]' : 'bg-[#8d72e1]'
                      }`}
                    >
                      Сохранить
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Format: Multiple Choice */}
          {question.type === 'multi-choice' && (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {question.options?.map((opt) => {
                  const isSelected = selectedOptions.includes(opt.value);
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleMultiToggle(opt.value)}
                      className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer flex items-center gap-1.5 border shadow-2xs ${
                        isSelected
                          ? owner === 'alizhan'
                            ? 'bg-[#e07a5f] text-white border-[#c05638]'
                            : 'bg-[#8d72e1] text-white border-[#6b4ebd]'
                          : 'bg-white text-[#4a3528] border-[#ebdcd0] hover:bg-amber-50'
                      }`}
                    >
                      {opt.emoji && <span>{opt.emoji}</span>}
                      <span>{opt.label}</span>
                      {isSelected && <Check className="w-4 h-4 ml-1" />}
                    </button>
                  );
                })}
              </div>

              {question.allowCustomInput && (
                <div className="pt-2 flex items-center gap-2">
                  <input
                    type="text"
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    placeholder="Добавить ещё один вариант..."
                    className="flex-1 px-3.5 py-2 rounded-xl border border-[#ebdcd0] bg-white text-sm text-[#3d2b1f] focus:outline-none focus:ring-2 focus:ring-amber-300"
                  />
                  {customInput.trim() && (
                    <button
                      type="button"
                      onClick={() => {
                        if (customInput.trim()) {
                          const updated = [...selectedOptions, customInput.trim()];
                          setSelectedOptions(updated);
                          onSaveAnswer(question.id, updated);
                          setCustomInput('');
                          setIsEditing(false);
                        }
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold text-white cursor-pointer shadow-2xs ${
                        owner === 'alizhan' ? 'bg-[#e07a5f]' : 'bg-[#8d72e1]'
                      }`}
                    >
                      Добавить
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Format: Short Text */}
          {question.type === 'text' && (
            <form onSubmit={handleTextSubmit} className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder={question.placeholder || 'Напиши ответ...'}
                className="flex-1 px-4 py-2.5 rounded-xl border border-[#ebdcd0] bg-white text-base font-handwriting text-[#3d2b1f] text-xl focus:outline-none focus:ring-2 focus:ring-amber-300"
              />
              <button
                type="submit"
                disabled={!textInput.trim()}
                className={`px-5 py-2.5 rounded-xl font-bold text-sm text-white transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs ${
                  owner === 'alizhan' ? 'bg-[#e07a5f] hover:bg-[#cb6145]' : 'bg-[#8d72e1] hover:bg-[#785cc8]'
                }`}
              >
                Записать
              </button>
            </form>
          )}

          {/* Format: Textarea */}
          {question.type === 'textarea' && (
            <form onSubmit={handleTextSubmit} className="space-y-3">
              <textarea
                rows={3}
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder={question.placeholder || 'Запиши свои мысли...'}
                className="w-full px-4 py-3 rounded-xl border border-[#ebdcd0] bg-white text-base font-handwriting text-xl text-[#3d2b1f] focus:outline-none focus:ring-2 focus:ring-amber-300 resize-none"
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-[#8c7365]">
                  Можешь редактировать ответ в любое время
                </p>
                <button
                  type="submit"
                  disabled={!textInput.trim()}
                  className={`px-6 py-2.5 rounded-xl font-bold text-sm text-white transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs ${
                    owner === 'alizhan' ? 'bg-[#e07a5f] hover:bg-[#cb6145]' : 'bg-[#8d72e1] hover:bg-[#785cc8]'
                  }`}
                >
                  Записать ответ
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
