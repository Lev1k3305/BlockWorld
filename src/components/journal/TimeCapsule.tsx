import React, { useState, useEffect } from 'react';
import { Clock, Plus, Eye, Calendar, Trash2, ArrowLeftRight, X, Bookmark } from 'lucide-react';
import { JournalOwner, TimeCapsuleSnapshot, Answer } from '../../types/journal';
import { JOURNAL_QUESTIONS, OWNER_CONFIGS, getQuestionTitle } from '../../constants/questions';
import { journalStorage } from '../../services/journalStorage';

export const TimeCapsule: React.FC = () => {
  const [selectedOwner, setSelectedOwner] = useState<JournalOwner>('alizhan');
  const [snapshots, setSnapshots] = useState<TimeCapsuleSnapshot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New snapshot modal
  const [isCreating, setIsCreating] = useState(false);
  const [snapshotTitle, setSnapshotTitle] = useState('Мои ответы сегодня');
  const [snapshotNote, setSnapshotNote] = useState('');
  const [targetOpenDate, setTargetOpenDate] = useState('');

  // Active snapshot viewer & comparison
  const [viewingSnapshot, setViewingSnapshot] = useState<TimeCapsuleSnapshot | null>(null);
  const [currentLiveAnswers, setCurrentLiveAnswers] = useState<Record<string, Answer>>({});

  useEffect(() => {
    loadSnapshots();
  }, [selectedOwner]);

  const loadSnapshots = async () => {
    setIsLoading(true);
    try {
      const data = await journalStorage.getSnapshotsByOwner(selectedOwner);
      setSnapshots(data);
    } catch (err) {
      console.error('Failed to load snapshots:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSnapshot = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const liveAnswersList = await journalStorage.getAnswersByOwner(selectedOwner);
      const answersRecord: Record<string, string | string[]> = {};
      const attachmentsRecord: Record<
        string,
        { photoUrl?: string; drawingUrl?: string; voiceUrl?: string }
      > = {};

      liveAnswersList.forEach((ans) => {
        answersRecord[ans.questionId] = ans.value;
        if (ans.attachments) {
          attachmentsRecord[ans.questionId] = ans.attachments;
        }
      });

      const newSnapshot: TimeCapsuleSnapshot = {
        id: `snapshot-${selectedOwner}-${Date.now()}`,
        owner: selectedOwner,
        title: snapshotTitle.trim() || 'Мои ответы сегодня',
        note: snapshotNote.trim() || undefined,
        createdAt: Date.now(),
        targetOpenDate: targetOpenDate || undefined,
        answers: answersRecord,
        attachments: attachmentsRecord,
      };

      await journalStorage.saveSnapshot(newSnapshot);
      setSnapshots((prev) => [newSnapshot, ...prev]);
      setIsCreating(false);
      setSnapshotTitle('Мои ответы сегодня');
      setSnapshotNote('');
      setTargetOpenDate('');
    } catch (err) {
      console.error('Failed to create snapshot:', err);
    }
  };

  const handleDeleteSnapshot = async (snapshotId: string) => {
    try {
      await journalStorage.deleteSnapshot(snapshotId);
      setSnapshots((prev) => prev.filter((s) => s.id !== snapshotId));
      if (viewingSnapshot?.id === snapshotId) {
        setViewingSnapshot(null);
      }
    } catch (err) {
      console.error('Failed to delete snapshot:', err);
    }
  };

  const handleOpenViewer = async (snapshot: TimeCapsuleSnapshot) => {
    setViewingSnapshot(snapshot);
    try {
      const liveList = await journalStorage.getAnswersByOwner(snapshot.owner);
      const liveMap: Record<string, Answer> = {};
      liveList.forEach((ans) => {
        liveMap[ans.questionId] = ans;
      });
      setCurrentLiveAnswers(liveMap);
    } catch (err) {
      console.error('Failed to load live answers for comparison:', err);
    }
  };

  const config = OWNER_CONFIGS[selectedOwner];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-page-flip">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white border-2 border-amber-300 shadow-xs mb-8 relative">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold uppercase tracking-wider mb-3">
              <Clock className="w-3.5 h-3.5 text-amber-700" />
              <span>Капсула времени</span>
            </div>
            <h1 className="font-serif-book text-3xl sm:text-4xl font-bold text-[#1e293b]">
              Сохранение ответов по датам
            </h1>
            <p className="font-handwriting text-2xl text-[#64748b] mt-1">
              Фиксируйте мысли сегодня, чтобы перечитать их через время!
            </p>
          </div>

          <button
            onClick={() => setIsCreating(true)}
            className="px-5 py-3 rounded-xl bg-amber-800 text-amber-50 hover:bg-amber-900 transition-transform active:scale-98 font-bold text-sm shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Законсервировать ответы</span>
          </button>
        </div>

        {/* Owner Selector */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-[#cbd5e1]">
          <span className="text-xs font-bold text-slate-600 mr-2">Выбрать журнал:</span>
          <button
            onClick={() => setSelectedOwner('alizhan')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all border ${
              selectedOwner === 'alizhan'
                ? 'bg-sky-100 text-sky-950 border-sky-300 shadow-2xs'
                : 'bg-white text-slate-600 border-slate-300'
            }`}
          >
            👦 Алижан
          </button>
          <button
            onClick={() => setSelectedOwner('dilnaz')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all border ${
              selectedOwner === 'dilnaz'
                ? 'bg-purple-100 text-purple-950 border-purple-300 shadow-2xs'
                : 'bg-white text-slate-600 border-slate-300'
            }`}
          >
            👧 Дильназ
          </button>
        </div>
      </div>

      {/* Snapshots Grid */}
      {isLoading ? (
        <div className="py-16 text-center text-slate-500 font-serif-book">
          Загрузка капсулы времени...
        </div>
      ) : snapshots.length === 0 ? (
        <div className="p-10 rounded-2xl bg-white border-2 border-dashed border-[#cbd5e1] text-center max-w-md mx-auto">
          <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-3">
            <Bookmark className="w-7 h-7" />
          </div>
          <h3 className="font-serif-book text-2xl font-bold text-[#1e293b] mb-2">
            Капсула для {config.name} пока пуста
          </h3>
          <p className="font-handwriting text-lg text-[#64748b] mb-4">
            Ответьте на вопросы в журнале и нажмите «Законсервировать ответы», чтобы сохранить первый снимок!
          </p>
          <button
            onClick={() => setIsCreating(true)}
            className="px-5 py-2.5 rounded-xl bg-amber-800 text-amber-50 font-bold text-sm cursor-pointer shadow-xs"
          >
            Законсервировать ответы
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {snapshots.map((snap) => {
            const dateStr = new Date(snap.createdAt).toLocaleDateString('ru-RU', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            });
            const answerCount = Object.keys(snap.answers || {}).length;

            return (
              <div
                key={snap.id}
                className="paper-sheet rounded-2xl p-6 relative border border-[#cbd5e1] flex flex-col justify-between bg-white"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full">
                      <Calendar className="w-3 h-3 text-amber-700" />
                      <span>{dateStr}</span>
                    </span>

                    <button
                      onClick={() => handleDeleteSnapshot(snap.id)}
                      className="text-rose-600 hover:text-rose-800 p-1 rounded hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Удалить снимок"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <h3 className="font-serif-book text-2xl font-bold text-[#1e293b] mb-1">
                    {snap.title}
                  </h3>

                  {snap.note && (
                    <p className="font-handwriting text-lg text-[#64748b] mb-2">
                      «{snap.note}»
                    </p>
                  )}

                  {snap.targetOpenDate && (
                    <p className="text-xs font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 inline-block mb-3">
                      Открыть: {snap.targetOpenDate}
                    </p>
                  )}

                  <p className="text-xs text-slate-500 mb-4">
                    Сохранено ответов: <span className="font-bold text-[#1e293b]">{answerCount}</span>
                  </p>
                </div>

                <div className="pt-4 border-t border-[#cbd5e1]">
                  <button
                    onClick={() => handleOpenViewer(snap)}
                    className="w-full py-2.5 rounded-xl bg-amber-100/90 hover:bg-amber-200 text-amber-950 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Просмотреть и сравнить с текущими</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Create Snapshot */}
      {isCreating && (
        <div className="fixed inset-0 z-50 bg-stone-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateSnapshot}
            className="bg-[#fdfbf7] rounded-2xl max-w-lg w-full p-6 shadow-2xl relative border border-[#cbd5e1] animate-page-flip"
          >
            <div className="flex items-center justify-between gap-2 mb-4 pb-2 border-b border-[#cbd5e1]">
              <h3 className="font-serif-book text-2xl font-bold text-[#1e293b]">
                Законсервировать ответы в капсулу
              </h3>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="p-1.5 rounded-full hover:bg-stone-200 text-stone-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Название записи
                </label>
                <input
                  type="text"
                  required
                  value={snapshotTitle}
                  onChange={(e) => setSnapshotTitle(e.target.value)}
                  placeholder="Например: Мои ответы в 2025 году"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#cbd5e1] bg-white text-sm text-[#1e293b] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Заметка или настроение (необязательно)
                </label>
                <textarea
                  rows={2}
                  value={snapshotNote}
                  onChange={(e) => setSnapshotNote(e.target.value)}
                  placeholder="О чём ты думаешь прямо сейчас..."
                  className="w-full px-3.5 py-2 rounded-xl border border-[#cbd5e1] bg-white text-sm text-[#1e293b] focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Желаемая дата открытия (необязательно)
                </label>
                <input
                  type="date"
                  value={targetOpenDate}
                  onChange={(e) => setTargetOpenDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#cbd5e1] bg-white text-sm text-[#1e293b] focus:outline-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed">
                ✨ Снимок зафиксирует все текущие ответы <span className="font-bold">{config.name}</span>.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-amber-800 text-white font-bold text-xs cursor-pointer shadow-2xs hover:bg-amber-900"
              >
                Сохранить снимок
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: View & Side-by-Side Comparison */}
      {viewingSnapshot && (
        <div className="fixed inset-0 z-50 bg-stone-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#fdfbf7] rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative border border-[#cbd5e1] animate-page-flip">
            <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-[#cbd5e1]">
              <div>
                <span className="text-xs font-bold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full">
                  Снимок от {new Date(viewingSnapshot.createdAt).toLocaleDateString('ru-RU')}
                </span>
                <h2 className="font-serif-book text-3xl font-bold text-[#1e293b] mt-1">
                  {viewingSnapshot.title}
                </h2>
                {viewingSnapshot.note && (
                  <p className="font-handwriting text-xl text-[#64748b]">
                    «{viewingSnapshot.note}»
                  </p>
                )}
              </div>

              <button
                onClick={() => setViewingSnapshot(null)}
                className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2 text-sm font-bold text-slate-700">
                <ArrowLeftRight className="w-4 h-4 text-amber-700" />
                <span>Сравнение зафиксированного снимка и текущих ответов в журнале:</span>
              </div>

              {JOURNAL_QUESTIONS.map((q) => {
                const oldVal = viewingSnapshot.answers[q.id];
                const liveAns = currentLiveAnswers[q.id];
                const liveVal = liveAns?.value;

                if (!oldVal && !liveVal) return null;

                const formatVal = (v: any) => {
                  if (!v) return '—';
                  if (Array.isArray(v)) return v.join(', ');
                  return v;
                };

                const oldStr = formatVal(oldVal);
                const liveStr = formatVal(liveVal);
                const isChanged = oldStr !== liveStr;

                const title = getQuestionTitle(q, viewingSnapshot.owner);

                return (
                  <div key={q.id} className="p-4 rounded-xl bg-white border border-[#cbd5e1]">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h4 className="font-serif-book text-lg font-bold text-[#1e293b]">
                        {title}
                      </h4>
                      {isChanged ? (
                        <span className="text-[11px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                          Ответ изменился!
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                          Без изменений
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-lg bg-amber-50/80 border border-amber-200">
                        <span className="font-bold text-amber-900 block mb-1">
                          Снимок ({new Date(viewingSnapshot.createdAt).toLocaleDateString('ru-RU')}):
                        </span>
                        <p className="font-handwriting text-lg text-[#1e293b]">
                          «{oldStr}»
                        </p>
                      </div>

                      <div className="p-3 rounded-lg bg-emerald-50/80 border border-emerald-200">
                        <span className="font-bold text-emerald-900 block mb-1">
                          Текущий ответ в журнале:
                        </span>
                        <p className="font-handwriting text-lg text-[#1e293b]">
                          «{liveStr}»
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
