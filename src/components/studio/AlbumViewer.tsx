import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  Edit3,
  Download,
  Share2,
  Calendar,
  BookOpen,
  Sparkles,
  Printer
} from 'lucide-react';
import { Album, Photo, AlbumPage } from '../../types/album';
import { albumStorage } from '../../services/albumStorage';
import { exportService } from '../../services/exportService';

interface AlbumViewerProps {
  albumId: string;
  onBack: () => void;
  onEdit: () => void;
}

export const AlbumViewer: React.FC<AlbumViewerProps> = ({
  albumId,
  onBack,
  onEdit,
}) => {
  const [album, setAlbum] = useState<Album | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [pages, setPages] = useState<AlbumPage[]>([]);
  const [currentPageIdx, setCurrentPageIdx] = useState(0);

  const [lightboxPhoto, setLightboxPhoto] = useState<Photo | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    loadAlbumData();
  }, [albumId]);

  const loadAlbumData = async () => {
    const loadedAlbum = await albumStorage.getAlbum(albumId);
    const loadedPhotos = await albumStorage.getPhotosByAlbum(albumId);
    const loadedPages = await albumStorage.getPagesByAlbum(albumId);

    setAlbum(loadedAlbum);
    setPhotos(loadedPhotos);
    setPages(loadedPages);
  };

  if (!album) {
    return <div className="p-12 text-center text-stone-500">Загрузка альбома...</div>;
  }

  const totalPages = pages.length;
  const currentPage = pages[currentPageIdx];

  const handleNextPage = () => {
    if (currentPageIdx < totalPages - 1) {
      setCurrentPageIdx(currentPageIdx + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPageIdx > 0) {
      setCurrentPageIdx(currentPageIdx - 1);
    }
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      await exportService.exportToPDF(album, pages, photos);
    } catch (err) {
      console.error('Export error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPNG = async () => {
    if (!currentPage) return;
    setIsExporting(true);
    try {
      await exportService.exportPageAsImage(album.title, currentPageIdx + 1);
    } catch (err) {
      console.error('Export error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f0e6] text-stone-900 pb-16 flex flex-col justify-between selection:bg-amber-200">
      {/* Header Bar */}
      <header className="sticky top-0 z-30 bg-[#f5f0e6]/90 backdrop-blur-md border-b border-amber-900/10 px-4 sm:px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="px-3.5 py-2 bg-stone-200/80 hover:bg-stone-300 text-stone-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95"
            >
              <ArrowLeft className="w-4 h-4 text-amber-900" />
              Все альбомы
            </button>

            <div>
              <h1 className="text-base sm:text-lg font-serif font-bold text-amber-950 line-clamp-1">
                {album.title}
              </h1>
              <p className="text-[11px] text-stone-500 font-sans">
                Цифровая фотокнига
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportPNG}
              disabled={isExporting}
              className="px-3 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
              title="Скачать страницу как изображение"
            >
              <Download className="w-3.5 h-3.5 text-amber-900" />
              <span className="hidden sm:inline">PNG</span>
            </button>

            <button
              onClick={handleExportPDF}
              disabled={isExporting}
              className="px-3.5 py-2 bg-amber-900 hover:bg-amber-950 text-amber-50 rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Печать / PDF</span>
            </button>

            <button
              onClick={onEdit}
              className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold border border-stone-300 flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Edit3 className="w-3.5 h-3.5 text-amber-800" />
              Редактор
            </button>
          </div>
        </div>
      </header>

      {/* Main Digital Photobook Viewer */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 my-8 flex-1 flex flex-col items-center justify-center w-full">
        {pages.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center max-w-md shadow-md border border-stone-200">
            <BookOpen className="w-12 h-12 text-stone-400 mx-auto mb-3" />
            <h3 className="text-lg font-serif font-bold text-stone-800 mb-2">
              В альбоме нет страниц
            </h3>
            <p className="text-xs text-stone-500 mb-6">
              Перейдите в редактор, чтобы добавить фотографии и создать первые страницы.
            </p>
            <button
              onClick={onEdit}
              className="px-5 py-2.5 bg-amber-900 text-amber-50 font-semibold text-xs rounded-xl shadow-md transition-all active:scale-95"
            >
              Перейти в редактор
            </button>
          </div>
        ) : (
          <div className="w-full space-y-6">
            {/* Book Display Frame */}
            <div
              id="printable-album-page"
              className="bg-white border-2 border-amber-900/10 rounded-3xl shadow-2xl p-6 sm:p-12 min-h-[520px] relative overflow-hidden flex flex-col justify-between transition-all duration-300 animate-fade-in"
            >
              {/* Decorative Book Spine Effect */}
              <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-amber-950/20 via-amber-900/5 to-transparent pointer-events-none" />

              {currentPage && (
                <>
                  {/* Page Title & Story Header */}
                  {(currentPage.title || currentPage.storyText) && (
                    <div className="text-center max-w-xl mx-auto mb-8">
                      {currentPage.title && (
                        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-amber-950 mb-2">
                          {currentPage.title}
                        </h2>
                      )}
                      {currentPage.storyText && (
                        <p className="text-sm sm:text-base text-stone-600 font-serif italic leading-relaxed">
                          «{currentPage.storyText}»
                        </p>
                      )}
                    </div>
                  )}

                  {/* Photos Grid according to layout */}
                  <div className="flex-1 flex items-center justify-center relative my-4">
                    {currentPage.layout === 'polaroid' ? (
                      /* Polaroid Frame Layout */
                      <div className="flex flex-wrap items-center justify-center gap-8">
                        {currentPage.photoIds.map((pid) => {
                          const ph = photos.find((p) => p.id === pid);
                          if (!ph) return null;
                          return (
                            <div
                              key={ph.id}
                              onClick={() => setLightboxPhoto(ph)}
                              className="bg-stone-50 border border-stone-200 p-4 pb-10 rounded-sm shadow-xl rotate-[-2deg] hover:rotate-0 hover:scale-105 transition-all duration-300 cursor-pointer max-w-[300px] group"
                            >
                              <div className="aspect-square bg-stone-200 overflow-hidden mb-3 relative">
                                <img src={ph.dataUrl} alt="" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-stone-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <Maximize2 className="w-6 h-6 text-white" />
                                </div>
                              </div>
                              <p className="text-center font-serif text-sm text-stone-800 font-bold line-clamp-1">
                                {ph.caption || 'Наше воспоминание'}
                              </p>
                              {ph.date && (
                                <p className="text-center text-xs text-stone-400 mt-1 flex items-center justify-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {ph.date}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : currentPage.layout === 'single' ? (
                      /* Single Large Photo */
                      <div className="w-full max-w-2xl mx-auto">
                        {currentPage.photoIds.slice(0, 1).map((pid) => {
                          const ph = photos.find((p) => p.id === pid);
                          if (!ph) return null;
                          return (
                            <div
                              key={ph.id}
                              onClick={() => setLightboxPhoto(ph)}
                              className="rounded-2xl overflow-hidden shadow-xl border border-stone-200 cursor-pointer group relative"
                            >
                              <img src={ph.dataUrl} alt="" className="w-full max-h-[440px] object-cover" />
                              <div className="absolute inset-0 bg-stone-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Maximize2 className="w-8 h-8 text-white" />
                              </div>
                              {ph.caption && (
                                <div className="p-4 bg-stone-50 text-center text-sm text-stone-800 font-serif font-semibold">
                                  {ph.caption}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : currentPage.layout === 'hero-text' ? (
                      /* Hero Text Story Layout */
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center w-full">
                        {currentPage.photoIds.slice(0, 2).map((pid) => {
                          const ph = photos.find((p) => p.id === pid);
                          if (!ph) return null;
                          return (
                            <div
                              key={ph.id}
                              onClick={() => setLightboxPhoto(ph)}
                              className="bg-stone-50 p-3 rounded-2xl border border-stone-200 shadow-md cursor-pointer group"
                            >
                              <div className="aspect-[4/3] rounded-xl overflow-hidden mb-3 relative">
                                <img src={ph.dataUrl} alt="" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-stone-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <Maximize2 className="w-6 h-6 text-white" />
                                </div>
                              </div>
                              <p className="text-sm font-serif font-bold text-stone-900">{ph.caption}</p>
                              {ph.memoryNote && (
                                <p className="text-xs text-stone-600 italic mt-1 leading-relaxed">
                                  «{ph.memoryNote}»
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      /* Grid & Collage Layout */
                      <div
                        className={`grid gap-6 w-full ${
                          currentPage.photoIds.length > 1 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'
                        }`}
                      >
                        {currentPage.photoIds.map((pid) => {
                          const ph = photos.find((p) => p.id === pid);
                          if (!ph) return null;
                          return (
                            <div
                              key={ph.id}
                              onClick={() => setLightboxPhoto(ph)}
                              className="rounded-2xl overflow-hidden border border-stone-200 shadow-md bg-stone-50 p-2.5 cursor-pointer group"
                            >
                              <div className="aspect-[4/3] rounded-xl overflow-hidden relative">
                                <img src={ph.dataUrl} alt="" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-stone-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <Maximize2 className="w-6 h-6 text-white" />
                                </div>
                              </div>
                              {ph.caption && (
                                <p className="text-center text-xs font-serif font-bold text-stone-800 mt-2.5">
                                  {ph.caption}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Stickers Display */}
                    {currentPage.stickers.map((st) => (
                      <div
                        key={st.id}
                        style={{
                          left: `${st.x}%`,
                          top: `${st.y}%`,
                          transform: `rotate(${st.rotate || 0}deg) scale(${st.scale || 1})`,
                        }}
                        className="absolute z-20 pointer-events-none drop-shadow-md"
                      >
                        <span className="text-4xl select-none">{st.emoji}</span>
                      </div>
                    ))}
                  </div>

                  {/* Page Footer */}
                  <div className="mt-8 pt-4 border-t border-stone-200/60 flex items-center justify-between text-xs text-stone-400 font-sans">
                    <span className="font-serif italic text-amber-900/60 font-semibold">Наши моменты</span>
                    <span>Страница {currentPageIdx + 1} из {totalPages}</span>
                  </div>
                </>
              )}
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center justify-between bg-white border border-stone-200 rounded-2xl p-3 shadow-xs">
              <button
                onClick={handlePrevPage}
                disabled={currentPageIdx === 0}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 disabled:opacity-30 disabled:pointer-events-none text-stone-800 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
                Предыдущая
              </button>

              <div className="flex items-center gap-1.5">
                {pages.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentPageIdx(idx)}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      currentPageIdx === idx
                        ? 'bg-amber-900 w-6'
                        : 'bg-stone-300 hover:bg-stone-400'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={handleNextPage}
                disabled={currentPageIdx === totalPages - 1}
                className="px-4 py-2 bg-amber-900 hover:bg-amber-950 disabled:opacity-30 disabled:pointer-events-none text-amber-50 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all shadow-xs"
              >
                Следующая
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Lightbox Full Size Photo View Modal */}
      {lightboxPhoto && (
        <div className="fixed inset-0 z-50 bg-stone-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <button
            onClick={() => setLightboxPhoto(null)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-stone-800 text-stone-300 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="max-w-4xl w-full max-h-[90vh] flex flex-col items-center justify-center space-y-4 p-2">
            <img
              src={lightboxPhoto.dataUrl}
              alt={lightboxPhoto.caption || ''}
              className="max-h-[75vh] w-auto object-contain rounded-2xl shadow-2xl border border-stone-800"
            />
            {lightboxPhoto.caption && (
              <p className="text-stone-200 text-base font-serif text-center font-semibold">
                {lightboxPhoto.caption}
              </p>
            )}
            {lightboxPhoto.memoryNote && (
              <p className="text-stone-400 text-xs italic text-center max-w-md">
                «{lightboxPhoto.memoryNote}»
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
