import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, Sparkles, Heart, AlertCircle } from 'lucide-react';
import { birthdayConfig } from '../../config/birthdayConfig';
import { sounds } from '../../services/soundEffects';

interface VoiceMessagePlayerProps {
  onPlaybackStateChange?: (isPlaying: boolean) => void;
  onEnded?: () => void;
}

export const VoiceMessagePlayer: React.FC<VoiceMessagePlayerProps> = ({
  onPlaybackStateChange,
  onEnded,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [hasError, setHasError] = useState<boolean>(false);
  const [isSynthesizedFallback, setIsSynthesizedFallback] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const stopFallbackRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
      setHasError(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setIsFinished(true);
      if (onPlaybackStateChange) onPlaybackStateChange(false);
      if (onEnded) onEnded();
    };

    const handleError = () => {
      console.warn("Could not load audio file from", birthdayConfig.audioFilePath, "- using gentle fallback");
      setHasError(true);
      setIsPlaying(false);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      if (stopFallbackRef.current) {
        stopFallbackRef.current();
      }
    };
  }, [onPlaybackStateChange, onEnded]);

  const togglePlay = () => {
    if (hasError || isSynthesizedFallback) {
      if (isPlaying) {
        if (stopFallbackRef.current) stopFallbackRef.current();
        setIsPlaying(false);
        if (onPlaybackStateChange) onPlaybackStateChange(false);
      } else {
        setIsPlaying(true);
        setIsFinished(false);
        if (onPlaybackStateChange) onPlaybackStateChange(true);
        setDuration(12.5);

        stopFallbackRef.current = sounds.playSynthesizedBirthdayMelody(
          (progress) => {
            setCurrentTime(progress * 12.5);
          },
          () => {
            setIsPlaying(false);
            setIsFinished(true);
            if (onPlaybackStateChange) onPlaybackStateChange(false);
            if (onEnded) onEnded();
          }
        ) || null;
      }
      return;
    }

    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      if (onPlaybackStateChange) onPlaybackStateChange(false);
    } else {
      audio.play().then(() => {
        setIsPlaying(true);
        setIsFinished(false);
        if (onPlaybackStateChange) onPlaybackStateChange(true);
      }).catch((err) => {
        console.warn("Audio play blocked or missing file:", err);
        setHasError(true);
        setIsPlaying(false);
      });
    }
  };

  const handleReplay = () => {
    setIsFinished(false);
    if (isSynthesizedFallback || hasError) {
      if (stopFallbackRef.current) stopFallbackRef.current();
      setIsPlaying(false);
      setCurrentTime(0);
      setTimeout(() => togglePlay(), 50);
      return;
    }

    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = 0;
      audio.play().then(() => {
        setIsPlaying(true);
        if (onPlaybackStateChange) onPlaybackStateChange(true);
      }).catch(() => {});
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
    if (!isSynthesizedFallback && !hasError && audioRef.current) {
      audioRef.current.currentTime = val;
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="w-full max-w-md mx-auto p-5 bg-slate-900/95 border-2 border-amber-400/60 rounded-3xl shadow-2xl text-white relative overflow-hidden">
      {/* Background Hearts/Stars during playback */}
      {isPlaying && (
        <div className="absolute inset-0 pointer-events-none opacity-25 overflow-hidden">
          <div className="absolute -top-4 left-6 text-pink-400 animate-bounce">❤️</div>
          <div className="absolute top-12 right-8 text-yellow-300 animate-pulse">✨</div>
          <div className="absolute bottom-4 left-1/3 text-cyan-300 animate-pulse">🌟</div>
          <div className="absolute bottom-6 right-12 text-pink-400 animate-bounce">💖</div>
        </div>
      )}

      {/* Title */}
      <div className="text-center mb-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full text-xs font-semibold tracking-wider uppercase mb-1.5 font-fun">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          Голосовое послание
        </div>
        <h3 className="text-lg sm:text-xl font-bold font-fun text-amber-100 flex items-center justify-center gap-2">
          Особенное поздравление от: {birthdayConfig.olderBrotherName} <Heart className="w-5 h-5 text-red-500 fill-red-500 inline-block animate-pulse" />
        </h3>
        <p className="text-xs text-slate-300 mt-1 font-fun">
          Записано с любовью для {birthdayConfig.heroes.brother.name} ({birthdayConfig.heroes.brother.age} лет) и {birthdayConfig.heroes.sister.name} ({birthdayConfig.heroes.sister.age} лет)
        </p>
      </div>

      {/* Hidden real Audio element */}
      <audio
        ref={audioRef}
        src={birthdayConfig.audioFilePath}
        preload="metadata"
      />

      {/* Animated waveform bars */}
      <div className="flex items-center justify-center gap-1.5 h-12 my-3 px-4 bg-slate-950/70 rounded-2xl border border-slate-800">
        {[24, 40, 16, 32, 48, 20, 36, 44, 28, 48, 20, 32, 16, 40].map((h, i) => (
          <div
            key={i}
            className={`w-1.5 rounded-full transition-all duration-150 ${
              isPlaying
                ? 'bg-gradient-to-t from-pink-500 to-amber-400'
                : 'bg-slate-700'
            }`}
            style={{
              height: isPlaying ? `${Math.max(8, (h * (0.5 + Math.sin((i + currentTime * 6)) * 0.5)))}px` : '8px',
            }}
          />
        ))}
      </div>

      {/* Missing file friendly notice if any */}
      {hasError && (
        <div className="mb-3 p-2.5 bg-amber-950/60 border border-amber-600/40 rounded-xl text-xs text-amber-200 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Готово к загрузке вашей записи!</p>
            <p className="text-[11px] text-amber-300/80">
              Поместите файл в <code className="bg-black/40 px-1 py-0.5 rounded text-amber-100 font-mono">public/audio/birthday-message.mp3</code>. Пока что воспроизводится праздничная мелодия!
            </p>
          </div>
        </div>
      )}

      {/* Progress slider & time */}
      <div className="space-y-1 mb-4">
        <input
          type="range"
          min={0}
          max={duration || 10}
          step={0.1}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
        />
        <div className="flex justify-between text-xs text-slate-400 font-mono">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={handleReplay}
          className="p-3 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 rounded-2xl transition-transform touch-btn shadow-md border border-slate-700"
          title="Слушать сначала"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        <button
          onClick={togglePlay}
          className="px-6 py-3 bg-gradient-to-r from-amber-500 to-pink-500 hover:from-amber-400 hover:to-pink-400 active:scale-95 text-slate-950 font-bold rounded-2xl shadow-xl transition-transform flex items-center gap-2 touch-btn text-sm font-fun"
        >
          {isPlaying ? (
            <>
              <Pause className="w-4 h-4 fill-slate-950" />
              Пауза
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-slate-950 ml-0.5" />
              {isFinished ? 'Слушать снова' : 'Послушать поздравление'}
            </>
          )}
        </button>
      </div>

      {/* Final Greeting Badge */}
      {isFinished && (
        <div className="mt-4 pt-3 border-t border-slate-800 text-center animate-fade-in">
          <p className="text-xl font-bold font-fun text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-amber-300 to-cyan-300 flex items-center justify-center gap-2">
            {birthdayConfig.messages.finalHeartMessage}
          </p>
        </div>
      )}
    </div>
  );
};
