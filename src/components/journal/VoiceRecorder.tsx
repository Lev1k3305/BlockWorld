import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, RotateCcw, Check, X, AlertCircle } from 'lucide-react';

interface VoiceRecorderProps {
  onSaveVoice: (dataUrl: string) => void;
  onClose: () => void;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onSaveVoice,
  onClose,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = async () => {
    setErrorMsg(null);
    setAudioUrl(null);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          setAudioUrl(reader.result as string);
        };
        reader.readAsDataURL(audioBlob);

        // Stop all audio tracks to release microphone
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(100);
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setErrorMsg('Не удалось получить доступ к микрофону. Проверьте разрешения браузера.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const togglePlayPreview = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSave = () => {
    if (audioUrl) {
      onSaveVoice(audioUrl);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#fdfbf7] rounded-3xl max-w-md w-full p-6 shadow-2xl border-2 border-amber-300 relative animate-page-flip">
        <div className="flex items-center justify-between pb-3 border-b border-[#ebdcd0] mb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center">
              <Mic className="w-5 h-5" />
            </div>
            <h3 className="font-serif-book text-xl font-bold text-[#3d2b1f]">
              Голосовой ответ
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-200 text-stone-700 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg ? (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs mb-4 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold mb-1">Доступ к микрофону недоступен</p>
              <p>{errorMsg}</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            {!audioUrl ? (
              <div>
                <div
                  className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-4 transition-all ${
                    isRecording
                      ? 'bg-rose-500 text-white animate-pulse shadow-lg scale-110'
                      : 'bg-amber-100 text-amber-900 hover:bg-amber-200 cursor-pointer'
                  }`}
                  onClick={isRecording ? stopRecording : startRecording}
                >
                  {isRecording ? <Square className="w-8 h-8" /> : <Mic className="w-10 h-10" />}
                </div>

                <div className="font-mono text-2xl font-bold text-[#3d2b1f] mb-2">
                  {formatTime(recordingTime)}
                </div>

                <p className="text-xs text-[#8c7365]">
                  {isRecording
                    ? 'Нажмите на кнопку, чтобы остановить запись'
                    : 'Нажмите на микрофон, чтобы начать запись ответа'}
                </p>
              </div>
            ) : (
              <div>
                <audio
                  ref={audioRef}
                  src={audioUrl}
                  onEnded={() => setIsPlaying(false)}
                />

                <div className="w-16 h-16 rounded-2xl bg-emerald-100 border-2 border-emerald-300 text-emerald-800 flex items-center justify-center mx-auto mb-3 shadow-xs">
                  <Mic className="w-8 h-8" />
                </div>

                <p className="text-sm font-bold text-[#3d2b1f] mb-4">
                  Голосовая запись готова! ({formatTime(recordingTime)})
                </p>

                <div className="flex items-center justify-center gap-3 mb-6">
                  <button
                    type="button"
                    onClick={togglePlayPreview}
                    className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span>{isPlaying ? 'Пауза' : 'Прослушать'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={startRecording}
                    className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Перезаписать</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#ebdcd0]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-[#8c7365] hover:bg-stone-100 cursor-pointer"
          >
            Отмена
          </button>
          {audioUrl && (
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Сохранить голосовой ответ</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
