import React, { useState, useEffect } from 'react';
import { Upload, Trash2, Image as ImageIcon, Sparkles, X, Plus, Tag } from 'lucide-react';
import { JournalOwner, JournalPhoto } from '../../types/journal';
import { OWNER_CONFIGS } from '../../constants/questions';
import { journalStorage } from '../../services/journalStorage';

interface PhotosSectionProps {
  owner: JournalOwner;
}

export const PhotosSection: React.FC<PhotosSectionProps> = ({ owner }) => {
  const config = OWNER_CONFIGS[owner];
  const [photos, setPhotos] = useState<JournalPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<JournalPhoto | null>(null);

  const [captionInput, setCaptionInput] = useState('');
  const [categoryInput, setCategoryInput] = useState<'drawing' | 'photo'>('photo');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    loadPhotos();
  }, [owner]);

  const loadPhotos = async () => {
    setIsLoading(true);
    try {
      const data = await journalStorage.getPhotosByOwner(owner);
      setPhotos(data);
    } catch (err) {
      console.error('Failed to load photos:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const file = files[0];
      const reader = new FileReader();

      const dataUrl = await new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      const newPhoto: JournalPhoto = {
        id: `photo-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        owner,
        dataUrl,
        caption: captionInput.trim() || 'Память и творчество',
        category: categoryInput,
        createdAt: Date.now(),
      };

      await journalStorage.savePhoto(newPhoto);
      setPhotos((prev) => [newPhoto, ...prev]);
      setCaptionInput('');
    } catch (err) {
      console.error('Error uploading image:', err);
    } finally {
      setIsUploading(false);
      // Reset file input
      e.target.value = '';
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    try {
      await journalStorage.deletePhoto(photoId);
      setPhotos((prev) => prev.filter((p) => p.id !== photoId));
      if (selectedPhoto?.id === photoId) {
        setSelectedPhoto(null);
      }
    } catch (err) {
      console.error('Failed to delete photo:', err);
    }
  };

  return (
    <div className="space-y-6 animate-page-flip">
      {/* Upload & Intro Banner */}
      <div className="p-6 rounded-2xl bg-[#fdfbf7] border border-[#ebdcd0] shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2"
              style={{ backgroundColor: config.badgeBg, color: config.primaryTextColor }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{config.name} • Галерея</span>
            </div>
            <h2 className="font-serif-book text-3xl font-bold text-[#3d2b1f]">
              Мои рисунки и фотографии
            </h2>
            <p className="font-handwriting text-xl text-[#7c5e4c] mt-0.5">
              Сохраняй снимки, рисунки и памятные кадры в свой альбом
            </p>
          </div>

          <label
            className={`px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-xs cursor-pointer flex items-center gap-2 transition-transform hover:scale-102 active:scale-98 ${
              owner === 'alizhan' ? 'bg-[#e07a5f] hover:bg-[#cb6145]' : 'bg-[#8d72e1] hover:bg-[#785cc8]'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Добавить кадр</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              disabled={isUploading}
            />
          </label>
        </div>

        {/* Upload Customization Strip */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-[#ebdcd0]">
          <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-lg border border-[#ebdcd0] text-xs font-semibold">
            <Tag className="w-3.5 h-3.5 text-amber-700" />
            <span className="text-[#8c7365]">Тип:</span>
            <button
              type="button"
              onClick={() => setCategoryInput('photo')}
              className={`px-2 py-0.5 rounded cursor-pointer ${
                categoryInput === 'photo' ? 'bg-amber-100 font-bold text-amber-900' : 'text-[#8c7365]'
              }`}
            >
              Фото
            </button>
            <button
              type="button"
              onClick={() => setCategoryInput('drawing')}
              className={`px-2 py-0.5 rounded cursor-pointer ${
                categoryInput === 'drawing' ? 'bg-amber-100 font-bold text-amber-900' : 'text-[#8c7365]'
              }`}
            >
              Рисунок
            </button>
          </div>

          <input
            type="text"
            value={captionInput}
            onChange={(e) => setCaptionInput(e.target.value)}
            placeholder="Подпись перед загрузкой (необязательно)..."
            className="flex-1 px-3 py-1.5 rounded-lg border border-[#ebdcd0] bg-white text-xs text-[#3d2b1f] focus:outline-none"
          />
        </div>
      </div>

      {/* Gallery View */}
      {isLoading ? (
        <div className="py-12 text-center text-[#8c7365] font-serif-book">
          Загрузка ваших кадров...
        </div>
      ) : photos.length === 0 ? (
        <div className="p-10 rounded-2xl bg-[#fdfbf7] border-2 border-dashed border-[#ebdcd0] text-center max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center mx-auto mb-3">
            <ImageIcon className="w-8 h-8" />
          </div>
          <h3 className="font-serif-book text-2xl font-bold text-[#3d2b1f] mb-1">
            Пока нет сохранённых снимков
          </h3>
          <p className="font-handwriting text-lg text-[#7c5e4c] mb-4">
            Загрузи свой любимый рисунок или памятную фотографию!
          </p>
          <label
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer ${
              owner === 'alizhan' ? 'bg-[#e07a5f]' : 'bg-[#8d72e1]'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Выбрать фото или рисунок</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="polaroid-frame rounded-sm cursor-pointer relative group flex flex-col justify-between"
              onClick={() => setSelectedPhoto(photo)}
            >
              {/* Category Badge */}
              <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded bg-white/90 backdrop-blur-xs text-[10px] font-bold text-[#5c473a] shadow-2xs border border-amber-200">
                {photo.category === 'drawing' ? '🎨 Рисунок' : '📷 Фото'}
              </div>

              {/* Image container */}
              <div className="w-full h-48 bg-stone-100 rounded-xs overflow-hidden mb-3 border border-stone-200">
                <img
                  src={photo.dataUrl}
                  alt={photo.caption || 'Изображение'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Caption & Date */}
              <div>
                <p className="font-handwriting text-xl text-[#3d2b1f] leading-snug line-clamp-2">
                  {photo.caption || 'Без подписи'}
                </p>
                <div className="flex items-center justify-between text-[11px] text-[#8c7365] mt-2 pt-2 border-t border-stone-100">
                  <span>
                    {new Date(photo.createdAt).toLocaleDateString('ru-RU', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePhoto(photo.id);
                    }}
                    className="text-rose-600 hover:text-rose-800 p-1 rounded hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Удалить кадр"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Fullscreen Photo Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 bg-stone-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#fdfbf7] rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative border border-[#ebdcd0] animate-page-flip">
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-stone-100 text-stone-700 hover:bg-stone-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="max-h-[70vh] rounded-xl overflow-hidden mb-4 bg-stone-900 flex items-center justify-center">
              <img
                src={selectedPhoto.dataUrl}
                alt={selectedPhoto.caption || 'Просмотр'}
                className="max-h-[68vh] w-auto object-contain"
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
                  {selectedPhoto.category === 'drawing' ? '🎨 Рисунок' : '📷 Фотография'}
                </span>
                <p className="font-handwriting text-2xl text-[#3d2b1f] mt-1">
                  {selectedPhoto.caption}
                </p>
              </div>

              <button
                onClick={() => handleDeletePhoto(selectedPhoto.id)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-100 text-rose-800 hover:bg-rose-200 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Удалить</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
