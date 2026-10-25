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

  // --- CLEAR DEMO SEED DATA IF PRESENT ---

  async clearDemoSeedDataIfNeeded(): Promise<void> {
    const demoAlbumIds = ['alizhan-bday', 'alizhan-friends', 'dilnaz-family', 'dilnaz-summer'];
    for (const demoId of demoAlbumIds) {
      const album = await this.getAlbum(demoId);
      if (album) {
        await this.deleteAlbum(demoId);
      }
    }
  }
}

export const albumStorage = new AlbumStorageService();
