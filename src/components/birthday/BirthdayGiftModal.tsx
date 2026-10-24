import React, { useEffect } from 'react';
import { X, Sparkles, Heart, Gift } from 'lucide-react';
import confetti from 'canvas-confetti';
import { birthdayConfig } from '../../config/birthdayConfig';
import { sounds } from '../../services/soundEffects';

interface BirthdayGiftModalProps {
  giftType: 'sister' | 'brother';
  onClose: () => void;
}

export const BirthdayGiftModal: React.FC<BirthdayGiftModalProps> = ({
  giftType,
  onClose,
}) => {
  const gift = giftType === 'sister' ? birthdayConfig.gifts.sister : birthdayConfig.gifts.brother;
  const isSister = giftType === 'sister';

  useEffect(() => {
    sounds.playHeartRestored();
    confetti({
      particleCount: 80,
      spread: 75,
      origin: { y: 0.6 },
      colors: isSister 
        ? ['#ec4899', '#a855f7', '#06b6d4', '#facc15'] 
        : ['#2563eb', '#f59e0b', '#10b981', '#ffffff']
    });
  }, [giftType, isSister]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-amber-400/60 rounded-3xl shadow-2xl overflow-hidden flex flex-col relative max-h-[92vh]">
        {/* Glow corner */}
        <div 
          className="absolute -top-16 -right-16 w-36 h-36 rounded-full blur-3xl opacity-30 pointer-events-none"
          style={{ backgroundColor: isSister ? '#ec4899' : '#2563eb' }}
        />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900/80 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-amber-400 animate-bounce" />
            <span className="text-xs font-bold uppercase tracking-widest text-amber-300 font-mono">
              Праздничный подарок
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors touch-btn"
            title="Закрыть"
            aria-label="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-center">
          {/* Item Emblem */}
          <div 
            className="mx-auto w-24 h-24 rounded-2xl flex items-center justify-center border-2 border-amber-400/50 shadow-2xl relative"
            style={{
              background: isSister 
                ? 'linear-gradient(135deg, rgba(236,72,153,0.35), rgba(6,182,212,0.25))' 
                : 'linear-gradient(135deg, rgba(37,99,235,0.35), rgba(245,158,11,0.25))'
            }}
          >
            {isSister ? (
              <span className="text-5xl drop-shadow-md">⚔️</span>
            ) : (
              <span className="text-5xl drop-shadow-md">♞</span>
            )}
            <div className="absolute -bottom-2 -right-2 p-1.5 bg-amber-500 rounded-full text-slate-950 shadow-md">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Titles */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-fun text-white">
              {gift.itemName}
            </h2>
            <p className="text-xs text-amber-300 font-fun mt-1">{gift.itemSubtitle}</p>
            <div className="inline-block mt-2 px-3 py-1 bg-slate-800/80 rounded-full border border-slate-700 text-xs text-slate-300">
              Посвящается: <strong className="text-amber-200">{gift.recipientName}</strong> (Исполнилось {gift.recipientAge} лет!)
            </div>
          </div>

          {/* Description & Lore */}
          <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700/60 text-left text-xs text-slate-200 space-y-2">
            <p className="leading-relaxed">{gift.description}</p>
            <p className="italic text-slate-400 text-[11px] border-t border-slate-700/60 pt-2 leading-relaxed">
              📜 {gift.lore}
            </p>
          </div>

          {/* Personal Brother's Message */}
          <div className="p-4 bg-gradient-to-r from-amber-950/40 to-pink-950/40 rounded-2xl border border-amber-500/40 text-left relative overflow-hidden">
            <div className="flex items-center gap-2 mb-2 text-xs font-bold text-amber-300 font-fun">
              <Heart className="w-4 h-4 text-red-500 fill-red-500 animate-pulse" />
              <span>Личное письмо от: {birthdayConfig.olderBrotherName}</span>
            </div>
            <p className="text-xs leading-relaxed text-amber-100/90 font-fun whitespace-pre-line">
              {gift.personalMessage}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 bg-slate-900 border-t border-slate-800 text-center">
          <button
            onClick={onClose}
            className="w-full py-3 bg-gradient-to-r from-amber-500 via-pink-500 to-purple-600 hover:opacity-95 active:scale-95 text-white font-bold rounded-2xl shadow-xl transition-all touch-btn text-sm font-fun"
          >
            Принять подарок с радостью ❤️
          </button>
        </div>
      </div>
    </div>
  );
};
