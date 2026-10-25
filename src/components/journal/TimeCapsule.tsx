import React, { useState, useEffect } from 'react';
import { Clock, Plus, Eye, Sparkles, Calendar, Trash2, ArrowLeftRight, Check, X, Bookmark } from 'lucide-react';
import { JournalOwner, TimeCapsuleSnapshot, Answer } from '../../types/journal';
import { JOURNAL_QUESTIONS, OWNER_CONFIGS } from '../../constants/questions';
import { journalStorage } from '../../services/journalStorage';

export const TimeCapsule: React.FC = () => {
  const [selectedOwner, setSelectedOwner] = useState<JournalOwner>('alizhan');
  const [snapshots, setSnapshots] = useState<TimeCapsuleSnapshot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New snapshot state
  const [isCreating, setIsCreating] = useState(false);
  const [snapshotTitle, setSnapshotTitle] = useState('Мои ответы сегодня');
  const [snapshotNote, setSnapshotNote] = useState('');

  // Active snapshot viewer & comparison state
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
      // Fetch live answers for this owner
      const liveAnswersList = await journalStorage.getAnswersByOwner(selectedOwner);
      const answersRecord: Record<string, string | string[]> = {};
      liveAnswersList.forEach((ans) => {
        answersRecord[ans.questionId] = ans.value;
      });

      const newSnapshot: TimeCapsuleSnapshot = {
        id: `snapshot-${selectedOwner}-${Date.now()}`,
        owner: selectedOwner,
        title: snapshotTitle.trim() || 'Мои ответы сегодня',
        note: snapshotNote.trim() || undefined,
        createdAt: Date.now(),
        answers: answersRecord,
      };

      await journalStorage.saveSnapshot(newSnapshot);
      setSnapshots((prev) => [newSnapshot, ...prev]);
      setIsCreating(false);
      setSnapshotTitle('Мои ответы сегодня');
      setSnapshotNote('');
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
    // Fetch live answers to enable side-by-side comparison
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
      <div className="p-6 sm:p-8 rounded-2xl bg-[#fdfbf7] border-2 border-amber-300/80 shadow-xs mb-8 relative">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold uppercase tracking-wider mb-3">
              <Clock className="w-3.5 h-3.5 text-amber-700" />
              <span>Капсула времени</span>
            </div>
            <h1 className="font-serif-book text-3xl sm:text-4xl font-bold text-[#3d2b1f]">
              Сохранение ответов по датам
            </h1>
            <p className="font-handwriting text-2xl text-[#7c5e4c] mt-1">
              Фиксируйте мысли сегодня, чтобы перечитать их через год!
            </p>
          </div>

          <button
            onClick={() => setIsCreating(true)}
            className="px-5 py-3 rounded-xl bg-amber-800 text-amber-50 hover:bg-amber-900 transition-transform active:scale-98 font-bold text-sm shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Создать снимок «Мои ответы сегодня»</span>
          </button>
        </div>

        {/* Owner Filter Tabs */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-[#ebdcd0]">
          <span className="text-xs font-bold text-[#8c7365] mr-2">Выбрать журнал:</span>
          <button
            onClick={() => setSelectedOwner('alizhan')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all border ${
              selectedOwner === 'alizhan'
                ? 'bg-[#fcece6] text-[#c05638] border-[#f2beaf] shadow-2xs'
                : 'bg-white text-[#8c7365] border-[#ebdcd0]'
            }`}
          >
            🌸 Алижан
          </button>
          <button
            onClick={() => setSelectedOwner('dilnaz')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all border ${
              selectedOwner === 'dilnaz'
                ? 'bg-[#f0ecfd] text-[#6b4ebd] border-[#c9bbf2] shadow-2xs'
                : 'bg-white text-[#8c7365] border-[#ebdcd0]'
            }`}
          >
            🪻 Дильназ
          </button>
        </div>
      </div>

      {/* Snapshots List */}
      {isLoading ? (
        <div className="py-16 text-center text-[#8c7365] font-serif-book">
          Загрузка капсулы времени...
        </div>
      ) : snapshots.length === 0 ? (
        <div className="p-10 rounded-2xl bg-[#fdfbf7] border-2 border-dashed border-[#ebdcd0] text-center max-w-md mx-auto">
          <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-3">
            <Bookmark className="w-7 h-7" />
          </div>
          <h3 className="font-serif-book text-2xl font-bold text-[#3d2b1f] mb-2">
            Капсула для {config.name} пока пуста
          </h3>
          <p className="font-handwriting text-lg text-[#7c5e4c] mb-4">
            Заполните вопросы в журнале и нажмите «Создать снимок», чтобы сохранить первую запись!
          </p>
          <button
            onClick={() => setIsCreating(true)}
            className="px-5 py-2.5 rounded-xl bg-amber-800 text-amber-50 font-bold text-sm cursor-pointer shadow-xs"
          >
            Сохранить текущие ответы
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
                className="paper-sheet rounded-2xl p-6 relative group border border-[#ebdcd0] flex flex-col justify-between"
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
                      title="Удалить запись"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <h3 className="font-serif-book text-2xl font-bold text-[#3d2b1f] mb-1">
                    {snap.title}
                  </h3>

                  {snap.note && (
                    <p className="font-handwriting text-lg text-[#7c5e4c] mb-3">
                      «{snap.note}»
                    </p>
                  )}

                  <p className="text-xs text-[#8c7365] mb-4">
                    Зафиксировано ответов: <span className="font-bold text-[#3d2b1f]">{answerCount}</span>
                  </p>
                </div>

                <div className="pt-4 border-t border-[#ebdcd0]">
                  <button
                    onClick={() => handleOpenViewer(snap)}
                    className="w-full py-2.5 rounded-xl bg-amber-100/80 hover:bg-amber-200/80 text-amber-900 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Просмотреть и сравнить с текущими ответами</span>
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
            className="bg-[#fdfbf7] rounded-2xl max-w-lg w-full p-6 shadow-2xl relative border border-[#ebdcd0] animate-page-flip"
          >
            <div className="flex items-center justify-between gap-2 mb-4">
              <h3 className="font-serif-book text-2xl font-bold text-[#3d2b1f]">
                Создать снимок капсулы
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
                <label className="block text-xs font-bold text-[#5c473a] uppercase tracking-wider mb-1">
                  Название записи
                </label>
                <input
                  type="text"
                  required
                  value={snapshotTitle}
                  onChange={(e) => setSnapshotTitle(e.target.value)}
                  placeholder="Например: Мои ответы сегодня"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#ebdcd0] bg-white text-sm text-[#3d2b1f] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5c473a] uppercase tracking-wider mb-1">
                  Заметка или настроение (необязательно)
                </label>
                <textarea
                  rows={2}
                  value={snapshotNote}
                  onChange={(e) => setSnapshotNote(e.target.value)}
                  placeholder="Короткий комментарий к сегодняшнему дню..."
                  className="w-full px-3.5 py-2 rounded-xl border border-[#ebdcd0] bg-white text-sm text-[#3d2b1f] focus:outline-none resize-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed">
                ✨ Снимок зафиксирует текущие ответы <span className="font-bold">{config.name}</span> на сегодня.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#8c7365] hover:bg-amber-50 cursor-pointer"
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

      {/* Modal: View Snapshot & Compare with Live */}
      {viewingSnapshot && (
        <div className="fixed inset-0 z-50 bg-stone-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#fdfbf7] rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative border border-[#ebdcd0] animate-page-flip">
            <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-[#ebdcd0]">
              <div>
                <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
                  Снимок от {new Date(viewingSnapshot.createdAt).toLocaleDateString('ru-RU')}
                </span>
                <h2 className="font-serif-book text-3xl font-bold text-[#3d2b1f] mt-1">
                  {viewingSnapshot.title}
                </h2>
                {viewingSnapshot.note && (
                  <p className="font-handwriting text-xl text-[#7c5e4c]">
                    «{viewingSnapshot.note}»
                  </p>
                )}
              </div>

              <button
                onClick={() => setViewingSnapshot(null)}
                className="p-2 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Comparison Grid */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2 text-sm font-bold text-[#5c473a]">
                <ArrowLeftRight className="w-4 h-4 text-amber-700" />
                <span>Сравнение сохранённого снимка и текущих ответов журнала:</span>
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

                return (
                  <div key={q.id} className="p-4 rounded-xl bg-white border border-[#ebdcd0]">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h4 className="font-serif-book text-lg font-bold text-[#3d2b1f]">
                        {q.title}
                      </h4>
                      {isChanged ? (
                        <span className="text-[11px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                          Ответ изменился!
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-stone-600 bg-stone-100 px-2 py-0.5 rounded-full">
                          Без изменений
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-200/80">
                        <span className="font-bold text-amber-900 block mb-1">
                          Запись в снимке ({new Date(viewingSnapshot.createdAt).toLocaleDateString('ru-RU')}):
                        </span>
                        <p className="font-handwriting text-lg text-[#3d2b1f]">
                          «{oldStr}»
                        </p>
                      </div>

                      <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-200/80">
                        <span className="font-bold text-emerald-900 block mb-1">
                          Текущий ответ в журнале:
                        </span>
                        <p className="font-handwriting text-lg text-[#3d2b1f]">
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
