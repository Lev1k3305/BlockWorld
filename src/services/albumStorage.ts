import { Album, AlbumOwner, Photo, AlbumPage } from '../types/album';

const DB_NAME = 'NashiMomentyDB';
const DB_VERSION = 1;

class AlbumStorageService {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains('albums')) {
          const albumStore = db.createObjectStore('albums', { keyPath: 'id' });
          albumStore.createIndex('owner', 'owner', { unique: false });
        }

        if (!db.objectStoreNames.contains('photos')) {
          const photoStore = db.createObjectStore('photos', { keyPath: 'id' });
          photoStore.createIndex('albumId', 'albumId', { unique: false });
        }

        if (!db.objectStoreNames.contains('pages')) {
          const pageStore = db.createObjectStore('pages', { keyPath: 'id' });
          pageStore.createIndex('albumId', 'albumId', { unique: false });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        console.error('IndexedDB error:', request.error);
        reject(request.error);
      };
    });

    return this.dbPromise;
  }

  // --- ALBUMS ---

  async getAlbumsByOwner(owner: AlbumOwner): Promise<Album[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('albums', 'readonly');
      const store = tx.objectStore('albums');
      const index = store.index('owner');
      const request = index.getAll(owner);

      request.onsuccess = () => {
        const result: Album[] = request.result || [];
        result.sort((a, b) => b.updatedAt - a.updatedAt);
        resolve(result);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getAlbum(id: string): Promise<Album | null> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('albums', 'readonly');
      const store = tx.objectStore('albums');
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async saveAlbum(album: Album): Promise<Album> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('albums', 'readwrite');
      const store = tx.objectStore('albums');
      const request = store.put(album);

      request.onsuccess = () => resolve(album);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteAlbum(albumId: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['albums', 'photos', 'pages'], 'readwrite');

      // Delete album
      tx.objectStore('albums').delete(albumId);

      // Delete associated photos
      const photoStore = tx.objectStore('photos');
      const photoIndex = photoStore.index('albumId');
      const photoReq = photoIndex.openCursor(IDBKeyRange.only(albumId));
      photoReq.onsuccess = (e) => {
        const cursor = (e.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        }
      };

      // Delete associated pages
      const pageStore = tx.objectStore('pages');
      const pageIndex = pageStore.index('albumId');
      const pageReq = pageIndex.openCursor(IDBKeyRange.only(albumId));
      pageReq.onsuccess = (e) => {
        const cursor = (e.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        }
      };

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  // --- PHOTOS ---

  async getPhotosByAlbum(albumId: string): Promise<Photo[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('photos', 'readonly');
      const store = tx.objectStore('photos');
      const index = store.index('albumId');
      const request = index.getAll(albumId);

      request.onsuccess = () => {
        const result: Photo[] = request.result || [];
        result.sort((a, b) => a.order - b.order);
        resolve(result);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async savePhoto(photo: Photo): Promise<Photo> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('photos', 'readwrite');
      const store = tx.objectStore('photos');
      const request = store.put(photo);

      request.onsuccess = () => resolve(photo);
      request.onerror = () => reject(request.error);
    });
  }

  async deletePhoto(photoId: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('photos', 'readwrite');
      const store = tx.objectStore('photos');
      const request = store.delete(photoId);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async savePhotoOrder(albumId: string, photos: Photo[]): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('photos', 'readwrite');
      const store = tx.objectStore('photos');

      photos.forEach((photo, index) => {
        store.put({ ...photo, order: index });
      });

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  // --- PAGES ---

  async getPagesByAlbum(albumId: string): Promise<AlbumPage[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('pages', 'readonly');
      const store = tx.objectStore('pages');
      const index = store.index('albumId');
      const request = index.getAll(albumId);

      request.onsuccess = () => {
        const result: AlbumPage[] = request.result || [];
        result.sort((a, b) => a.pageNumber - b.pageNumber);
        resolve(result);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async savePage(page: AlbumPage): Promise<AlbumPage> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('pages', 'readwrite');
      const store = tx.objectStore('pages');
      const request = store.put(page);

      request.onsuccess = () => resolve(page);
      request.onerror = () => reject(request.error);
    });
  }

  async deletePage(pageId: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('pages', 'readwrite');
      const store = tx.objectStore('pages');
      const request = store.delete(pageId);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async savePages(pages: AlbumPage[]): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('pages', 'readwrite');
      const store = tx.objectStore('pages');

      pages.forEach((page, idx) => {
        store.put({ ...page, pageNumber: idx + 1 });
      });

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  // --- SEED SAMPLE DATA ---

  async seedDefaultAlbumsIfNeeded(): Promise<void> {
    const db = await this.getDB();
    const count = await new Promise<number>((resolve) => {
      const tx = db.transaction('albums', 'readonly');
      const store = tx.objectStore('albums');
      const req = store.count();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(0);
    });

    if (count > 0) return;

    // Generate cute SVG placeholder photos
    const createPlaceholderDataUrl = (title: string, color1: string, color2: string, symbol: string) => {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
        <defs>
          <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${color1}"/>
            <stop offset="100%" stop-color="${color2}"/>
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#g)"/>
        <circle cx="400" cy="250" r="120" fill="white" opacity="0.2"/>
        <text x="400" y="270" font-size="90" text-anchor="middle" dominant-baseline="middle">${symbol}</text>
        <text x="400" y="440" font-family="Georgia, serif" font-size="32" font-weight="bold" fill="white" text-anchor="middle">${title}</text>
      </svg>`;
      return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
    };

    const now = Date.now();

    // Alizhan's Albums
    const albumAlizhan1: Album = {
      id: 'alizhan-bday',
      owner: 'alizhan',
      title: 'Мой день рождения',
      description: 'Незабываемый праздник с тортом, друзьями и весёлыми играми!',
      createdAt: now - 86400000 * 5,
      updatedAt: now - 86400000 * 5,
    };

    const albumAlizhan2: Album = {
      id: 'alizhan-friends',
      owner: 'alizhan',
      title: 'С друзьями',
      description: 'Весёлые прогулки, забавные моменты и игры на свежем воздухе.',
      createdAt: now - 86400000 * 12,
      updatedAt: now - 86400000 * 12,
    };

    // Dilnaz's Albums
    const albumDilnaz1: Album = {
      id: 'dilnaz-family',
      owner: 'dilnaz',
      title: 'Семейные выходные',
      description: 'Теплые дни, проведенные вместе с любимой семьёй.',
      createdAt: now - 86400000 * 2,
      updatedAt: now - 86400000 * 2,
    };

    const albumDilnaz2: Album = {
      id: 'dilnaz-summer',
      owner: 'dilnaz',
      title: 'Наше лето',
      description: 'Яркое солнце, поездки и летние приключения!',
      createdAt: now - 86400000 * 30,
      updatedAt: now - 86400000 * 30,
    };

    // Save albums
    await this.saveAlbum(albumAlizhan1);
    await this.saveAlbum(albumAlizhan2);
    await this.saveAlbum(albumDilnaz1);
    await this.saveAlbum(albumDilnaz2);

    // Photos for Alizhan Birthday
    const p1: Photo = {
      id: 'photo-1',
      albumId: 'alizhan-bday',
      dataUrl: createPlaceholderDataUrl('Праздничный торт', '#f43f5e', '#fb923c', '🎂'),
      caption: 'Самый вкусный торт со свечами!',
      date: '2025-05-15',
      memoryNote: 'Мы загадали самое заветное желание перед тем, как задуть свечи.',
      order: 0,
      createdAt: now - 86400000 * 5,
    };

    const p2: Photo = {
      id: 'photo-2',
      albumId: 'alizhan-bday',
      dataUrl: createPlaceholderDataUrl('Подарки и сюрпризы', '#3b82f6', '#8b5cf6', '🎁'),
      caption: 'Море подарков и радостных улыбок',
      date: '2025-05-15',
      memoryNote: 'Дильназ подарила отличный альбом для рисунков.',
      order: 1,
      createdAt: now - 86400000 * 5,
    };

    const p3: Photo = {
      id: 'photo-3',
      albumId: 'alizhan-bday',
      dataUrl: createPlaceholderDataUrl('Игры с друзьями', '#10b981', '#06b6d4', '🎉'),
      caption: 'Весёлые конкурсы',
      date: '2025-05-15',
      memoryNote: 'Все смеялись до упаду!',
      order: 2,
      createdAt: now - 86400000 * 5,
    };

    await this.savePhoto(p1);
    await this.savePhoto(p2);
    await this.savePhoto(p3);

    // Update cover photo
    albumAlizhan1.coverPhotoId = p1.id;
    await this.saveAlbum(albumAlizhan1);

    // Pages for Alizhan Birthday
    const page1: AlbumPage = {
      id: 'page-1',
      albumId: 'alizhan-bday',
      pageNumber: 1,
      layout: 'polaroid',
      photoIds: [p1.id],
      title: 'День Рождения Алижана',
      storyText: 'Этот день был наполнен радостью, детским смехом и множеством сюрпризов!',
      stickers: [
        { id: 's1', emoji: '🎂', x: 80, y: 15, scale: 1.2, rotate: 10 },
        { id: 's2', emoji: '✨', x: 15, y: 75, scale: 1, rotate: -5 },
      ],
    };

    const page2: AlbumPage = {
      id: 'page-2',
      albumId: 'alizhan-bday',
      pageNumber: 2,
      layout: 'grid-2',
      photoIds: [p2.id, p3.id],
      title: 'Подарки и друзья',
      storyText: 'Друзья принесли потрясающие подарки и отличное настроение.',
      stickers: [
        { id: 's3', emoji: '🎈', x: 85, y: 80, scale: 1.1, rotate: 12 },
        { id: 's4', emoji: '💖', x: 10, y: 10, scale: 0.9, rotate: -8 },
      ],
    };

    await this.savePage(page1);
    await this.savePage(page2);

    // Photos for Dilnaz Family
    const pd1: Photo = {
      id: 'photo-d1',
      albumId: 'dilnaz-family',
      dataUrl: createPlaceholderDataUrl('Пикник в парке', '#ec4899', '#f43f5e', '🌸'),
      caption: 'Солнечный день в парке',
      date: '2025-04-20',
      memoryNote: 'Мы запускали воздушного змея и пили вкусный чай.',
      order: 0,
      createdAt: now - 86400000 * 2,
    };

    const pd2: Photo = {
      id: 'photo-d2',
      albumId: 'dilnaz-family',
      dataUrl: createPlaceholderDataUrl('Прогулка с семьей', '#10b981', '#f59e0b', '☀️'),
      caption: 'Теплые моменты',
      date: '2025-04-20',
      memoryNote: 'Делали красивое семейное фото.',
      order: 1,
      createdAt: now - 86400000 * 2,
    };

    await this.savePhoto(pd1);
    await this.savePhoto(pd2);

    albumDilnaz1.coverPhotoId = pd1.id;
    await this.saveAlbum(albumDilnaz1);

    const pageD1: AlbumPage = {
      id: 'page-d1',
      albumId: 'dilnaz-family',
      pageNumber: 1,
      layout: 'grid-2',
      photoIds: [pd1.id, pd2.id],
      title: 'Семейные выходные',
      storyText: 'Самые драгоценные моменты всегда связаны с нашей родной семьёй.',
      stickers: [
        { id: 'sd1', emoji: '🌸', x: 88, y: 12, scale: 1.1, rotate: 15 },
        { id: 'sd2', emoji: '☀️', x: 12, y: 85, scale: 1.2, rotate: -10 },
      ],
    };

    await this.savePage(pageD1);
  }
}

export const albumStorage = new AlbumStorageService();
