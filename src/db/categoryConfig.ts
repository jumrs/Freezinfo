import { FoodCategory } from '../types';

const DB_NAME = 'freezerDB';
const STORE_NAME = 'categories';
const DB_VERSION = 2;

let db: IDBDatabase | null = null;

export async function initializeCategoryDatabase(): Promise<void> {
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
            if (!db.objectStoreNames.contains('foodItems')) {
                db.createObjectStore('foodItems', { keyPath: 'id' });
            }

            // Criar ou manter a store de categorias
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                
                // Adicionar categorias padrão
                const defaultCategories = Object.values(FoodCategory).map(category => ({
                    id: category,
                    name: category,
                    isDefault: true
                }));

                // Adicionar cada categoria padrão
                defaultCategories.forEach(category => {
                    store.add(category);
                });
            }
        };
    });
}

export interface Category {
    id: string;
    name: string;
    isDefault?: boolean;
}

export async function getAllCategories(): Promise<Category[]> {
    if (!db) await initializeCategoryDatabase();
    return new Promise((resolve, reject) => {
        const transaction = db!.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
    });
}

export async function addCategory(category: Omit<Category, 'id'>): Promise<Category> {
    if (!db) await initializeCategoryDatabase();
    const newCategory: Category = {
        ...category,
        id: category.name.toUpperCase().replace(/\s+/g, '_')
    };

    return new Promise((resolve, reject) => {
        const transaction = db!.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        
        // Primeiro, verificar se já existe uma categoria com este ID
        const getRequest = store.get(newCategory.id);
        
        getRequest.onsuccess = () => {
            if (getRequest.result) {
                reject(new Error('Já existe uma categoria com este nome'));
                return;
            }

            // Se não existe, adicionar a nova categoria
            const addRequest = store.add(newCategory);
            addRequest.onerror = () => reject(addRequest.error);
            addRequest.onsuccess = () => resolve(newCategory);
        };
        
        getRequest.onerror = () => reject(getRequest.error);
    });
}

export async function updateCategory(category: Category): Promise<void> {
    if (!db) await initializeCategoryDatabase();
    return new Promise((resolve, reject) => {
        const transaction = db!.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(category);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
    });
}

export async function deleteCategory(id: string): Promise<void> {
    if (!db) await initializeCategoryDatabase();
    return new Promise((resolve, reject) => {
        const transaction = db!.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(id);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
    });
} 