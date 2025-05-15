import { create } from 'zustand';
import { FoodCategory, FoodItem } from '../types';
import { getAllItems, addItem, updateItem, deleteItem, initializeDatabase } from '../db/config';

// Initialize database when the store is created
initializeDatabase().catch(console.error);

interface FreezerState {
    items: FoodItem[];
    loading: boolean;
    error: string | null;
    filters: {
        searchTerm?: string;
        category?: string;
    };
    lastSelectedCategory: string;
    fetchItems: () => Promise<void>;
    addFoodItem: (item: FoodItem) => Promise<void>;
    updateFoodItem: (item: FoodItem) => Promise<void>;
    deleteFoodItem: (id: string) => Promise<void>;
    setFilters: (filters: { searchTerm?: string; category?: string }) => void;
    setLastSelectedCategory: (category: string) => void;
    filteredItems: () => FoodItem[];
}

export const useFreezerStore = create<FreezerState>((set, get) => {
    // Fetch items immediately when store is created
    setTimeout(() => {
        get().fetchItems().catch(console.error);
    }, 0);

    return {
        items: [],
        loading: false,
        error: null,
        filters: {},
        lastSelectedCategory: '',

        fetchItems: async () => {
            set({ loading: true, error: null });
            try {
                const items = await getAllItems();
                set({ items, loading: false });
            } catch (error) {
                console.error('Error fetching items:', error);
                set({ error: 'Erro ao carregar itens', loading: false });
            }
        },

        addFoodItem: async (item: FoodItem) => {
            try {
                await addItem(item);
                await get().fetchItems();
            } catch (error) {
                console.error('Error adding item:', error);
                set({ error: 'Erro ao adicionar item' });
            }
        },

        updateFoodItem: async (item: FoodItem) => {
            try {
                await updateItem(item);
                await get().fetchItems();
            } catch (error) {
                console.error('Error updating item:', error);
                set({ error: 'Erro ao atualizar item' });
            }
        },

        deleteFoodItem: async (id: string) => {
            try {
                await deleteItem(id);
                await get().fetchItems();
            } catch (error) {
                console.error('Error deleting item:', error);
                set({ error: 'Erro ao deletar item' });
            }
        },

        setFilters: (filters) => {
            set({ filters });
            if (filters.category) {
                set({ lastSelectedCategory: filters.category });
            }
        },

        setLastSelectedCategory: (category) => {
            set({ lastSelectedCategory: category });
        },

        filteredItems: () => {
            const { items, filters } = get();
            return items.filter(item => {
                const matchesSearch = !filters.searchTerm || 
                    item.name.toLowerCase().includes(filters.searchTerm.toLowerCase());
                const matchesCategory = !filters.category || 
                    item.category === filters.category;
                return matchesSearch && matchesCategory;
            });
        },
    };
}); 