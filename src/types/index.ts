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