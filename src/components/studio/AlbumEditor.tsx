import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Upload,
  Trash2,
  GripVertical,
  Calendar,
  MessageSquare,
  Sparkles,
  Plus,
  Layout,
  BookOpen,
  Check,
  Smile,
  ChevronLeft,
  ChevronRight,
  Eye,
  Save,
  Image as ImageIcon
} from 'lucide-react';
import { Album, Photo, AlbumPage, LayoutType, Sticker } from '../../types/album';
import { albumStorage } from '../../services/albumStorage';

interface AlbumEditorProps {
  albumId: string;
  onBack: () => void;
  onPreview: () => void;
}

const AVAILABLE_STICKERS = [
  { emoji: '⭐', label: 'Звезда' },
  { emoji: '🎈', label: 'Шарик' },
  { emoji: '🌸', label: 'Цветок' },
  { emoji: '☀️', label: 'Солнышко' },
  { emoji: '🎨', label: 'Краски' },
  { emoji: '📸', label: 'Камера' },
  { emoji: '💖', label: 'Сердечко' },
  { emoji: '🚀', label: 'Ракета' },
  { emoji: '🐱', label: 'Котик' },
  { emoji: '🎂', label: 'Торт' },
  { emoji: '🌈', label: 'Радуга' },
  { emoji: '🍦', label: 'Мороженое' },
  { emoji: '🎉', label: 'Праздник' },
  { emoji: '👑', label: 'Корона' },
];

