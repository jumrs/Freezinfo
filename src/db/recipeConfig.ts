import { Recipe } from '../types';

const DB_NAME = 'freezerDB';
const STORE_NAME = 'recipes';
const DB_VERSION = 3; // Increased version to add recipes store

let db: IDBDatabase | null = null;

export async function initializeRecipeDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            db = request.result;
            resolve();
        };

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            
            // Manter stores existentes
            if (!db.objectStoreNames.contains('foodItems')) {
                db.createObjectStore('foodItems', { keyPath: 'id' });
            }

            if (!db.objectStoreNames.contains('categories')) {
                db.createObjectStore('categories', { keyPath: 'id' });
            }

            // Criar store de receitas
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        };
    });
}

export async function getAllRecipes(): Promise<Recipe[]> {
    if (!db) await initializeRecipeDatabase();
    return new Promise((resolve, reject) => {
        const transaction = db!.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
    });
}

export async function getRecipeById(id: string): Promise<Recipe | undefined> {
    if (!db) await initializeRecipeDatabase();
    return new Promise((resolve, reject) => {
        const transaction = db!.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(id);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
    });
}

export async function addRecipe(recipe: Recipe): Promise<void> {
    if (!db) await initializeRecipeDatabase();
    return new Promise((resolve, reject) => {
        const transaction = db!.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.add(recipe);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
    });
}

export async function updateRecipe(recipe: Recipe): Promise<void> {
    if (!db) await initializeRecipeDatabase();
    return new Promise((resolve, reject) => {
        const transaction = db!.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(recipe);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
    });
}

export async function deleteRecipe(id: string): Promise<void> {
    if (!db) await initializeRecipeDatabase();
    return new Promise((resolve, reject) => {
        const transaction = db!.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(id);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
    });
} 