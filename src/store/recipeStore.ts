import { create } from 'zustand';
import { Recipe } from '../types';
import { getAllRecipes, addRecipe, updateRecipe, deleteRecipe, initializeRecipeDatabase } from '../db/recipeConfig';

// Initialize database when the store is created
initializeRecipeDatabase().catch(console.error);

interface RecipeState {
    recipes: Recipe[];
    loading: boolean;
    error: string | null;
    filters: {
        searchTerm?: string;
    };
    fetchRecipes: () => Promise<void>;
    addRecipe: (recipe: Recipe) => Promise<void>;
    updateRecipe: (recipe: Recipe) => Promise<void>;
    deleteRecipe: (id: string) => Promise<void>;
    setFilters: (filters: { searchTerm?: string }) => void;
    filteredRecipes: () => Recipe[];
}

export const useRecipeStore = create<RecipeState>((set, get) => {
    // Fetch recipes immediately when store is created
    setTimeout(() => {
        get().fetchRecipes().catch(console.error);
    }, 0);

    return {
        recipes: [],
        loading: false,
        error: null,
        filters: {},

        fetchRecipes: async () => {
            set({ loading: true, error: null });
            try {
                const recipes = await getAllRecipes();
                set({ recipes, loading: false });
            } catch (error) {
                console.error('Error fetching recipes:', error);
                set({ error: 'Erro ao carregar receitas', loading: false });
            }
        },

        addRecipe: async (recipe: Recipe) => {
            try {
                await addRecipe(recipe);
                await get().fetchRecipes();
            } catch (error) {
                console.error('Error adding recipe:', error);
                set({ error: 'Erro ao adicionar receita' });
            }
        },

        updateRecipe: async (recipe: Recipe) => {
            try {
                await updateRecipe(recipe);
                await get().fetchRecipes();
            } catch (error) {
                console.error('Error updating recipe:', error);
                set({ error: 'Erro ao atualizar receita' });
            }
        },

        deleteRecipe: async (id: string) => {
            try {
                await deleteRecipe(id);
                await get().fetchRecipes();
            } catch (error) {
                console.error('Error deleting recipe:', error);
                set({ error: 'Erro ao deletar receita' });
            }
        },

        setFilters: (filters) => {
            set({ filters });
        },

        filteredRecipes: () => {
            const { recipes, filters } = get();
            return recipes.filter(recipe => {
                const matchesSearch = !filters.searchTerm || 
                    recipe.name.toLowerCase().includes(filters.searchTerm.toLowerCase());
                return matchesSearch;
            }).sort((a, b) => a.name.localeCompare(b.name));
        },
    };
}); 