export const AlbumEditor: React.FC<AlbumEditorProps> = ({
  albumId,
  onBack,
  onPreview,
}) => {
  const [album, setAlbum] = useState<Album | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [pages, setPages] = useState<AlbumPage[]>([]);
  const [activeTab, setActiveTab] = useState<'photos' | 'pages'>('photos');
  const [activePageIdx, setActivePageIdx] = useState(0);

  const [draggedPhotoIdx, setDraggedPhotoIdx] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [previewPhoto, setPreviewPhoto] = useState<Photo | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadAlbumData();
  }, [albumId]);

  const loadAlbumData = async () => {
    const loadedAlbum = await albumStorage.getAlbum(albumId);
    const loadedPhotos = await albumStorage.getPhotosByAlbum(albumId);
    const loadedPages = await albumStorage.getPagesByAlbum(albumId);

    setAlbum(loadedAlbum);
    setPhotos(loadedPhotos);

    if (loadedPages.length === 0) {
      // Create initial page if none exist
      const initialPage: AlbumPage = {
        id: `page-${Date.now()}`,
        albumId,
        pageNumber: 1,
        layout: 'grid-2',
        photoIds: loadedPhotos.slice(0, 2).map((p) => p.id),
        title: loadedAlbum?.title || 'Страница 1',
        storyText: loadedAlbum?.description || '',
        stickers: [],
      };
      setPages([initialPage]);
      await albumStorage.savePage(initialPage);
    } else {
      setPages(loadedPages);
    }
  };

  // --- PHOTO UPLOAD ---

  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragOverArea, setIsDragOverArea] = useState(false);

  const processFiles = async (filesList: FileList | File[]) => {
    if (!filesList || filesList.length === 0) return;

    setUploadError(null);
    setIsUploading(true);
    const newPhotos: Photo[] = [];
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    const maxSizeBytes = 20 * 1024 * 1024; // 20 MB

    try {
      for (let i = 0; i < filesList.length; i++) {
        const file = filesList[i];

        if (!allowedTypes.includes(file.type.toLowerCase()) && !/\.(jpg|jpeg|png|webp)$/i.test(file.name)) {
          setUploadError(`Файл "${file.name}" имеет неподдерживаемый формат. Используйте JPG, PNG или WebP.`);
          continue;
        }

        if (file.size > maxSizeBytes) {
          setUploadError(`Файл "${file.name}" слишком большой (более 20 МБ).`);
          continue;
        }

        const dataUrl = await readFileAsDataUrl(file);

        const newPhoto: Photo = {
          id: `photo-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          albumId,
          dataUrl,
          caption: file.name.replace(/\.[^/.]+$/, ''),
          date: new Date().toISOString().split('T')[0],
          memoryNote: '',
          order: photos.length + i,
          createdAt: Date.now(),
        };

        await albumStorage.savePhoto(newPhoto);
        newPhotos.push(newPhoto);
      }

      if (newPhotos.length > 0) {
        const updatedPhotos = [...photos, ...newPhotos];
        setPhotos(updatedPhotos);

        // If album has no cover photo, set first new photo as cover
        if (album && !album.coverPhotoId) {
          const updatedAlbum = { ...album, coverPhotoId: newPhotos[0].id, updatedAt: Date.now() };
          await albumStorage.saveAlbum(updatedAlbum);
          setAlbum(updatedAlbum);
        }

        // Add newly uploaded photos to current page or create a page if needed
        if (pages.length === 0) {
          const newPage: AlbumPage = {
            id: `page-${Date.now()}`,
            albumId,
            pageNumber: 1,
            layout: 'grid-2',
            photoIds: newPhotos.map((p) => p.id).slice(0, 3),
            title: album?.title || 'Страница 1',
            storyText: '',
            stickers: [],
          };
          setPages([newPage]);
          await albumStorage.savePage(newPage);
        } else {
          const currentPage = pages[activePageIdx] || pages[0];
          if (currentPage.photoIds.length < 3) {
            const addedIds = newPhotos.map((p) => p.id);
            const updatedPage = {
              ...currentPage,
              photoIds: [...currentPage.photoIds, ...addedIds].slice(0, 3),
            };
            updatePageInState(updatedPage);
          }
        }

        showSaveStatus('Фотографии успешно загружены!');
      }
    } catch (err) {
      console.error('Error uploading files:', err);
      setUploadError('Произошла ошибка при загрузке файлов.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  };

  const handleDropArea = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverArea(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleDragOverArea = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverArea(true);
  };

  const handleDragLeaveArea = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverArea(false);
  };

  const readFileAsDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // --- REORDER PHOTOS (DRAG AND DROP) ---

  const handleDragStart = (idx: number) => {
    setDraggedPhotoIdx(idx);
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (draggedPhotoIdx === null || draggedPhotoIdx === idx) return;

    const reordered = [...photos];
    const [moved] = reordered.splice(draggedPhotoIdx, 1);
    reordered.splice(idx, 0, moved);

    setDraggedPhotoIdx(idx);
    setPhotos(reordered);
  };

  const handleDragEnd = async () => {
    setDraggedPhotoIdx(null);
    await albumStorage.savePhotoOrder(albumId, photos);
    showSaveStatus('Порядок фотографий сохранён');
  };

  const movePhoto = async (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= photos.length) return;
    const reordered = [...photos];
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);

    setPhotos(reordered);
    await albumStorage.savePhotoOrder(albumId, reordered);
  };

  // --- UPDATE PHOTO METADATA ---

  const handleUpdatePhoto = async (photoId: string, updates: Partial<Photo>) => {
    const updated = photos.map((p) => (p.id === photoId ? { ...p, ...updates } : p));
    setPhotos(updated);

    const targetPhoto = updated.find((p) => p.id === photoId);
    if (targetPhoto) {
      await albumStorage.savePhoto(targetPhoto);
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!confirm('Удалить эту фотографию из альбома?')) return;

    await albumStorage.deletePhoto(photoId);
    const updatedPhotos = photos.filter((p) => p.id !== photoId);
    setPhotos(updatedPhotos);

    // Remove from pages
    const updatedPages = pages.map((pg) => ({
      ...pg,
      photoIds: pg.photoIds.filter((id) => id !== photoId),
    }));
    setPages(updatedPages);
    await albumStorage.savePages(updatedPages);

    showSaveStatus('Фотография удалена');
  };

  // --- PAGE MANAGEMENT & LAYOUTS ---

  const updatePageInState = async (updatedPage: AlbumPage) => {
    const newPages = pages.map((p) => (p.id === updatedPage.id ? updatedPage : p));
    setPages(newPages);
    await albumStorage.savePage(updatedPage);
  };

  const handleAddPage = async () => {
    const newPage: AlbumPage = {
      id: `page-${Date.now()}`,
      albumId,
      pageNumber: pages.length + 1,
      layout: 'grid-2',
      photoIds: [],
      title: `Страница ${pages.length + 1}`,
      storyText: '',
      stickers: [],
    };

    const updatedPages = [...pages, newPage];
    setPages(updatedPages);
    await albumStorage.savePages(updatedPages);
    setActivePageIdx(updatedPages.length - 1);
    showSaveStatus('Новая страница добавлена');
  };

  const handleDeletePage = async (pageIdx: number) => {
    if (pages.length <= 1) {
      alert('В альбоме должна оставаться хотя бы одна страница');
      return;
    }

    if (!confirm('Удалить эту страницу альбома?')) return;

    const pageToDelete = pages[pageIdx];
    await albumStorage.deletePage(pageToDelete.id);

    const remainingPages = pages.filter((_, idx) => idx !== pageIdx);
    setPages(remainingPages);
    await albumStorage.savePages(remainingPages);

    if (activePageIdx >= remainingPages.length) {
      setActivePageIdx(remainingPages.length - 1);
    }
  };

  const handleTogglePhotoInPage = (pageIdx: number, photoId: string) => {
    const currentPage = pages[pageIdx];
    let newPhotoIds: string[];

    if (currentPage.photoIds.includes(photoId)) {
      newPhotoIds = currentPage.photoIds.filter((id) => id !== photoId);
    } else {
      if (currentPage.photoIds.length >= 3) {
        alert('На одной странице может быть максимум 3 фотографии');
        return;
      }
      newPhotoIds = [...currentPage.photoIds, photoId];
    }

    const updatedPage = { ...currentPage, photoIds: newPhotoIds };
    updatePageInState(updatedPage);
  };

  // --- STICKERS ---

  const handleAddSticker = (pageIdx: number, emoji: string) => {
    const currentPage = pages[pageIdx];
    const newSticker: Sticker = {
      id: `sticker-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      emoji,
      x: 20 + Math.random() * 60,
      y: 20 + Math.random() * 60,
      scale: 1,
      rotate: (Math.random() - 0.5) * 30,
    };

    const updatedPage = {
      ...currentPage,
      stickers: [...currentPage.stickers, newSticker],
    };
    updatePageInState(updatedPage);
  };

  const handleRemoveSticker = (pageIdx: number, stickerId: string) => {
    const currentPage = pages[pageIdx];
    const updatedPage = {
      ...currentPage,
      stickers: currentPage.stickers.filter((s) => s.id !== stickerId),
    };
    updatePageInState(updatedPage);
  };

  const showSaveStatus = (msg: string) => {
    setSaveStatus(msg);
    setTimeout(() => setSaveStatus(null), 3000);
  };

  if (!album) {
    return <div className="p-12 text-center text-stone-500">Загрузка альбома...</div>;
  }

  const currentPage = pages[activePageIdx] || pages[0];

  return (
    <div className="min-h-screen bg-[#faf7f2] pb-16">
      {/* Editor Header */}
      <div className="sticky top-0 z-30 bg-[#faf7f2]/95 backdrop-blur-md border-b border-amber-900/10 px-4 sm:px-6 py-3">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="px-3 py-1.5 bg-stone-200/80 hover:bg-stone-300 text-stone-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95"
            >
              <ArrowLeft className="w-4 h-4 text-amber-900" />
              К альбомам
            </button>

            <div>
              <h1 className="text-base sm:text-lg font-serif font-bold text-amber-950 line-clamp-1">
                {album.title}
              </h1>
              <p className="text-[11px] text-stone-500 font-sans">
                Редактор страниц и фотографий
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {saveStatus && (
              <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full animate-fade-in font-medium">
                ✓ {saveStatus}
              </span>
            )}

            <button
              onClick={onPreview}
              className="px-4 py-2 bg-amber-900 hover:bg-amber-950 active:scale-95 text-amber-50 rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all"
            >
              <Eye className="w-4 h-4" />
              Просмотр книги
            </button>
          </div>
        </div>
      </div>

      {/* Fullscreen Photo Lightbox Modal */}
      {previewPhoto && (
        <div className="fixed inset-0 z-50 bg-stone-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <button
            onClick={() => setPreviewPhoto(null)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-stone-800 text-stone-300 hover:text-white flex items-center justify-center transition-colors"
          >
            ✕
          </button>
          <div className="max-w-4xl w-full max-h-[90vh] flex flex-col items-center justify-center space-y-3">
            <img
              src={previewPhoto.dataUrl}
              alt={previewPhoto.caption || ''}
              className="max-h-[75vh] w-auto object-contain rounded-2xl shadow-2xl border border-stone-800"
            />
            {previewPhoto.caption && (
              <p className="text-stone-200 text-sm font-serif text-center font-semibold">
                {previewPhoto.caption}
              </p>
            )}
            {previewPhoto.date && (
              <p className="text-stone-400 text-xs">
                {previewPhoto.date}
              </p>
            )}
            {previewPhoto.memoryNote && (
              <p className="text-stone-300 text-xs italic text-center max-w-md">
                «{previewPhoto.memoryNote}»
              </p>
            )}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-6">
        {/* Editor Tabs Navigation */}
        <div className="flex items-center justify-between border-b border-stone-200 pb-3 mb-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('photos')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'photos'
                  ? 'bg-amber-900 text-amber-50 shadow-sm'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              1. Фотогалерея ({photos.length})
            </button>

            <button
              onClick={() => setActiveTab('pages')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'pages'
                  ? 'bg-amber-900 text-amber-50 shadow-sm'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              <Layout className="w-4 h-4" />
              2. Верстка страниц ({pages.length})
            </button>
          </div>

          {/* Upload photos button */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              {isUploading ? 'Загрузка...' : 'Добавить фото с устройства'}
            </button>
          </div>
        </div>

        {uploadError && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center justify-between">
            <span>⚠️ {uploadError}</span>
            <button onClick={() => setUploadError(null)} className="text-rose-500 hover:text-rose-800 font-bold ml-2">✕</button>
          </div>
        )}

        {/* TAB 1: PHOTOS GALLERY & DRAG REORDERING */}
        {activeTab === 'photos' && (
          <div
            onDragOver={handleDragOverArea}
            onDragLeave={handleDragLeaveArea}
            onDrop={handleDropArea}
            className={`space-y-6 rounded-3xl transition-all ${
              isDragOverArea ? 'ring-4 ring-amber-500/50 bg-amber-50/50 p-2' : ''
            }`}
          >
            <div className="bg-amber-900/5 border border-amber-900/10 rounded-2xl p-4 text-xs text-amber-950 flex items-center justify-between">
              <span>
                💡 <strong>Совет:</strong> Перетащите сюда файлы (Drag & Drop) или выберите их кнопкой выше. Поддерживаются JPG, PNG и WebP.
              </span>
            </div>

            {photos.length === 0 ? (
              <div className={`bg-white border-2 border-dashed rounded-3xl p-10 text-center transition-colors ${
                isDragOverArea ? 'border-amber-500 bg-amber-50' : 'border-stone-200'
              }`}>
                <ImageIcon className="w-12 h-12 text-stone-400 mx-auto mb-3" />
                <h3 className="text-base font-serif font-bold text-stone-800 mb-1">
                  Фотографии ещё не добавлены
                </h3>
                <p className="text-xs text-stone-500 mb-4">
                  Загрузите свои любимые снимки с компьютера или телефона или просто перетащите их сюда.
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2.5 bg-amber-900 text-amber-50 font-semibold text-xs rounded-xl shadow-md transition-all active:scale-95 inline-flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Выбрать файлы
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {photos.map((photo, index) => (
                  <div
                    key={photo.id}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`bg-white border rounded-2xl p-4 shadow-xs hover:shadow-md transition-all flex gap-4 relative group ${
                      draggedPhotoIdx === index ? 'opacity-40 border-amber-500' : 'border-stone-200'
                    }`}
                  >
                    {/* Drag Handle & Order Badge */}
                    <div className="flex flex-col items-center justify-between py-1 text-stone-400">
                      <div className="cursor-grab active:cursor-grabbing p-1 hover:text-amber-800">
                        <GripVertical className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded-full">
                        #{index + 1}
                      </span>
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => movePhoto(index, index - 1)}
                          disabled={index === 0}
                          className="text-[10px] p-0.5 hover:text-amber-800 disabled:opacity-20"
                          title="Поднять выше"
                        >
                          ▲
                        </button>
                        <button
                          onClick={() => movePhoto(index, index + 1)}
                          disabled={index === photos.length - 1}
                          className="text-[10px] p-0.5 hover:text-amber-800 disabled:opacity-20"
                          title="Опустить ниже"
                        >
                          ▼
                        </button>
                      </div>
                    </div>

                    {/* Image Preview Thumbnail */}
                    <div
                      onClick={() => setPreviewPhoto(photo)}
                      className="w-28 h-28 rounded-xl bg-stone-100 border border-stone-200 overflow-hidden shrink-0 relative cursor-pointer group/img"
                      title="Кликните для полноэкранного просмотра"
                    >
                      <img
                        src={photo.dataUrl}
                        alt={photo.caption || 'Фотография'}
                        className="w-full h-full object-cover group-hover/img:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                        <Eye className="w-5 h-5 text-white drop-shadow-md" />
                      </div>
                    </div>

                    {/* Photo Details Form */}
                    <div className="flex-1 space-y-2">
                      <div>
                        <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-0.5">
                          Подпись к фото
                        </label>
                        <input
                          type="text"
                          value={photo.caption || ''}
                          onChange={(e) => handleUpdatePhoto(photo.id, { caption: e.target.value })}
                          placeholder="Добавьте подпись..."
                          className="w-full text-xs px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:bg-white focus:ring-1 focus:ring-amber-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-0.5 flex items-center gap-1">
                            <Calendar className="w-2.5 h-2.5" /> Дата
                          </label>
                          <input
                            type="date"
                            value={photo.date || ''}
                            onChange={(e) => handleUpdatePhoto(photo.id, { date: e.target.value })}
                            className="w-full text-[11px] px-2 py-1 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-0.5 flex items-center gap-1">
                            <MessageSquare className="w-2.5 h-2.5" /> Воспоминание
                          </label>
                          <input
                            type="text"
                            value={photo.memoryNote || ''}
                            onChange={(e) => handleUpdatePhoto(photo.id, { memoryNote: e.target.value })}
                            placeholder="Заметка..."
                            className="w-full text-[11px] px-2 py-1 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:bg-white"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-end pt-1">
                        <button
                          onClick={() => handleDeletePhoto(photo.id)}
                          className="text-[11px] text-rose-600 hover:text-rose-800 flex items-center gap-1 font-medium hover:underline"
                        >
                          <Trash2 className="w-3 h-3" /> Удалить
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PAGE LAYOUTS & STICKERS */}
        {activeTab === 'pages' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Sidebar: Pages Pagination & Layout Selector */}
            <div className="lg:col-span-4 space-y-5">
              {/* Pages Manager */}
              <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                    Страницы альбома ({pages.length})
                  </h3>
                  <button
                    onClick={handleAddPage}
                    className="px-2.5 py-1 bg-amber-900 text-amber-50 rounded-lg text-xs font-semibold flex items-center gap-1 active:scale-95 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" /> Добавить
                  </button>
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-2">
                  {pages.map((pg, idx) => (
                    <button
                      key={pg.id}
                      onClick={() => setActivePageIdx(idx)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 border transition-all ${
                        activePageIdx === idx
                          ? 'bg-amber-900 text-amber-50 border-amber-900 shadow-xs'
                          : 'bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200'
                      }`}
                    >
                      Стр. {idx + 1}
                    </button>
                  ))}
                </div>

                {currentPage && (
                  <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                    <span>Текущая: Страница {activePageIdx + 1}</span>
                    <button
                      onClick={() => handleDeletePage(activePageIdx)}
                      className="text-rose-600 hover:text-rose-800 font-medium flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Удалить стр.
                    </button>
                  </div>
                )}
              </div>

              {/* Page Layout Selector */}
              {currentPage && (
                <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                    Макет страницы
                  </h3>

                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'single', name: '1 Крупное фото' },
                      { id: 'grid-2', name: '2 Фото (Сетка)' },
                      { id: 'collage-3', name: '3 Фото (Коллаж)' },
                      { id: 'polaroid', name: 'Polaroid кадр' },
                      { id: 'hero-text', name: 'Фото + История' },
                    ].map((l) => (
                      <button
                        key={l.id}
                        onClick={() =>
                          updatePageInState({ ...currentPage, layout: l.id as LayoutType })
                        }
                        className={`p-2.5 rounded-xl text-xs font-medium border text-left transition-all ${
                          currentPage.layout === l.id
                            ? 'bg-amber-900/10 border-amber-800 text-amber-950 font-bold'
                            : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                        }`}
                      >
                        {l.name}
                      </button>
                    ))}
                  </div>

                  {/* Title & Story text */}
                  <div className="space-y-2 pt-2">
                    <div>
                      <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">
                        Заголовок страницы
                      </label>
                      <input
                        type="text"
                        value={currentPage.title || ''}
                        onChange={(e) =>
                          updatePageInState({ ...currentPage, title: e.target.value })
                        }
                        placeholder="Название для страницы..."
                        className="w-full text-xs px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">
                        Текст истории
                      </label>
                      <textarea
                        rows={2}
                        value={currentPage.storyText || ''}
                        onChange={(e) =>
                          updatePageInState({ ...currentPage, storyText: e.target.value })
                        }
                        placeholder="Расскажите короткую историю..."
                        className="w-full text-xs px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:bg-white resize-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Decorative Stickers Picker */}
              {currentPage && (
                <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2 flex items-center gap-1.5">
                    <Smile className="w-4 h-4 text-amber-600" /> Декоративные стикеры
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_STICKERS.map((st, i) => (
                      <button
                        key={i}
                        onClick={() => handleAddSticker(activePageIdx, st.emoji)}
                        className="w-9 h-9 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 flex items-center justify-center text-lg active:scale-90 transition-transform"
                        title={st.label}
                      >
                        {st.emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Select Photos for Page */}
              {currentPage && (
                <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                    Выберите фото для страницы ({currentPage.photoIds.length}/3)
                  </h3>
                  <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1">
                    {photos.map((p) => {
                      const selected = currentPage.photoIds.includes(p.id);
                      return (
                        <div
                          key={p.id}
                          onClick={() => handleTogglePhotoInPage(activePageIdx, p.id)}
                          className={`aspect-square rounded-xl overflow-hidden relative cursor-pointer border-2 transition-all ${
                            selected ? 'border-amber-800 scale-95 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img src={p.dataUrl} alt="" className="w-full h-full object-cover" />
                          {selected && (
                            <div className="absolute inset-0 bg-amber-900/40 flex items-center justify-center">
                              <Check className="w-5 h-5 text-white" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Right Canvas: Live Interactive Page Canvas */}
            <div className="lg:col-span-8">
              {currentPage && (
                <div className="bg-white border-2 border-amber-900/10 rounded-3xl p-6 sm:p-8 shadow-xl relative min-h-[500px] flex flex-col justify-between overflow-hidden">
                  {/* Page Title & Story Header */}
                  {(currentPage.title || currentPage.storyText) && (
                    <div className="mb-6 text-center max-w-lg mx-auto">
                      {currentPage.title && (
                        <h2 className="text-xl sm:text-2xl font-serif font-bold text-amber-950 mb-1">
                          {currentPage.title}
                        </h2>
                      )}
                      {currentPage.storyText && (
                        <p className="text-xs sm:text-sm text-stone-600 font-serif italic">
                          «{currentPage.storyText}»
                        </p>
                      )}
                    </div>
                  )}

                  {/* Render Photos according to Layout */}
                  <div className="flex-1 flex items-center justify-center relative">
                    {currentPage.photoIds.length === 0 ? (
                      <div className="text-center text-stone-400 py-12">
                        <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-40" />
                        <p className="text-xs font-medium">
                          Выберите фотографии в панели слева для наполнения этой страницы
                        </p>
                      </div>
                    ) : currentPage.layout === 'polaroid' ? (
                      /* Polaroid Frame Layout */
                      <div className="flex flex-wrap items-center justify-center gap-6">
                        {currentPage.photoIds.map((pid) => {
                          const ph = photos.find((p) => p.id === pid);
                          if (!ph) return null;
                          return (
                            <div
                              key={ph.id}
                              className="bg-stone-50 border border-stone-200 p-3 pb-8 rounded-sm shadow-md rotate-[-2deg] hover:rotate-0 transition-transform max-w-[280px]"
                            >
                              <div className="aspect-square bg-stone-200 rounded-xs overflow-hidden mb-3">
                                <img src={ph.dataUrl} alt="" className="w-full h-full object-cover" />
                              </div>
                              <p className="text-center font-serif text-xs text-stone-800 font-semibold line-clamp-1">
                                {ph.caption || 'Наше воспоминание'}
                              </p>
                              {ph.date && (
                                <p className="text-center text-[10px] text-stone-400 mt-0.5">
                                  {ph.date}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : currentPage.layout === 'single' ? (
                      /* Single Large Photo */
                      <div className="w-full max-w-lg mx-auto">
                        {currentPage.photoIds.slice(0, 1).map((pid) => {
                          const ph = photos.find((p) => p.id === pid);
                          if (!ph) return null;
                          return (
                            <div key={ph.id} className="rounded-2xl overflow-hidden shadow-lg border border-stone-200">
                              <img src={ph.dataUrl} alt="" className="w-full max-h-[380px] object-cover" />
                              {ph.caption && (
                                <div className="p-3 bg-stone-50 text-center text-xs text-stone-700 font-medium">
                                  {ph.caption}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : currentPage.layout === 'hero-text' ? (
                      /* Hero + Text Story Layout */
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center w-full">
                        {currentPage.photoIds.slice(0, 2).map((pid) => {
                          const ph = photos.find((p) => p.id === pid);
                          if (!ph) return null;
                          return (
                            <div key={ph.id} className="bg-stone-50 p-2.5 rounded-2xl border border-stone-200 shadow-sm">
                              <div className="aspect-[4/3] rounded-xl overflow-hidden mb-2">
                                <img src={ph.dataUrl} alt="" className="w-full h-full object-cover" />
                              </div>
                              <p className="text-xs font-semibold text-stone-800 line-clamp-1">{ph.caption}</p>
                              {ph.memoryNote && (
                                <p className="text-[11px] text-stone-500 italic mt-0.5 line-clamp-2">
                                  {ph.memoryNote}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      /* Grid / Collage Layout */
                      <div className={`grid gap-4 w-full ${currentPage.photoIds.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                        {currentPage.photoIds.map((pid) => {
                          const ph = photos.find((p) => p.id === pid);
                          if (!ph) return null;
                          return (
                            <div key={ph.id} className="rounded-2xl overflow-hidden border border-stone-200 shadow-sm bg-stone-50 p-2">
                              <div className="aspect-[4/3] rounded-xl overflow-hidden">
                                <img src={ph.dataUrl} alt="" className="w-full h-full object-cover" />
                              </div>
                              {ph.caption && (
                                <p className="text-center text-xs font-medium text-stone-700 mt-2 line-clamp-1">
                                  {ph.caption}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Render Page Stickers */}
                    {currentPage.stickers.map((st) => (
                      <div
                        key={st.id}
                        style={{
                          left: `${st.x}%`,
                          top: `${st.y}%`,
                          transform: `rotate(${st.rotate || 0}deg) scale(${st.scale || 1})`,
                        }}
                        className="absolute z-20 cursor-pointer group hover:scale-125 transition-transform"
                      >
                        <span className="text-3xl select-none drop-shadow-sm">{st.emoji}</span>
                        <button
                          onClick={() => handleRemoveSticker(activePageIdx, st.id)}
                          className="hidden group-hover:block absolute -top-2 -right-2 bg-rose-600 text-white rounded-full p-0.5 text-[9px]"
                          title="Удалить стикер"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Page Footer */}
                  <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-400 font-sans">
                    <span>Наши моменты</span>
                    <span>Страница {activePageIdx + 1} из {pages.length}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
