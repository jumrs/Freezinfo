import { create } from 'zustand';

// Identificadores dos widgets disponíveis na página inicial
export type WidgetType = 'shopping-list' | 'search' | 'recent-items';

interface UserPreferencesState {
    // Ordem dos widgets na página inicial
    widgetOrder: WidgetType[];
    
    // Função para atualizar a ordem dos widgets
    updateWidgetOrder: (newOrder: WidgetType[]) => void;
    
    // Retorna às configurações padrão
    resetToDefault: () => void;
}

// Ordem padrão dos widgets
const DEFAULT_WIDGET_ORDER: WidgetType[] = ['shopping-list', 'search', 'recent-items'];

export const useUserPreferencesStore = create<UserPreferencesState>((set) => ({
    // Estado inicial - carregado do localStorage ou usa o padrão
    widgetOrder: loadWidgetOrderFromStorage() || DEFAULT_WIDGET_ORDER,
    
    // Atualiza a ordem dos widgets
    updateWidgetOrder: (newOrder) => {
        set({ widgetOrder: newOrder });
        saveWidgetOrderToStorage(newOrder);
    },
    
    // Função para resetar para as configurações padrão
    resetToDefault: () => {
        set({ widgetOrder: DEFAULT_WIDGET_ORDER });
        saveWidgetOrderToStorage(DEFAULT_WIDGET_ORDER);
    }
}));

// Funções auxiliares para gerenciar o armazenamento local
function loadWidgetOrderFromStorage(): WidgetType[] | null {
    try {
        const storedOrder = localStorage.getItem('widget_order');
        return storedOrder ? JSON.parse(storedOrder) : null;
    } catch (error) {
        console.error('Erro ao carregar preferências de widget:', error);
        return null;
    }
}

function saveWidgetOrderToStorage(order: WidgetType[]): void {
    try {
        localStorage.setItem('widget_order', JSON.stringify(order));
    } catch (error) {
        console.error('Erro ao salvar preferências de widget:', error);
    }
} 