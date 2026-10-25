import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Upload,
  Trash2,
  Mail,
  Heart,
  Sparkles,
  Music,
  FileAudio,
  Settings,
  Check,
} from 'lucide-react';
import { BrotherAudioRecord } from '../../types/journal';
import { journalStorage } from '../../services/journalStorage';

interface BrotherMessageModalProps {
  onClose: () => void;
}

export const BrotherMessageModal: React.FC<BrotherMessageModalProps> = ({ onClose }) => {
  const [isOpenLetter, setIsOpenLetter] = useState(false);
  const [audioRecord, setAudioRecord] = useState<BrotherAudioRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Audio player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  // Admin upload state
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    loadAudioRecord();
  }, []);

  const loadAudioRecord = async () => {
    setIsLoading(true);
    try {
      const record = await journalStorage.getBrotherAudio();
      setAudioRecord(record);
    } catch (err) {
      console.error('Failed to load brother audio:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((e) => console.error('Audio playback error:', e));
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = targetTime;
      setCurrentTime(targetTime);
    }
  };

  const handleToggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setUploadSuccess(null);

    const validExtensions = ['mp3', 'm4a', 'wav'];
    const ext = file.name.split('.').pop()?.toLowerCase() || '';

    if (!validExtensions.includes(ext) && !file.type.startsWith('audio/')) {
      setUploadError('Пожалуйста, выберите файл формата MP3, M4A или WAV.');
      return;
    }

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const dataUrl = reader.result as string;
        const newRecord: BrotherAudioRecord = {
          id: 'brother_audio',
          dataUrl,
          fileName: file.name,
          mimeType: file.type || 'audio/mpeg',
          fileSize: file.size,
          updatedAt: Date.now(),
        };

        await journalStorage.saveBrotherAudio(newRecord);
        setAudioRecord(newRecord);
        setUploadSuccess(`Файл "${file.name}" успешно загружен!`);
        setIsPlaying(false);
        setCurrentTime(0);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Failed to upload audio:', err);
      setUploadError('Не удалось сохранить файл.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteAudio = async () => {
    if (!window.confirm('Удалить аудиозапись старшего брата?')) return;
    try {
      await journalStorage.deleteBrotherAudio();
      setAudioRecord(null);
      setIsPlaying(false);
      setCurrentTime(0);
      setUploadSuccess('Запись удалена.');
    } catch (err) {
      console.error('Failed to delete audio:', err);
    }
  };

  const formatTime = (timeInSec: number) => {
    if (isNaN(timeInSec) || timeInSec <= 0) return '00:00';
    const mins = Math.floor(timeInSec / 60);
    const secs = Math.floor(timeInSec % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-page-flip">
      <div className="bg-[#fdfbf7] rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border-2 border-amber-300 relative my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-amber-100/80 hover:bg-amber-200 text-amber-900 cursor-pointer transition-colors"
          title="Закрыть"
        >
          <X className="w-5 h-5" />
        </button>

        {!isOpenLetter ? (
          <div className="text-center py-6 sm:py-8">
            <div className="w-24 h-24 rounded-3xl bg-amber-100 border-2 border-amber-300/90 text-amber-900 flex items-center justify-center mx-auto mb-6 shadow-md relative rotate-[-2deg]">
              <Mail className="w-12 h-12 text-amber-800" />
              <div className="absolute -bottom-2 -right-2 w-9 h-9 rounded-full bg-rose-500 border-2 border-white text-white flex items-center justify-center text-xs font-bold shadow-xs">
                ❤️
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-200/80 text-amber-900 text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-700 animate-pulse" />
              <span>Особенный подарок</span>
            </div>

            <h2 className="font-serif-book text-3xl sm:text-4xl font-bold text-[#3d2b1f] mb-2">
              Послание от старшего брата
            </h2>

            <p className="font-handwriting text-2xl text-[#7c5e4c] max-w-md mx-auto mb-8">
              «От брата с любовью» • Личное голосовое аудиопоздравление для Алижана и Дильназ.
            </p>

            <button
              onClick={() => setIsOpenLetter(true)}
              className="px-8 py-3.5 rounded-2xl bg-amber-800 hover:bg-amber-900 text-amber-50 font-bold text-base shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center gap-3 mx-auto"
            >
              <Heart className="w-5 h-5 fill-rose-300 text-rose-300" />
              <span>Открыть послание</span>
            </button>
          </div>
        ) : (
          <div className="animate-page-flip">
            <div className="text-center pb-6 border-b border-[#ebdcd0] mb-6 relative">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 text-rose-900 text-xs font-bold mb-2">
                <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-600" />
                <span>Послание от старшего брата</span>
              </div>

              <h2 className="font-serif-book text-3xl sm:text-4xl font-bold text-[#3d2b1f]">
                Послание от старшего брата
              </h2>

              <p className="font-handwriting text-2xl text-[#7c5e4c] mt-1">
                «Дорогие Алижан и Дильназ!»
              </p>
            </div>

            {isLoading ? (
              <div className="py-12 text-center text-[#8c7365] font-serif-book">
                Загрузка аудиозаписи...
              </div>
            ) : audioRecord ? (
              <div className="bg-amber-50/80 rounded-2xl p-6 border-2 border-amber-200 shadow-inner mb-6">
                <audio
                  ref={audioRef}
                  src={audioRecord.dataUrl}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onEnded={handleEnded}
                />

                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-200 text-amber-900 flex items-center justify-center shrink-0">
                    <Music className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-serif-book text-lg font-bold text-[#3d2b1f] leading-snug">
                      Голосовое поздравление
                    </h4>
                    <p className="text-xs text-[#8c7365]">
                      {audioRecord.fileName} • {formatTime(duration)}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <input
                      type="range"
                      min={0}
                      max={duration || 100}
                      value={currentTime}
                      onChange={handleSeek}
                      className="w-full h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-800"
                    />
                    <div className="flex items-center justify-between text-xs font-mono font-bold text-[#8c7365]">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={handleToggleMute}
                      className="p-2 rounded-xl hover:bg-amber-200/80 text-amber-900 transition-colors cursor-pointer"
                      title={isMuted ? 'Включить звук' : 'Выключить звук'}
                    >
                      {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </button>

                    <button
                      onClick={handleTogglePlay}
                      className="w-14 h-14 rounded-2xl bg-amber-800 hover:bg-amber-900 text-white flex items-center justify-center shadow-md transition-transform active:scale-95 cursor-pointer"
                      title={isPlaying ? 'Пауза' : 'Воспроизвести'}
                    >
                      {isPlaying ? (
                        <Pause className="w-7 h-7 fill-white" />
                      ) : (
                        <Play className="w-7 h-7 fill-white ml-0.5" />
                      )}
                    </button>

                    <button
                      onClick={() => {
                        if (audioRef.current) {
                          audioRef.current.currentTime = 0;
                          setCurrentTime(0);
                        }
                      }}
                      className="p-2 rounded-xl hover:bg-amber-200/80 text-amber-900 transition-colors cursor-pointer"
                      title="Начать заново"
                    >
                      <RotateCcw className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Fallback exact requested phrase when no audio file present */
              <div className="p-8 rounded-2xl bg-amber-50/60 border-2 border-dashed border-amber-300 text-center mb-6">
                <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-3 shadow-xs">
                  <FileAudio className="w-7 h-7" />
                </div>
                <h3 className="font-serif-book text-2xl font-bold text-[#3d2b1f] mb-1">
                  Здесь скоро появится особенное послание
                </h3>
                <p className="font-handwriting text-lg text-[#7c5e4c]">
                  Старший брат готовит личное голосовое поздравление для Алижана и Дильназ!
                </p>
              </div>
            )}

            <div className="border-t border-[#ebdcd0] pt-4 flex items-center justify-between">
              <button
                onClick={() => setIsAdminOpen(!isAdminOpen)}
                className="text-xs font-bold text-[#8c7365] hover:text-amber-900 flex items-center gap-1.5 cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>{isAdminOpen ? 'Скрыть управление' : 'Загрузить / изменить аудиозапись'}</span>
              </button>

              <button
                onClick={() => setIsOpenLetter(false)}
                className="text-xs font-bold text-amber-900 hover:underline cursor-pointer"
              >
                Закрыть послание
              </button>
            </div>

            {isAdminOpen && (
              <div className="mt-4 p-4 rounded-xl bg-stone-100 border border-stone-300 text-xs space-y-3 animate-page-flip">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#3d2b1f]">
                    Подключить аудиофайл (MP3, M4A, WAV)
                  </span>
                  {audioRecord && (
                    <button
                      onClick={handleDeleteAudio}
                      className="text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Удалить</span>
                    </button>
                  )}
                </div>

                <p className="text-[#6e584b]">
                  Выберите запись MP3, M4A или WAV с вашего устройства:
                </p>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".mp3,.m4a,.wav,audio/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <Upload className="w-4 h-4" />
                  <span>{isUploading ? 'Загрузка...' : 'Выбрать аудиофайл'}</span>
                </button>

                {uploadError && (
                  <p className="text-rose-700 font-semibold bg-rose-50 p-2 rounded-lg border border-rose-200">
                    {uploadError}
                  </p>
                )}

                {uploadSuccess && (
                  <p className="text-emerald-800 font-semibold bg-emerald-50 p-2 rounded-lg border border-emerald-200 flex items-center gap-1">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>{uploadSuccess}</span>
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
