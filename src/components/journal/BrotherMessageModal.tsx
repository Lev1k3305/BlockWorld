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
import { BrotherAudioRecord, JournalOwner } from '../../types/journal';
import { journalStorage } from '../../services/journalStorage';

interface BrotherMessageModalProps {
  activeOwner?: JournalOwner | null;
  onClose: () => void;
}

import { OWNER_CONFIGS } from '../../constants/questions';

export const BrotherMessageModal: React.FC<BrotherMessageModalProps> = ({ activeOwner, onClose }) => {
  const [selectedOwner, setSelectedOwner] = useState<JournalOwner>(activeOwner || 'alizhan');
  const [isOpenLetter, setIsOpenLetter] = useState(true);
  const [audioRecord, setAudioRecord] = useState<BrotherAudioRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (activeOwner) {
      setSelectedOwner(activeOwner);
    }
  }, [activeOwner]);

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

  const config = OWNER_CONFIGS[selectedOwner];

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-page-flip">
      <div className="bg-[#fdfbf7] rounded-3xl max-w-2xl w-full p-5 sm:p-8 shadow-2xl border-2 border-amber-300/90 relative my-6 sm:my-8 max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-amber-100/90 hover:bg-amber-200 text-amber-900 cursor-pointer transition-colors z-20 shadow-xs"
          title="Закрыть"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Recipient Selection Header if opened from general view */}
        {!activeOwner && (
          <div className="flex items-center justify-center gap-2 mb-6 pb-4 border-b border-[#ebdcd0]">
            <span className="text-xs font-bold text-[#8c7365] mr-1">Послание для:</span>
            <button
              onClick={() => setSelectedOwner('alizhan')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                selectedOwner === 'alizhan'
                  ? 'bg-sky-100 text-sky-950 border-sky-300 shadow-xs scale-102'
                  : 'bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200'
              }`}
            >
              👦 Алижану
            </button>
            <button
              onClick={() => setSelectedOwner('dilnaz')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                selectedOwner === 'dilnaz'
                  ? 'bg-purple-100 text-purple-950 border-purple-300 shadow-xs scale-102'
                  : 'bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200'
              }`}
            >
              👧 Дильназ
            </button>
          </div>
        )}

        {/* Letter Container */}
        <div className="animate-page-flip">
          {/* Header */}
          <div className="text-center pb-5 border-b border-[#ebdcd0] mb-6 relative">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100/90 text-rose-900 text-xs font-bold mb-3 shadow-2xs border border-rose-200">
              <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-600" />
              <span>Послание от старшего брата ❤️</span>
            </div>

            <h2 className="font-serif-book text-2xl sm:text-4xl font-bold text-[#3d2b1f] px-2">
              {config.brotherMessageTitle}
            </h2>

            <p className="font-handwriting text-xl sm:text-2xl text-[#7c5e4c] mt-1">
              Личное обращение от твоего старшего брата
            </p>
          </div>

          {/* Letter Body Paper Sheet */}
          <div className="paper-sheet rounded-2xl p-6 sm:p-8 bg-[#fefcf8] border-2 border-amber-200/80 shadow-inner mb-6 space-y-4">
            {config.brotherMessage.split('\n\n').map((paragraph, idx) => (
              <p
                key={idx}
                className="font-serif-book text-base sm:text-lg text-[#2d1f18] leading-relaxed tracking-wide"
              >
                {paragraph}
              </p>
            ))}
          </div>

          {/* Optional Audio Greeting Feature */}
          <div className="pt-2">
            {isLoading ? (
              <div className="py-4 text-center text-xs text-[#8c7365] font-serif-book">
                Загрузка аудиосообщения...
              </div>
            ) : audioRecord ? (
              <div className="bg-amber-50/90 rounded-2xl p-4 sm:p-5 border border-amber-200 shadow-2xs mb-4">
                <audio
                  ref={audioRef}
                  src={audioRecord.dataUrl}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onEnded={handleEnded}
                />

                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-200 text-amber-900 flex items-center justify-center shrink-0">
                    <Music className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-serif-book text-base font-bold text-[#3d2b1f] leading-snug">
                      Голосовое аудиопоздравление
                    </h4>
                    <p className="text-[11px] text-[#8c7365]">
                      {audioRecord.fileName} • {formatTime(duration)}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <input
                    type="range"
                    min={0}
                    max={duration || 100}
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-800"
                  />
                  <div className="flex items-center justify-between text-[11px] font-mono font-bold text-[#8c7365]">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={handleToggleMute}
                      className="p-1.5 rounded-lg hover:bg-amber-200/80 text-amber-900 transition-colors cursor-pointer"
                      title={isMuted ? 'Включить звук' : 'Выключить звук'}
                    >
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={handleTogglePlay}
                      className="w-12 h-12 rounded-xl bg-amber-800 hover:bg-amber-900 text-white flex items-center justify-center shadow-xs transition-transform active:scale-95 cursor-pointer"
                      title={isPlaying ? 'Пауза' : 'Воспроизвести'}
                    >
                      {isPlaying ? (
                        <Pause className="w-6 h-6 fill-white" />
                      ) : (
                        <Play className="w-6 h-6 fill-white ml-0.5" />
                      )}
                    </button>

                    <button
                      onClick={() => {
                        if (audioRef.current) {
                          audioRef.current.currentTime = 0;
                          setCurrentTime(0);
                        }
                      }}
                      className="p-1.5 rounded-lg hover:bg-amber-200/80 text-amber-900 transition-colors cursor-pointer"
                      title="Начать заново"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Bottom Actions Bar */}
            <div className="border-t border-[#ebdcd0] pt-4 flex items-center justify-between gap-2">
              <button
                onClick={() => setIsAdminOpen(!isAdminOpen)}
                className="text-xs font-bold text-[#8c7365] hover:text-amber-900 flex items-center gap-1.5 cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>{isAdminOpen ? 'Скрыть управление' : 'Голосовая запись'}</span>
              </button>

              <button
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors"
              >
                Закрыть письмо
              </button>
            </div>

            {/* Admin Upload Drawer */}
            {isAdminOpen && (
              <div className="mt-4 p-4 rounded-xl bg-stone-100 border border-stone-300 text-xs space-y-3 animate-page-flip">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#3d2b1f]">
                    Добавить голосовую аудиозапись (MP3, M4A, WAV)
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
                  Загрузите готовую аудиозапись от старшего брата:
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
        </div>
      </div>
    </div>
  );
};
