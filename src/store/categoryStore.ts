import { create } from 'zustand';
import { Category, getAllCategories, addCategory, updateCategory, deleteCategory } from '../db/categoryConfig';

interface CategoryState {
    categories: Category[];
    loading: boolean;
    error: string | null;
    fetchCategories: () => Promise<void>;
    addCategory: (name: string) => Promise<void>;
    updateCategory: (category: Category) => Promise<void>;
    deleteCategory: (id: string) => Promise<void>;
}

export const useCategoryStore = create<CategoryState>((set, get) => {
    // Fetch categories immediately when store is created
    setTimeout(() => {
        get().fetchCategories().catch(console.error);
    }, 0);

    return {
        categories: [],
        loading: false,
        error: null,

        fetchCategories: async () => {
            set({ loading: true, error: null });
            try {
                const categories = await getAllCategories();
                set({ categories, loading: false });
            } catch (error) {
                console.error('Error fetching categories:', error);
                set({ error: 'Erro ao carregar categorias', loading: false });
            }
        },

        addCategory: async (name: string) => {
            try {
                await addCategory({ name });
                await get().fetchCategories();
            } catch (error) {
                console.error('Error adding category:', error);
                set({ error: 'Erro ao adicionar categoria' });
            }
        },

        updateCategory: async (category: Category) => {
            try {
                await updateCategory(category);
                await get().fetchCategories();
            } catch (error) {
                console.error('Error updating category:', error);
                set({ error: 'Erro ao atualizar categoria' });
            }
        },

        deleteCategory: async (id: string) => {
            try {
                await deleteCategory(id);
                await get().fetchCategories();
            } catch (error) {
                console.error('Error deleting category:', error);
                set({ error: 'Erro ao deletar categoria' });
            }
        },
    };
}); 