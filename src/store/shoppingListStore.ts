import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { ShoppingListItem } from '../types';

interface ShoppingListState {
    items: ShoppingListItem[];
    loading: boolean;
    error: string | null;
    fetchItems: () => Promise<void>;
    addItem: (item: Omit<ShoppingListItem, 'id' | 'dateAdded'>) => Promise<void>;
    updateItem: (id: string, updates: Partial<ShoppingListItem>) => Promise<void>;
    deleteItem: (id: string) => Promise<void>;
    toggleItemCheck: (id: string) => Promise<void>;
    clearCheckedItems: () => Promise<void>;
}

// Helper function to generate a current date string
const getCurrentDateString = (): string => {
    return new Date().toISOString();
};

export const useShoppingListStore = create<ShoppingListState>((set, get) => ({
    items: [],
    loading: false,
    error: null,

    fetchItems: async () => {
        set({ loading: true, error: null });
        try {
            // Retrieve items from local storage
            const storedItems = localStorage.getItem('shopping_list');
            const items = storedItems ? JSON.parse(storedItems) : [];
            set({ items, loading: false });
        } catch (error) {
            console.error('Error fetching shopping list items:', error);
            set({ error: 'Falha ao carregar a lista de compras', loading: false });
        }
    },

    addItem: async (item) => {
        set({ loading: true, error: null });
        try {
            const newItem: ShoppingListItem = {
                ...item,
                id: uuidv4(),
                dateAdded: getCurrentDateString(),
            };
            
            const updatedItems = [...get().items, newItem];
            localStorage.setItem('shopping_list', JSON.stringify(updatedItems));
            
            set({ items: updatedItems, loading: false });
        } catch (error) {
            console.error('Error adding shopping list item:', error);
            set({ error: 'Falha ao adicionar item', loading: false });
        }
    },

    updateItem: async (id, updates) => {
        set({ loading: true, error: null });
        try {
            const updatedItems = get().items.map(item => 
                item.id === id ? { ...item, ...updates } : item
            );
            
            localStorage.setItem('shopping_list', JSON.stringify(updatedItems));
            
            set({ items: updatedItems, loading: false });
        } catch (error) {
            console.error('Error updating shopping list item:', error);
            set({ error: 'Falha ao atualizar item', loading: false });
        }
    },

    deleteItem: async (id) => {
        set({ loading: true, error: null });
        try {
            const updatedItems = get().items.filter(item => item.id !== id);
            
            localStorage.setItem('shopping_list', JSON.stringify(updatedItems));
            
            set({ items: updatedItems, loading: false });
        } catch (error) {
            console.error('Error deleting shopping list item:', error);
            set({ error: 'Falha ao remover item', loading: false });
        }
    },

    toggleItemCheck: async (id) => {
        const item = get().items.find(i => i.id === id);
        if (item) {
            await get().updateItem(id, { checked: !item.checked });
        }
    },

    clearCheckedItems: async () => {
        set({ loading: true, error: null });
        try {
            const updatedItems = get().items.filter(item => !item.checked);
            
            localStorage.setItem('shopping_list', JSON.stringify(updatedItems));
            
            set({ items: updatedItems, loading: false });
        } catch (error) {
            console.error('Error clearing checked items:', error);
            set({ error: 'Falha ao remover itens comprados', loading: false });
        }
    }
})); 