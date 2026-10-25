import React, { useState, useEffect } from 'react';
import { Plus, BookOpen, Edit, Trash2, Heart, Sparkles, FolderPlus, MoreVertical, Calendar } from 'lucide-react';
import { Album, AlbumOwner, Photo } from '../../types/album';
import { albumStorage } from '../../services/albumStorage';

interface DashboardProps {
  activeOwner: AlbumOwner;
  onOpenEditor: (albumId: string) => void;
  onOpenViewer: (albumId: string) => void;
  onCreateAlbumClick: () => void;
  onEditAlbumClick: (album: Album) => void;
  onDeleteAlbum: (albumId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  activeOwner,
  onOpenEditor,
  onOpenViewer,
  onCreateAlbumClick,
  onEditAlbumClick,
  onDeleteAlbum,
}) => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [covers, setCovers] = useState<Record<string, string>>({});
  const [photoCounts, setPhotoCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  useEffect(() => {
    loadAlbums();
  }, [activeOwner]);

  const loadAlbums = async () => {
    setLoading(true);
    try {
      const ownerAlbums = await albumStorage.getAlbumsByOwner(activeOwner);
      setAlbums(ownerAlbums);

      // Fetch cover photos and counts
      const coverMap: Record<string, string> = {};
      const countMap: Record<string, number> = {};

      for (const album of ownerAlbums) {
        const photos = await albumStorage.getPhotosByAlbum(album.id);
        countMap[album.id] = photos.length;

        if (album.coverPhotoId) {
          const coverPhoto = photos.find((p) => p.id === album.coverPhotoId);
          if (coverPhoto) {
            coverMap[album.id] = coverPhoto.dataUrl;
          }
        }

        if (!coverMap[album.id] && photos.length > 0) {
          coverMap[album.id] = photos[0].dataUrl;
        }
      }

      setCovers(coverMap);
      setPhotoCounts(countMap);
    } catch (err) {
      console.error('Error loading albums:', err);
    } finally {
      setLoading(false);
    }
  };

  const ownerTitle = activeOwner === 'alizhan' ? 'Альбомы Алижан' : 'Альбомы Дильназ';
  const ownerSubtitle =
    activeOwner === 'alizhan'
      ? 'Личная коллекция особенных дней, приключений и воспоминаний Алижан.'
      : 'Личная коллекция светлых моментов, творческих дней и улыбок Дильназ.';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Space Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-100/80 via-[#fefbf6] to-rose-100/80 border border-amber-900/10 p-6 sm:p-8 mb-8 shadow-xs">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-900/10 text-amber-900 rounded-full text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Персональная фотостудия
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-amber-950">
              {ownerTitle}
            </h2>
            <p className="text-stone-600 text-xs sm:text-sm mt-1 max-w-xl">
              {ownerSubtitle}
            </p>
          </div>

          <button
            onClick={onCreateAlbumClick}
            className="shrink-0 flex items-center gap-2 px-5 py-3 bg-amber-900 hover:bg-amber-950 active:scale-95 text-amber-50 rounded-2xl font-semibold text-xs shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            Создать новый альбом
          </button>
        </div>
      </div>

      {/* Albums List */}
      {loading ? (
        <div className="py-16 text-center text-stone-500 text-sm">
          Загрузка альбомов...
        </div>
      ) : albums.length === 0 ? (
        /* Empty State */
        <div className="bg-white/80 border-2 border-dashed border-stone-200 rounded-3xl p-10 text-center max-w-md mx-auto my-12 shadow-xs">
          <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-amber-800">
            <FolderPlus className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-serif font-bold text-stone-800 mb-1">
            Здесь пока нет альбомов
          </h3>
          <p className="text-xs text-stone-500 mb-6">
            Создайте свой первый цифровой фотоальбом и наполните его тёплыми снимками!
          </p>
          <button
            onClick={onCreateAlbumClick}
            className="px-5 py-2.5 bg-amber-900 hover:bg-amber-950 text-amber-50 font-semibold text-xs rounded-xl shadow-md transition-all active:scale-95 inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Создать альбом
          </button>
        </div>
      ) : (
        /* Albums Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {albums.map((album) => {
            const coverUrl = covers[album.id];
            const count = photoCounts[album.id] || 0;
            const formattedDate = new Date(album.createdAt).toLocaleDateString('ru-RU', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            });

            return (
              <div
                key={album.id}
                className="group bg-white border border-stone-200/80 rounded-3xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                {/* Top Cover Image Area */}
                <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden cursor-pointer" onClick={() => onOpenViewer(album.id)}>
                  {coverUrl ? (
                    <img
                      src={coverUrl}
                      alt={album.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-stone-100 text-stone-400 p-4">
                      <BookOpen className="w-10 h-10 mb-2 opacity-50" />
                      <span className="text-xs font-sans">Нет фотографий</span>
                    </div>
                  )}

                  {/* Badges */}
                  <div className="absolute top-3 left-3 bg-stone-900/70 backdrop-blur-md text-amber-100 text-[11px] font-medium px-2.5 py-1 rounded-full flex items-center gap-1">
                    <BookOpen className="w-3 h-3" />
                    {count} {count === 1 ? 'фото' : count > 1 && count < 5 ? 'фотографий' : 'фотографий'}
                  </div>

                  {/* Menu Options Button */}
                  <div className="absolute top-3 right-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(activeMenuId === album.id ? null : album.id);
                      }}
                      className="w-8 h-8 rounded-full bg-stone-900/60 hover:bg-stone-900/80 text-white flex items-center justify-center backdrop-blur-md transition-all"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {/* Popover Menu */}
                    {activeMenuId === album.id && (
                      <div className="absolute right-0 mt-2 w-44 bg-white rounded-2xl shadow-xl border border-stone-200 py-1.5 z-20 text-xs">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(null);
                            onEditAlbumClick(album);
                          }}
                          className="w-full text-left px-3.5 py-2 text-stone-700 hover:bg-stone-100 flex items-center gap-2 font-medium"
                        >
                          <Edit className="w-3.5 h-3.5 text-amber-800" />
                          Параметры альбома
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(null);
                            if (confirm(`Удалить альбом "${album.title}"?`)) {
                              onDeleteAlbum(album.id);
                            }
                          }}
                          className="w-full text-left px-3.5 py-2 text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Удалить альбом
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Info Area */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-serif font-bold text-stone-900 mb-1 line-clamp-1">
                      {album.title}
                    </h3>
                    <p className="text-xs text-stone-500 line-clamp-2 min-h-[32px] leading-relaxed mb-3">
                      {album.description || 'Без описания'}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                    <div className="text-[11px] text-stone-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formattedDate}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onOpenEditor(album.id)}
                        className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold transition-all active:scale-95 flex items-center gap-1"
                      >
                        <Edit className="w-3 h-3 text-amber-800" />
                        Редактировать
                      </button>

                      <button
                        onClick={() => onOpenViewer(album.id)}
                        className="px-3.5 py-1.5 bg-amber-900 hover:bg-amber-950 text-amber-50 rounded-xl text-xs font-semibold shadow-xs transition-all active:scale-95 flex items-center gap-1"
                      >
                        <BookOpen className="w-3 h-3" />
                        Смотреть
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Quick Add Card */}
          <button
            onClick={onCreateAlbumClick}
            className="group aspect-[4/3] sm:aspect-auto bg-amber-900/5 hover:bg-amber-900/10 border-2 border-dashed border-amber-900/20 rounded-3xl p-6 flex flex-col items-center justify-center text-center transition-all duration-300 min-h-[260px]"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-900 text-amber-50 flex items-center justify-center mb-3 shadow-sm group-hover:scale-110 transition-transform">
              <Plus className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-serif font-bold text-amber-950 mb-1">
              Создать ещё один альбом
            </h4>
            <p className="text-xs text-stone-500 max-w-[200px]">
              Добавьте новые фотографии и истории
            </p>
          </button>
        </div>
      )}
    </div>
  );
};
