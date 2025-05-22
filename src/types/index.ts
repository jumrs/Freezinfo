export enum FoodCategory {
    CALDOS = 'CALDOS',
    CARNES = 'CARNES',
    PRONTOS = 'PRONTOS',
    CONGELADOR = 'CONGELADOR',
    GAVETA = 'GAVETA'
}

export interface FoodItem {
    id: string;
    name: string;
    category: string;
    quantity: number;
    dateAdded: string;
    expirationDate?: string;
    location?: FreezerLocation;
    notes?: string;
}

export interface FreezerLocation {
    drawer: number;
    section: string;
}

export interface SearchFilters {
    category?: string;
    searchTerm?: string;
    drawer?: number;
}

export interface Recipe {
    id: string;
    name: string;
    ingredients: string[];
    instructions: string;
    prepTime?: number; // em minutos
    cookTime?: number; // em minutos
    servings?: number;
    dateAdded: string;
    notes?: string;
    image?: string; // URL da imagem ou base64
} 