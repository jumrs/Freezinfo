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
    category: FoodCategory;
    quantity: number;
    dateAdded: string;
    expirationDate?: string;
    location: FreezerLocation;
    notes?: string;
}

export interface FreezerLocation {
    drawer: number;
    section: string;
}

export interface SearchFilters {
    category?: FoodCategory;
    searchTerm?: string;
    drawer?: number;
} 