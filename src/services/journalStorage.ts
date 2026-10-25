import { Answer, BrotherAudioRecord, JournalOwner, JournalPhoto, TimeCapsuleSnapshot } from '../types/journal';

const DB_NAME = 'DvaHarakteraDB';
const DB_VERSION = 2;

class JournalStorageService {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains('answers')) {
          const answerStore = db.createObjectStore('answers', { keyPath: 'id' });
          answerStore.createIndex('owner', 'owner', { unique: false });
          answerStore.createIndex('sectionId', 'sectionId', { unique: false });
        }

        if (!db.objectStoreNames.contains('photos')) {
          const photoStore = db.createObjectStore('photos', { keyPath: 'id' });
          photoStore.createIndex('owner', 'owner', { unique: false });
        }

        if (!db.objectStoreNames.contains('snapshots')) {
          const snapshotStore = db.createObjectStore('snapshots', { keyPath: 'id' });
          snapshotStore.createIndex('owner', 'owner', { unique: false });
        }

        if (!db.objectStoreNames.contains('audio')) {
          db.createObjectStore('audio', { keyPath: 'id' });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        console.error('IndexedDB DvaHarakteraDB error:', request.error);
        reject(request.error);
      };
    });

    return this.dbPromise;
  }

  // --- ANSWERS ---

  async getAnswersByOwner(owner: JournalOwner): Promise<Answer[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('answers', 'readonly');
      const store = tx.objectStore('answers');
      const index = store.index('owner');
      const request = index.getAll(owner);

      request.onsuccess = () => {
        resolve(request.result || []);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getAllAnswers(): Promise<Answer[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('answers', 'readonly');
      const store = tx.objectStore('answers');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async saveAnswer(answer: Answer): Promise<Answer> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('answers', 'readwrite');
      const store = tx.objectStore('answers');
      const request = store.put(answer);

      request.onsuccess = () => resolve(answer);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteAnswer(answerId: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('answers', 'readwrite');
      const store = tx.objectStore('answers');
      const request = store.delete(answerId);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // --- PHOTOS & DRAWINGS ---

  async getPhotosByOwner(owner: JournalOwner): Promise<JournalPhoto[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('photos', 'readonly');
      const store = tx.objectStore('photos');
      const index = store.index('owner');
      const request = index.getAll(owner);

      request.onsuccess = () => {
        const photos: JournalPhoto[] = request.result || [];
        photos.sort((a, b) => b.createdAt - a.createdAt);
        resolve(photos);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async savePhoto(photo: JournalPhoto): Promise<JournalPhoto> {
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

  // --- TIME CAPSULE SNAPSHOTS ---

  async getSnapshotsByOwner(owner: JournalOwner): Promise<TimeCapsuleSnapshot[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('snapshots', 'readonly');
      const store = tx.objectStore('snapshots');
      const index = store.index('owner');
      const request = index.getAll(owner);

      request.onsuccess = () => {
        const result: TimeCapsuleSnapshot[] = request.result || [];
        result.sort((a, b) => b.createdAt - a.createdAt);
        resolve(result);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getAllSnapshots(): Promise<TimeCapsuleSnapshot[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('snapshots', 'readonly');
      const store = tx.objectStore('snapshots');
      const request = store.getAll();

      request.onsuccess = () => {
        const result: TimeCapsuleSnapshot[] = request.result || [];
        result.sort((a, b) => b.createdAt - a.createdAt);
        resolve(result);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async saveSnapshot(snapshot: TimeCapsuleSnapshot): Promise<TimeCapsuleSnapshot> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('snapshots', 'readwrite');
      const store = tx.objectStore('snapshots');
      const request = store.put(snapshot);

      request.onsuccess = () => resolve(snapshot);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteSnapshot(snapshotId: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('snapshots', 'readwrite');
      const store = tx.objectStore('snapshots');
      const request = store.delete(snapshotId);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // --- BROTHER AUDIO RECORD ---

  async getBrotherAudio(): Promise<BrotherAudioRecord | null> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('audio', 'readonly');
      const store = tx.objectStore('audio');
      const request = store.get('brother_audio');

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async saveBrotherAudio(record: BrotherAudioRecord): Promise<BrotherAudioRecord> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('audio', 'readwrite');
      const store = tx.objectStore('audio');
      const request = store.put(record);

      request.onsuccess = () => resolve(record);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteBrotherAudio(): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('audio', 'readwrite');
      const store = tx.objectStore('audio');
      const request = store.delete('brother_audio');

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

export const journalStorage = new JournalStorageService();
