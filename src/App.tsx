import React, { useState, useEffect } from 'react';
import { Header } from './components/studio/Header';
import { Dashboard } from './components/studio/Dashboard';
import { AlbumModal } from './components/studio/AlbumModal';
import { AlbumEditor } from './components/studio/AlbumEditor';
import { AlbumViewer } from './components/studio/AlbumViewer';
import { Album, AlbumOwner } from './types/album';
import { albumStorage } from './services/albumStorage';

type ViewMode = 'dashboard' | 'editor' | 'viewer';

export default function App() {
  const [activeOwner, setActiveOwner] = useState<AlbumOwner>('alizhan');
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState<Album | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    initApp();
  }, []);

  const initApp = async () => {
    try {
      await albumStorage.seedDefaultAlbumsIfNeeded();
    } catch (err) {
      console.error('Error initializing DB:', err);
    } finally {
      setIsInitialized(true);
    }
  };

  const handleCreateAlbumClick = () => {
    setEditingAlbum(null);
    setIsModalOpen(true);
  };

  const handleEditAlbumClick = (album: Album) => {
    setEditingAlbum(album);
    setIsModalOpen(true);
  };

  const handleSaveAlbum = async (albumData: Partial<Album>, coverFile?: File) => {
    const now = Date.now();
    let coverPhotoId = albumData.coverPhotoId;

    // Handle new cover file if uploaded in modal
    if (coverFile) {
      const reader = new FileReader();
      const dataUrl = await new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(coverFile);
      });

      const photoId = `cover-${Date.now()}`;
      const albumId = albumData.id || `album-${Date.now()}`;

      await albumStorage.savePhoto({
        id: photoId,
        albumId,
        dataUrl,
        caption: 'Обложка альбома',
        order: 0,
        createdAt: now,
      });

      coverPhotoId = photoId;
    }

    const albumToSave: Album = {
      id: albumData.id || `album-${Date.now()}`,
      owner: albumData.owner || activeOwner,
      title: albumData.title || 'Новый альбом',
      description: albumData.description || '',
      coverPhotoId,
      createdAt: albumData.createdAt || now,
      updatedAt: now,
    };

    await albumStorage.saveAlbum(albumToSave);
  };

  const handleDeleteAlbum = async (albumId: string) => {
    await albumStorage.deleteAlbum(albumId);
    if (selectedAlbumId === albumId) {
      setSelectedAlbumId(null);
      setViewMode('dashboard');
    }
  };

  const handleOpenEditor = (albumId: string) => {
    setSelectedAlbumId(albumId);
    setViewMode('editor');
  };

  const handleOpenViewer = (albumId: string) => {
    setSelectedAlbumId(albumId);
    setViewMode('viewer');
  };

  const handleGoHome = () => {
    setSelectedAlbumId(null);
    setViewMode('dashboard');
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-[#faf7f2] flex items-center justify-center font-sans text-stone-600">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-amber-800 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-serif">Загрузка персональной фотостудии...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf7f2] font-sans text-stone-800 selection:bg-amber-200">
      {/* Top Header Navigation */}
      <Header
        activeOwner={activeOwner}
        onOwnerChange={(owner) => {
          setActiveOwner(owner);
          if (viewMode !== 'dashboard') {
            setViewMode('dashboard');
          }
        }}
        onGoHome={handleGoHome}
        isHome={viewMode === 'dashboard'}
      />

      {/* Main Dashboard View */}
      {viewMode === 'dashboard' && (
        <Dashboard
          activeOwner={activeOwner}
          onOpenEditor={handleOpenEditor}
          onOpenViewer={handleOpenViewer}
          onCreateAlbumClick={handleCreateAlbumClick}
          onEditAlbumClick={handleEditAlbumClick}
          onDeleteAlbum={handleDeleteAlbum}
        />
      )}

      {/* Photo Album Editor View */}
      {viewMode === 'editor' && selectedAlbumId && (
        <AlbumEditor
          albumId={selectedAlbumId}
          onBack={handleGoHome}
          onPreview={() => setViewMode('viewer')}
        />
      )}

      {/* Photobook Album Viewer View */}
      {viewMode === 'viewer' && selectedAlbumId && (
        <AlbumViewer
          albumId={selectedAlbumId}
          onBack={handleGoHome}
          onEdit={() => setViewMode('editor')}
        />
      )}

      {/* Create / Edit Album Modal */}
      <AlbumModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveAlbum}
        initialAlbum={editingAlbum}
        activeOwner={activeOwner}
      />
    </div>
  );
}
