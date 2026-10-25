import React, { useState, useEffect } from 'react';
import {
  Check,
  Edit2,
  RotateCcw,
  Sparkles,
  Paintbrush,
  Camera,
  Mic,
  Share2,
  Trash2,
  Play,
  Pause,
  Image as ImageIcon,
  X,
} from 'lucide-react';
import { Question, JournalOwner, Answer } from '../../types/journal';
import { OWNER_CONFIGS, getQuestionTitle, getQuestionSubtitle } from '../../constants/questions';
import { DrawingModal } from './DrawingModal';
import { VoiceRecorder } from './VoiceRecorder';

interface QuestionCardProps {
  question: Question;
  owner: JournalOwner;
  currentAnswer?: Answer;
  onSaveAnswer: (
    questionId: string,
    value: string | string[],
    attachments?: { photoUrl?: string; drawingUrl?: string; voiceUrl?: string },
    isShared?: boolean
  ) => void;
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
  const questionTitle = getQuestionTitle(question, owner);
  const questionSubtitle = getQuestionSubtitle(question, owner);

  // Form states
  const [textInput, setTextInput] = useState<string>('');
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [customInput, setCustomInput] = useState<string>('');
  const [isShared, setIsShared] = useState<boolean>(currentAnswer?.isShared ?? true);

  // Attachments
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(currentAnswer?.attachments?.photoUrl);
  const [drawingUrl, setDrawingUrl] = useState<string | undefined>(currentAnswer?.attachments?.drawingUrl);
  const [voiceUrl, setVoiceUrl] = useState<string | undefined>(currentAnswer?.attachments?.voiceUrl);

