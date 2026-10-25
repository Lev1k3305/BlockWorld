import React, { useState } from 'react';
import { Lock, X, KeyRound, AlertCircle } from 'lucide-react';
import { JournalOwner } from '../../types/journal';
import { OWNER_CONFIGS } from '../../constants/questions';
import { pinService } from '../../services/pinService';

interface PinEntryModalProps {
  owner: JournalOwner;
  onSuccess: () => void;
  onCancel: () => void;
}

export const PinEntryModal: React.FC<PinEntryModalProps> = ({
  owner,
  onSuccess,
  onCancel,
}) => {
  const config = OWNER_CONFIGS[owner];
  const [pinInput, setPinInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsVerifying(true);

    try {
      const isValid = await pinService.verifyPin(owner, pinInput);
      if (isValid) {
        onSuccess();
      } else {
        setError('Неверный PIN-код. Попробуйте ещё раз.');
        setPinInput('');
      }
    } catch (err) {
      console.error('Error verifying PIN:', err);
      setError('Произошла ошибка при проверке PIN.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/75 backdrop-blur-xs flex items-center justify-center p-4 animate-page-flip">
      <div className="bg-[#fdfbf7] rounded-2xl max-w-sm w-full p-6 shadow-2xl border-2 border-amber-300 relative">
        <button
          type="button"
          onClick={onCancel}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-stone-200 text-stone-600 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div
            className="w-16 h-16 rounded-2xl border-2 flex items-center justify-center text-3xl mx-auto mb-3 shadow-xs"
            style={{ backgroundColor: config.badgeBg, borderColor: config.borderAccent }}
          >
            {config.avatarEmoji}
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider mb-2">
            <Lock className="w-3.5 h-3.5 text-amber-700" />
            <span>Журнал защищён</span>
          </div>

          <h3 className="font-serif-book text-2xl font-bold text-[#3d2b1f]">
            Вход в журнал {config.name}
          </h3>

          <p className="text-xs text-[#8c7365] mt-1">
            Введите PIN-код для подтверждения доступа
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              autoFocus
              maxLength={8}
              required
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="Введите PIN..."
              className="w-full px-4 py-3 rounded-xl border border-[#ebdcd0] bg-white text-center text-xl text-[#3d2b1f] focus:outline-none focus:border-amber-400 tracking-widest font-mono"
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="w-1/2 py-2.5 rounded-xl border border-[#ebdcd0] text-xs font-bold text-[#8c7365] hover:bg-stone-100 cursor-pointer"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isVerifying || pinInput.length === 0}
              className="w-1/2 py-2.5 rounded-xl bg-amber-800 hover:bg-amber-900 disabled:opacity-50 text-white font-bold text-xs cursor-pointer shadow-xs transition-transform active:scale-98"
            >
              {isVerifying ? 'Проверка...' : 'Войти'}
            </button>
          </div>
        </form>

        <p className="text-[11px] text-center text-[#a38c7e] mt-4 font-handwriting">
          * Защита работает локально в вашем браузере
        </p>
      </div>
    </div>
  );
};
