import { FoodItem } from '../types';

const DB_NAME = 'freezerDB';
const STORE_NAME = 'foodItems';
const DB_VERSION = 3;

let db: IDBDatabase | null = null;

export async function initializeDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            db = request.result;
            resolve();
        };

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            
            // Criar ou manter a store de itens
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }

            // Criar ou manter a store de categorias
            if (!db.objectStoreNames.contains('categories')) {
                db.createObjectStore('categories', { keyPath: 'id' });
            }
            
            // Criar ou manter a store de receitas
            if (!db.objectStoreNames.contains('recipes')) {
                db.createObjectStore('recipes', { keyPath: 'id' });
            }
        };
    });
}

export async function getAllItems(): Promise<FoodItem[]> {
    if (!db) await initializeDatabase();
    return new Promise((resolve, reject) => {
        const transaction = db!.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
    });
}

export async function addItem(item: FoodItem): Promise<void> {
    if (!db) await initializeDatabase();
    return new Promise((resolve, reject) => {
        const transaction = db!.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.add(item);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
    });
}

export async function updateItem(item: FoodItem): Promise<void> {
    if (!db) await initializeDatabase();
    return new Promise((resolve, reject) => {
        const transaction = db!.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(item);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
    });
}

export async function deleteItem(id: string): Promise<void> {
    if (!db) await initializeDatabase();
    return new Promise((resolve, reject) => {
        const transaction = db!.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(id);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
    });
} 