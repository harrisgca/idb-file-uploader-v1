const DB_NAME = 'my-db';
const STORE_NAME = 'image-store';

export type TFile = {
  id?: number;
  name: string;
  type: string;
  data: File;
  dataUrl?: string;
};

const dbPromise = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = event => {
      const db = (event.target as IDBOpenDBRequest).result;
      db.createObjectStore(STORE_NAME, {keyPath: 'id', autoIncrement: true}).createIndex('name', 'name', {unique: true});
    };

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result as IDBDatabase);
  });

const saveImage = async (file: File): Promise<number> => {
  const db = await dbPromise();
  const transaction = db.transaction([STORE_NAME], 'readwrite');
  const objectStore = transaction.objectStore(STORE_NAME);

  return new Promise<number>((resolve, reject) => {
    const request = objectStore.add({name: file.name, type: file.type, data: file});

    request.onsuccess = () => {
      resolve(request.result as number);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};

const getAllImages = async (): Promise<TFile[]> => {
  const db = await dbPromise();
  const transaction = db.transaction([STORE_NAME], 'readonly');
  const objectStore = transaction.objectStore(STORE_NAME);

  return new Promise<TFile[]>((resolve, reject) => {
    const request = objectStore.getAll();

    request.onsuccess = () => {
      resolve(request.result as TFile[]);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};

const getImage = async (id: number): Promise<TFile> => {
  const db = await dbPromise();
  const transaction = db.transaction([STORE_NAME], 'readonly');
  const objectStore = transaction.objectStore(STORE_NAME);

  return new Promise<TFile>((resolve, reject) => {
    const request = objectStore.get(id);

    request.onsuccess = () => {
      resolve(request.result as TFile);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};

const deleteImage = async (id: number): Promise<void> => {
  const db = await dbPromise();
  const transaction = db.transaction([STORE_NAME], 'readwrite');
  const objectStore = transaction.objectStore(STORE_NAME);

  return new Promise<void>((resolve, reject) => {
    const request = objectStore.delete(id);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};

export {saveImage, getAllImages, getImage, deleteImage};