  // Modals state
  const [isDrawingOpen, setIsDrawingOpen] = useState<boolean>(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(!currentAnswer);

  // Audio preview playback
  const [isPlayingVoice, setIsPlayingVoice] = useState<boolean>(false);

  useEffect(() => {
    if (currentAnswer) {
      if (Array.isArray(currentAnswer.value)) {
        const knownOptionVals = question.options?.map((o) => o.value) || [];
        const knowns = currentAnswer.value.filter((v) => knownOptionVals.includes(v));
        const customs = currentAnswer.value.filter((v) => !knownOptionVals.includes(v));
        setSelectedOptions(knowns);
        setCustomInput(customs.join(', '));
        setTextInput('');
      } else {
        setTextInput(currentAnswer.value || '');
        const knownOptionVals = question.options?.map((o) => o.value) || [];
        if (knownOptionVals.includes(currentAnswer.value)) {
          setSelectedOptions([currentAnswer.value]);
          setCustomInput('');
        } else {
          setSelectedOptions([]);
          setCustomInput(currentAnswer.value || '');
        }
      }
      setPhotoUrl(currentAnswer.attachments?.photoUrl);
      setDrawingUrl(currentAnswer.attachments?.drawingUrl);
      setVoiceUrl(currentAnswer.attachments?.voiceUrl);
      setIsShared(currentAnswer.isShared ?? true);
      setIsEditing(false);
    } else {
      setTextInput('');
      setSelectedOptions([]);
      setCustomInput('');
      setPhotoUrl(undefined);
      setDrawingUrl(undefined);
      setVoiceUrl(undefined);
      setIsShared(true);
      setIsEditing(true);
    }
  }, [currentAnswer, question.id]);

  const handleSingleSelect = (val: string) => {
    setSelectedOptions([val]);
    setTextInput(val);
    setCustomInput('');
    saveWithAttachments(val, [val]);
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
    saveWithAttachments(finalVal, updated);
  };

  const saveWithAttachments = (
    value: string | string[],
    arrayOpt?: string[],
    newAttachments?: { photoUrl?: string; drawingUrl?: string; voiceUrl?: string }
  ) => {
    const atts = newAttachments || { photoUrl, drawingUrl, voiceUrl };
    onSaveAnswer(question.id, value, atts, isShared);
    setIsEditing(false);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    let finalVal: string | string[] = '';

    if (question.type === 'text' || question.type === 'textarea') {
      finalVal = textInput.trim();
    } else if (question.type === 'single-choice') {
      finalVal = customInput.trim() || textInput;
    } else if (question.type === 'multi-choice') {
      finalVal = customInput.trim() ? [...selectedOptions, customInput.trim()] : selectedOptions;
    } else if (question.type === 'drawing') {
      finalVal = textInput.trim() || (drawingUrl ? 'Нарисованный ответ' : '');
    } else if (question.type === 'photo') {
      finalVal = textInput.trim() || (photoUrl ? 'Фото-ответ' : '');
    } else if (question.type === 'voice') {
      finalVal = textInput.trim() || (voiceUrl ? 'Голосовой ответ' : '');
    }

    if (
      finalVal ||
      (Array.isArray(finalVal) && finalVal.length > 0) ||
      photoUrl ||
      drawingUrl ||
      voiceUrl
    ) {
      saveWithAttachments(finalVal || 'Ответ с медиавложением');
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setPhotoUrl(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleClearAnswer = () => {
    if (currentAnswer) {
      onDeleteAnswer(currentAnswer.id);
    }
    setTextInput('');
    setSelectedOptions([]);
    setCustomInput('');
    setPhotoUrl(undefined);
    setDrawingUrl(undefined);
    setVoiceUrl(undefined);
    setIsEditing(true);
  };

  const hasAnswer =
    currentAnswer &&
    ((typeof currentAnswer.value === 'string' && currentAnswer.value.trim().length > 0) ||
      (Array.isArray(currentAnswer.value) && currentAnswer.value.length > 0) ||
      Boolean(currentAnswer.attachments?.photoUrl) ||
      Boolean(currentAnswer.attachments?.drawingUrl) ||
      Boolean(currentAnswer.attachments?.voiceUrl));

  return (
    <div
      className={`rounded-2xl p-5 sm:p-6 transition-all duration-200 border relative ${
        owner === 'alizhan' ? 'bg-[#f8fafc] border-[#cbd5e1]' : 'bg-[#faf9fe] border-[#e6e1f9]'
      }`}
    >
      {/* Question Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full mr-2"
                style={{ backgroundColor: config.badgeBg, color: config.primaryTextColor }}>
            #{question.number}
          </span>
          <h3 className="font-serif-book text-xl sm:text-2xl font-bold text-[#1e293b] inline">
            {questionTitle}
          </h3>
          {questionSubtitle && (
            <p className="font-handwriting text-base text-[#64748b] mt-1">
              {questionSubtitle}
            </p>
          )}
        </div>

        {hasAnswer && !isEditing && (
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setIsEditing(true)}
              className="p-1.5 rounded-lg text-xs font-medium text-[#475569] hover:bg-amber-100/70 transition-colors cursor-pointer flex items-center gap-1"
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

      {/* Answer View Mode */}
      {hasAnswer && !isEditing ? (
        <div className="mt-4 p-4 rounded-xl bg-white border border-[#e2e8f0] shadow-2xs relative space-y-3">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-amber-800">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Ответ {config.name}:</span>
            </div>

            {currentAnswer?.isShared !== false ? (
              <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                <Share2 className="w-3 h-3" />
                <span>Общий с семьёй</span>
              </span>
            ) : (
              <span className="text-[11px] font-semibold text-stone-600 bg-stone-100 px-2 py-0.5 rounded-full border border-stone-200">
                Личный ответ
              </span>
            )}
          </div>

          {/* Text/Option Answer */}
          {Array.isArray(currentAnswer.value) ? (
            <div className="flex flex-wrap gap-2 pt-1">
              {currentAnswer.value.map((item, idx) => (
                <span
                  key={idx}
                  className={`px-3 py-1 rounded-full text-sm font-semibold border ${
                    owner === 'alizhan'
                      ? 'bg-sky-50 text-sky-900 border-sky-200'
                      : 'bg-purple-50 text-purple-900 border-purple-200'
                  }`}
                >
                  {item}
                </span>
              ))}
            </div>
          ) : (
            currentAnswer.value && (
              <p className="font-handwriting text-2xl text-[#1e293b] whitespace-pre-wrap leading-relaxed">
                «{currentAnswer.value}»
              </p>
            )
          )}

          {/* Attachments Display */}
          {(photoUrl || drawingUrl || voiceUrl) && (
            <div className="flex flex-wrap gap-3 pt-2 border-t border-[#f1f5f9]">
              {drawingUrl && (
                <div className="p-2 bg-amber-50/80 rounded-xl border border-amber-200 max-w-xs">
                  <div className="flex items-center gap-1 text-[11px] font-bold text-amber-900 mb-1">
                    <Paintbrush className="w-3.5 h-3.5" />
                    <span>Рисунок:</span>
                  </div>
                  <img src={drawingUrl} alt="Рисунок" className="w-full h-32 object-contain bg-white rounded-lg border border-amber-200" />
                </div>
              )}

              {photoUrl && (
                <div className="p-2 bg-sky-50/80 rounded-xl border border-sky-200 max-w-xs">
                  <div className="flex items-center gap-1 text-[11px] font-bold text-sky-900 mb-1">
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Прикреплённая фотография:</span>
                  </div>
                  <img src={photoUrl} alt="Фото" className="w-full h-32 object-cover rounded-lg border border-sky-200" />
                </div>
              )}

              {voiceUrl && (
                <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsPlayingVoice(!isPlayingVoice)}
                    className="w-10 h-10 rounded-full bg-emerald-700 text-white flex items-center justify-center shadow-xs cursor-pointer"
                  >
                    {isPlayingVoice ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                  </button>
                  <div>
                    <span className="text-xs font-bold text-emerald-900 block">
                      Голосовой ответ
                    </span>
                    <audio
                      src={voiceUrl}
                      onEnded={() => setIsPlayingVoice(false)}
                      ref={(ref) => {
                        if (ref) {
                          if (isPlayingVoice) ref.play();
                          else ref.pause();
                        }
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Answer Input Mode */
        <div className="mt-4 space-y-4">
          {/* Format: Single Choice */}
          {question.type === 'single-choice' && (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {question.options?.map((opt) => {
                  const isSelected = selectedOptions.includes(opt.value) && !customInput;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleSingleSelect(opt.value)}
                      className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer flex items-center gap-1.5 border shadow-2xs ${
                        isSelected
                          ? owner === 'alizhan'
                            ? 'bg-[#1d4ed8] text-white border-blue-700 scale-102'
                            : 'bg-[#8d72e1] text-white border-purple-600 scale-102'
                          : 'bg-white text-[#334155] border-[#cbd5e1] hover:bg-slate-50'
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
                    className="flex-1 px-3.5 py-2 rounded-xl border border-[#cbd5e1] bg-white text-sm text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-sky-300"
                  />
                  {customInput.trim() && (
                    <button
                      type="button"
                      onClick={handleSubmit}
                      className={`px-4 py-2 rounded-xl text-xs font-bold text-white cursor-pointer shadow-2xs ${
                        owner === 'alizhan' ? 'bg-[#1d4ed8]' : 'bg-[#8d72e1]'
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
                            ? 'bg-[#1d4ed8] text-white border-blue-700'
                            : 'bg-[#8d72e1] text-white border-purple-600'
                          : 'bg-white text-[#334155] border-[#cbd5e1] hover:bg-slate-50'
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
                    className="flex-1 px-3.5 py-2 rounded-xl border border-[#cbd5e1] bg-white text-sm text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-sky-300"
                  />
                  {customInput.trim() && (
                    <button
                      type="button"
                      onClick={() => {
                        const updated = [...selectedOptions, customInput.trim()];
                        setSelectedOptions(updated);
                        saveWithAttachments(updated, updated);
                        setCustomInput('');
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold text-white cursor-pointer shadow-2xs ${
                        owner === 'alizhan' ? 'bg-[#1d4ed8]' : 'bg-[#8d72e1]'
                      }`}
                    >
                      Добавить
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Format: Short Text or Custom Text */}
          {(question.type === 'text' || question.type === 'drawing' || question.type === 'photo' || question.type === 'voice') && (
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder={question.placeholder || 'Напиши свой ответ...'}
                className="flex-1 px-4 py-2.5 rounded-xl border border-[#cbd5e1] bg-white text-base font-handwriting text-2xl text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-sky-300"
              />
            </div>
          )}

          {/* Format: Textarea */}
          {question.type === 'textarea' && (
            <textarea
              rows={3}
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder={question.placeholder || 'Запиши свои мысли...'}
              className="w-full px-4 py-3 rounded-xl border border-[#cbd5e1] bg-white text-base font-handwriting text-2xl text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-sky-300 resize-none"
            />
          )}

          {/* Media Attachments Strip */}
          <div className="pt-2 border-t border-[#e2e8f0] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Draw canvas button */}
              <button
                type="button"
                onClick={() => setIsDrawingOpen(true)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-colors cursor-pointer ${
                  drawingUrl ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-white text-[#475569] border-[#cbd5e1] hover:bg-amber-50'
                }`}
              >
                <Paintbrush className="w-3.5 h-3.5 text-amber-700" />
                <span>{drawingUrl ? 'Рисунок прикреплён' : 'Нарисовать'}</span>
              </button>

              {/* Photo upload button */}
              <label
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-colors cursor-pointer ${
                  photoUrl ? 'bg-sky-100 text-sky-900 border-sky-300' : 'bg-white text-[#475569] border-[#cbd5e1] hover:bg-sky-50'
                }`}
              >
                <Camera className="w-3.5 h-3.5 text-sky-700" />
                <span>{photoUrl ? 'Фото прикреплено' : 'Добавить фото'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>

              {/* Voice recorder button */}
              <button
                type="button"
                onClick={() => setIsVoiceOpen(true)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-colors cursor-pointer ${
                  voiceUrl ? 'bg-emerald-100 text-emerald-900 border-emerald-300' : 'bg-white text-[#475569] border-[#cbd5e1] hover:bg-emerald-50'
                }`}
              >
                <Mic className="w-3.5 h-3.5 text-emerald-700" />
                <span>{voiceUrl ? 'Голос прикреплён' : 'Записать голос'}</span>
              </button>

              {/* Share checkbox toggle */}
              <label className="inline-flex items-center gap-1.5 ml-2 cursor-pointer text-xs font-medium text-[#475569]">
                <input
                  type="checkbox"
                  checked={isShared}
                  onChange={(e) => setIsShared(e.target.checked)}
                  className="rounded text-sky-600 focus:ring-sky-400"
                />
                <span>Показывать в общем разделе</span>
              </label>
            </div>

            {/* Save answer button */}
            <button
              type="button"
              onClick={handleSubmit}
              className={`px-6 py-2.5 rounded-xl font-bold text-xs text-white shadow-xs transition-transform active:scale-98 cursor-pointer ${
                owner === 'alizhan' ? 'bg-[#1d4ed8] hover:bg-blue-800' : 'bg-[#8d72e1] hover:bg-purple-700'
              }`}
            >
              Записать ответ
            </button>
          </div>

          {/* Attachments preview before saving */}
          {(drawingUrl || photoUrl || voiceUrl) && (
            <div className="flex flex-wrap gap-2 pt-1">
              {drawingUrl && (
                <div className="relative inline-block">
                  <img src={drawingUrl} alt="Превью рисунка" className="w-16 h-16 object-contain bg-white rounded-lg border border-amber-300" />
                  <button
                    type="button"
                    onClick={() => setDrawingUrl(undefined)}
                    className="absolute -top-2 -right-2 p-0.5 bg-rose-600 text-white rounded-full cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              )}
              {photoUrl && (
                <div className="relative inline-block">
                  <img src={photoUrl} alt="Превью фото" className="w-16 h-16 object-cover rounded-lg border border-sky-300" />
                  <button
                    type="button"
                    onClick={() => setPhotoUrl(undefined)}
                    className="absolute -top-2 -right-2 p-0.5 bg-rose-600 text-white rounded-full cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              )}
              {voiceUrl && (
                <div className="flex items-center gap-1 bg-emerald-100 text-emerald-900 px-2.5 py-1 rounded-lg text-xs font-bold border border-emerald-300">
                  <Mic className="w-3.5 h-3.5" />
                  <span>Голос сохранён</span>
                  <button
                    type="button"
                    onClick={() => setVoiceUrl(undefined)}
                    className="ml-1 text-rose-700 hover:text-rose-900 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Interactive Drawing Modal */}
      {isDrawingOpen && (
        <DrawingModal
          initialDrawingUrl={drawingUrl}
          onSaveDrawing={(url) => setDrawingUrl(url)}
          onClose={() => setIsDrawingOpen(false)}
        />
      )}

      {/* Voice Recorder Modal */}
      {isVoiceOpen && (
        <VoiceRecorder
          onSaveVoice={(url) => setVoiceUrl(url)}
          onClose={() => setIsVoiceOpen(false)}
        />
      )}
    </div>
  );
};
