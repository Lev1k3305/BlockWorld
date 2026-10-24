import React, { useState, useRef } from 'react';
import { Camera, Upload, Sparkles, ArrowLeft, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { PIXEL_STYLES, PixelArtStyle, pixelArtService } from '../../services/pixelArtService';
import { sounds } from '../../services/soundEffects';
import { birthdayConfig } from '../../config/birthdayConfig';

interface PixelBirthdayStudioProps {
  onBack: () => void;
}

export const PixelBirthdayStudio: React.FC<PixelBirthdayStudioProps> = ({ onBack }) => {
  const [selectedStyle, setSelectedStyle] = useState<PixelArtStyle>('pixel_birthday');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [recipient, setRecipient] = useState<string>(birthdayConfig.heroes.sister.name);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreview(url);
      setStatusMessage(null);
    }
  };

  const handleGenerate = async () => {
    if (!imagePreview) return;
    setIsProcessing(true);
    sounds.playButtonClick();

    try {
      const result = await pixelArtService.generatePortrait({
        imageBlob: imagePreview,
        style: selectedStyle,
        recipientName: recipient,
      });

      setStatusMessage(result.message);
    } catch {
      setStatusMessage('Генерация пиксель-арта пока не подключена.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 bg-slate-950 flex flex-col p-4 sm:p-6 overflow-y-auto text-white select-none">
      {/* Top Navigation */}
      <div className="flex items-center justify-between max-w-4xl w-full mx-auto mb-5">
        <button
          onClick={() => {
            sounds.playButtonClick();
            onBack();
          }}
          className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 active:scale-95 border border-slate-700 rounded-2xl text-xs font-bold text-slate-200 transition-all touch-btn"
        >
          <ArrowLeft className="w-4 h-4" />
          В главное меню
        </button>

        <div className="flex items-center gap-2 px-3.5 py-1.5 bg-amber-500/20 border border-amber-500/40 rounded-full text-xs font-mono text-amber-300">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          32-битная студия
        </div>
      </div>

      <div className="max-w-4xl w-full mx-auto flex-1 flex flex-col">
        {/* Title */}
        <div className="text-center mb-5">
          <h1 className="text-2xl sm:text-4xl font-extrabold font-fun text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-amber-300 to-cyan-300">
            Пиксельная фотостудия
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-fun mt-1 max-w-md mx-auto">
            Превратите праздничные фотографии в настоящие 32-битные пиксельные портреты первооткрывателей!
          </p>
        </div>

        {/* Notice Banner */}
        <div className="p-3.5 bg-amber-950/40 border border-amber-500/40 rounded-2xl mb-5 flex items-start gap-3 max-w-2xl mx-auto">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-200 leading-relaxed">
            <span className="font-bold">Функция будущей интеграции: </span>
            Интерфейс студии полностью настроен для подключения модели генерации пиксель-арта. Основная 3D игра остаётся полностью интерактивной и доступной!
          </div>
        </div>

        {/* Studio Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl w-full mx-auto">
          {/* Photo Panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col items-center">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5 self-start">
              <Camera className="w-4 h-4 text-sky-400" />
              1. Выберите героя и фото
            </h3>

            {/* Recipient toggle */}
            <div className="flex items-center gap-2 w-full mb-4">
              <button
                onClick={() => setRecipient(birthdayConfig.heroes.sister.name)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                  recipient === birthdayConfig.heroes.sister.name
                    ? 'bg-pink-600/30 border-pink-500 text-pink-200 shadow-md'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                {birthdayConfig.heroes.sister.name} ({birthdayConfig.heroes.sister.age} лет)
              </button>
              <button
                onClick={() => setRecipient(birthdayConfig.heroes.brother.name)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                  recipient === birthdayConfig.heroes.brother.name
                    ? 'bg-blue-600/30 border-blue-500 text-blue-200 shadow-md'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                {birthdayConfig.heroes.brother.name} ({birthdayConfig.heroes.brother.age} лет)
              </button>
            </div>

            {/* Preview Frame */}
            <div className="w-full aspect-square max-w-[260px] bg-slate-950 rounded-2xl border-2 border-dashed border-slate-700 overflow-hidden relative flex flex-col items-center justify-center p-3 text-center">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Предпросмотр фотографии"
                  className="w-full h-full object-cover rounded-xl pixelated"
                />
              ) : (
                <div className="space-y-2 text-slate-500">
                  <ImageIcon className="w-10 h-10 mx-auto opacity-40" />
                  <p className="text-xs font-fun">Фото пока не выбрано</p>
                  <p className="text-[10px] text-slate-600">Сделайте снимок или загрузите фото из галереи</p>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full mt-4 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 active:scale-95 border border-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2 touch-btn"
            >
              <Upload className="w-4 h-4 text-emerald-400" />
              Выбрать фото
            </button>
          </div>

          {/* Style Selection */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                2. Выберите 32-битный стиль
              </h3>

              <div className="space-y-2.5">
                {PIXEL_STYLES.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => {
                      sounds.playButtonClick();
                      setSelectedStyle(style.id);
                      setStatusMessage(null);
                    }}
                    className={`w-full p-3.5 rounded-2xl border text-left transition-all touch-btn ${
                      selectedStyle === style.id
                        ? 'border-amber-400 bg-amber-500/10 shadow-lg'
                        : 'border-slate-800 bg-slate-950 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-white font-fun">{style.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                        {style.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{style.paletteDescription}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Generate & Status */}
            <div className="mt-4">
              {statusMessage && (
                <div className="p-3 bg-amber-950/60 border border-amber-600/50 rounded-xl text-xs text-amber-200 text-center font-bold mb-3 animate-fade-in">
                  {statusMessage}
                </div>
              )}

              <button
                onClick={handleGenerate}
                disabled={!imagePreview || isProcessing}
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-pink-500 to-purple-600 hover:opacity-95 active:scale-95 disabled:opacity-40 disabled:pointer-events-none text-white font-bold rounded-2xl shadow-xl transition-all touch-btn text-sm font-fun flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Создать пиксельный портрет
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
