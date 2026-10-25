import React, { useState, useRef } from 'react';
import { X, Upload, Image as ImageIcon, Plus, Check } from 'lucide-react';
import { Album, AlbumOwner, Photo } from '../../types/album';

interface AlbumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (albumData: Partial<Album>, coverFile?: File) => Promise<void>;
  initialAlbum?: Album | null;
  activeOwner: AlbumOwner;
}

export const AlbumModal: React.FC<AlbumModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialAlbum,
  activeOwner,
}) => {
  const [title, setTitle] = useState(initialAlbum?.title || '');
  const [description, setDescription] = useState(initialAlbum?.description || '');
  const [owner, setOwner] = useState<AlbumOwner>(initialAlbum?.owner || activeOwner);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      const url = URL.createObjectURL(file);
      setCoverPreview(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      await onSave(
        {
          id: initialAlbum?.id,
          title: title.trim(),
          description: description.trim(),
          owner,
        },
        coverFile || undefined
      );
      onClose();
    } catch (err) {
      console.error('Error saving album:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#fdfbf7] border border-amber-900/10 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="px-6 py-4 border-b border-amber-900/10 flex items-center justify-between bg-amber-900/5">
          <h2 className="text-lg font-serif font-bold text-amber-950">
            {initialAlbum ? 'Редактировать альбом' : 'Создать новый альбом'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-200/60 hover:bg-stone-300/80 flex items-center justify-center text-stone-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Owner selector */}
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wider">
              Владелец альбома
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setOwner('alizhan')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border text-center transition-all ${
                  owner === 'alizhan'
                    ? 'bg-amber-900 text-amber-50 border-amber-900'
                    : 'bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200'
                }`}
              >
                Альбомы Алижан
              </button>
              <button
                type="button"
                onClick={() => setOwner('dilnaz')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border text-center transition-all ${
                  owner === 'dilnaz'
                    ? 'bg-amber-900 text-amber-50 border-amber-900'
                    : 'bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200'
                }`}
              >
                Альбомы Дильназ
              </button>
            </div>
          </div>

          {/* Title input */}
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wider">
              Название альбома *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Например: Мой день рождения, Наше лето..."
              className="w-full px-4 py-2.5 bg-white border border-stone-300 rounded-xl text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-600 transition-all"
            />
          </div>

          {/* Description input */}
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wider">
              Описание (необязательно)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Коротко об этом альбоме..."
              className="w-full px-4 py-2.5 bg-white border border-stone-300 rounded-xl text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-600 transition-all resize-none"
            />
          </div>

          {/* Cover photo upload */}
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wider">
              Обложка альбома
            </label>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-2xl bg-stone-100 border-2 border-dashed border-stone-300 overflow-hidden relative flex items-center justify-center shrink-0">
                {coverPreview ? (
                  <img
                    src={coverPreview}
                    alt="Предпросмотр обложки"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="w-8 h-8 text-stone-400" />
                )}
              </div>

              <div className="space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl border border-stone-300 flex items-center gap-2 transition-all active:scale-95"
                >
                  <Upload className="w-3.5 h-3.5 text-amber-700" />
                  {coverPreview ? 'Изменить обложку' : 'Загрузить фото обложки'}
                </button>
                <p className="text-[11px] text-stone-500">
                  Если не выберете обложку, автоматически будет использовано первое фото из альбома.
                </p>
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-amber-900/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-200/60 transition-all"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-amber-900 hover:bg-amber-950 active:scale-95 text-amber-50 shadow-md transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              {initialAlbum ? 'Сохранить изменения' : 'Создать альбом'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
