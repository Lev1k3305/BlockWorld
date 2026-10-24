import React from 'react';
import { X, Volume2, Music, Sparkles, Sliders, RotateCcw, Home, Monitor } from 'lucide-react';
import { GameSettings } from '../../game/types';
import { sounds } from '../../services/soundEffects';

interface SettingsModalProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: GameSettings) => void;
  onResetProgress: () => void;
  onReturnToMainMenu: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onResetProgress,
  onReturnToMainMenu,
  onClose,
}) => {
  const handleSfxChange = (val: number) => {
    sounds.setSfxVolume(val);
    onUpdateSettings({ ...settings, sfxVolume: val });
    sounds.playButtonClick();
  };

  const handleMusicChange = (val: number) => {
    sounds.setMusicVolume(val);
    onUpdateSettings({ ...settings, musicVolume: val });
  };

  const handleParticlesToggle = () => {
    onUpdateSettings({ ...settings, particlesEnabled: !settings.particlesEnabled });
    sounds.playButtonClick();
  };

  const handleQualityChange = (quality: 'low' | 'medium' | 'high') => {
    onUpdateSettings({ ...settings, graphicsQuality: quality });
    sounds.playButtonClick();
  };

  const handleSensitivityChange = (val: number) => {
    onUpdateSettings({ ...settings, cameraSensitivity: val });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 border-2 border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-800/90 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-amber-400" />
            <h2 className="text-base sm:text-lg font-bold font-fun text-white">Настройки игры</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors touch-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Sound FX Volume */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-200">
              <span className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-emerald-400" />
                Громкость звуков
              </span>
              <span className="font-mono text-slate-400">{Math.round(settings.sfxVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={settings.sfxVolume}
              onChange={(e) => handleSfxChange(parseFloat(e.target.value))}
              className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
          </div>

          {/* Music Volume */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-200">
              <span className="flex items-center gap-2">
                <Music className="w-4 h-4 text-sky-400" />
                Громкость музыки
              </span>
              <span className="font-mono text-slate-400">{Math.round(settings.musicVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={settings.musicVolume}
              onChange={(e) => handleMusicChange(parseFloat(e.target.value))}
              className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
            />
          </div>

          {/* Camera Sensitivity */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-200">
              <span className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-400" />
                Чувствительность камеры
              </span>
              <span className="font-mono text-slate-400">{settings.cameraSensitivity.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min={0.5}
              max={2.0}
              step={0.1}
              value={settings.cameraSensitivity}
              onChange={(e) => handleSensitivityChange(parseFloat(e.target.value))}
              className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
          </div>

          {/* Graphics Quality */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-200 mb-1">
              <span className="flex items-center gap-2">
                <Monitor className="w-4 h-4 text-purple-400" />
                Качество графики
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(['low', 'medium', 'high'] as const).map((q) => (
                <button
                  key={q}
                  onClick={() => handleQualityChange(q)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all touch-btn ${
                    settings.graphicsQuality === q
                      ? 'bg-purple-600/30 border-purple-500 text-purple-200 font-bold'
                      : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {q === 'low' ? 'Низкое' : q === 'medium' ? 'Среднее' : 'Высокое'}
                </button>
              ))}
            </div>
          </div>

          {/* Particles Toggle */}
          <div className="flex items-center justify-between p-3.5 bg-slate-800/50 rounded-2xl border border-slate-700/60">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              Частицы
            </span>
            <button
              onClick={handleParticlesToggle}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors touch-btn ${
                settings.particlesEnabled ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  settings.particlesEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Return to Main Menu */}
          <button
            onClick={() => {
              sounds.playButtonClick();
              onReturnToMainMenu();
            }}
            className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 border border-slate-700 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all touch-btn"
          >
            <Home className="w-4 h-4 text-sky-400" />
            Вернуться в главное меню
          </button>

          {/* Reset Progress */}
          <button
            onClick={() => {
              if (window.confirm('Сбросить весь сохранённый прогресс и собранные кристаллы?')) {
                onResetProgress();
              }
            }}
            className="w-full py-2.5 px-4 bg-red-950/40 hover:bg-red-900/50 active:scale-95 text-red-300 border border-red-800/50 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all touch-btn"
          >
            <RotateCcw className="w-4 h-4 text-red-400" />
            Сбросить прогресс приключения
          </button>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-800/80 border-t border-slate-700 text-center">
          <button
            onClick={onClose}
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-pink-500 hover:from-amber-400 hover:to-pink-400 active:scale-95 text-slate-950 font-bold rounded-2xl transition-all touch-btn text-sm font-fun"
          >
            Сохранить и продолжить
          </button>
        </div>
      </div>
    </div>
  );
};
