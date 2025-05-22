import React, { useState, useEffect, useMemo } from 'react';
import {
    Box,
    Container,
    Grid,
    Paper,
    Typography,
    TextField,
    IconButton,
    ButtonBase,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Chip,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
} from '@mui/material';
import { Search as SearchIcon, ArrowBack as ArrowBackIcon, CheckCircle as CheckCircleIcon, Cancel as CancelIcon, ShoppingCart as ShoppingCartIcon, Add as AddIcon } from '@mui/icons-material';
import { useRecipeStore } from '../store/recipeStore';
import { useFreezerStore } from '../store/freezerStore';
import { useShoppingListStore } from '../store/shoppingListStore';
import { Recipe, Ingredient } from '../types';
import { RecipeForm } from './RecipeForm';

interface RecipeListProps {
    onBack: () => void;
}

// Componentes reutilizáveis
const RecipeTimeChip: React.FC<{label: string; minutes?: number; variant?: "outlined" | "filled"; color?: "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"}> = 
    ({label, minutes, variant = "outlined", color = "default"}) => {
    
    const formatTime = (mins?: number): string => {
        if (mins === undefined || mins === null) return '';
        const hours = Math.floor(mins / 60);
        const remainingMins = mins % 60;
        
        return hours > 0
            ? `${hours}h${remainingMins > 0 ? ` ${remainingMins}min` : ''}`
            : `${remainingMins}min`;
    };

    return (
        <Chip 
            label={`${label}: ${formatTime(minutes)}`} 
            size="small"
            variant={variant}
            color={color}
        />
    );
};

const IngredientListItem: React.FC<{ingredient: Ingredient; freezerItems: any[]; onAddToShoppingList: (ingredient: Ingredient) => void}> = 
    ({ingredient, freezerItems, onAddToShoppingList}) => {
    
    const { text, available } = formatIngredientWithAvailability(ingredient, freezerItems);
    
    return (
        <Box 
            component="li" 
            sx={{ 
                mb: 0.5,
                display: 'flex',
                alignItems: 'center',
                gap: 1
            }}
        >
            {available ? (
                <CheckCircleIcon color="success" fontSize="small" />
            ) : (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CancelIcon color="error" fontSize="small" />
                    <IconButton 
                        size="small" 
                        color="primary" 
                        onClick={() => onAddToShoppingList(ingredient)}
                        sx={{ ml: 0.5 }}
                        title="Adicionar à Lista de Compras"
                    >
                        <AddIcon fontSize="small" />
                    </IconButton>
                </Box>
            )}
            <Typography>{text}</Typography>
        </Box>
    );
};

// Funções utilitárias
const checkIngredientAvailability = (ingredient: Ingredient, freezerItems: any[]) => {
    const freezerItem = freezerItems.find(item => 
        item.name.toLowerCase() === ingredient.name.toLowerCase()
    );

    if (!freezerItem) {
        return {
            available: false,
            freezerQuantity: 0,
            recipeQuantity: ingredient.quantity || 0
        };
    }

    // Se o ingrediente não tem quantidade especificada, consideramos disponível se existir no freezer
    if (!ingredient.quantity) {
        return {
            available: freezerItem.quantity > 0,
            freezerQuantity: freezerItem.quantity,
            recipeQuantity: 0
        };
    }

    return {
        available: freezerItem.quantity >= ingredient.quantity,
        freezerQuantity: freezerItem.quantity,
        recipeQuantity: ingredient.quantity
    };
};

const formatIngredientWithAvailability = (ingredient: Ingredient, freezerItems: any[]) => {
    const { name, quantity, unit } = ingredient;
    const availability = checkIngredientAvailability(ingredient, freezerItems);
    
    let baseText = '';
    if (quantity && unit) {
        baseText = `${quantity} ${unit} de ${name}`;
    } else if (quantity) {
        baseText = `${quantity} ${name}`;
    } else if (unit) {
        baseText = `${unit} de ${name}`;
    } else {
        baseText = name;
    }

    const availabilityText = quantity 
        ? ` (${availability.freezerQuantity}/${quantity})`
        : availability.freezerQuantity > 0 
            ? ` (Disponível: ${availability.freezerQuantity})`
            : ' (Não disponível)';

    return {
        text: baseText + availabilityText,
        available: availability.available
    };
};

const calculateTotalTime = (recipe: Recipe): number => {
    const prepTime = typeof recipe.prepTime === 'number' ? recipe.prepTime : 0;
    const cookTime = typeof recipe.cookTime === 'number' ? recipe.cookTime : 0;
    return prepTime + cookTime;
};

// Componente Principal
export const RecipeList: React.FC<RecipeListProps> = ({ onBack }) => {
    const { recipes, loading, setFilters, filteredRecipes, fetchRecipes, deleteRecipe } = useRecipeStore();
    const { items: freezerItems, fetchItems } = useFreezerStore();
    const { addItem } = useShoppingListStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
    const [isRecipeFormOpen, setIsRecipeFormOpen] = useState(false);
    const [isRecipeDetailOpen, setIsRecipeDetailOpen] = useState(false);
    
    // Computar mapa de disponibilidade usando useMemo para otimização
    const availabilityMap = useMemo(() => {
        const map: Record<string, boolean> = {};
        
        recipes.forEach(recipe => {
            const allAvailable = recipe.ingredients.every(ingredient => 
                checkIngredientAvailability(ingredient, freezerItems).available
            );
            map[recipe.id] = allAvailable;
        });
        
        return map;
    }, [recipes, freezerItems]);

    // Carregar dados iniciais
    useEffect(() => {
        fetchRecipes();
        fetchItems();
    }, [fetchRecipes, fetchItems]);

    // Event handlers
    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        const term = event.target.value;
        setSearchTerm(term);
        setFilters({ searchTerm: term });
    };

    const handleRecipeClick = (recipe: Recipe) => {
        setSelectedRecipe(recipe);
        setIsRecipeDetailOpen(true);
    };

    const handleEditRecipe = () => {
        setIsRecipeDetailOpen(false);
        setIsRecipeFormOpen(true);
    };

    const handleCloseRecipeForm = () => {
        setIsRecipeFormOpen(false);
        fetchRecipes();
    };

    const handleRecipeFormClosed = () => {
        setTimeout(() => setSelectedRecipe(null), 100);
    };

    const handleAddRecipe = () => {
        setSelectedRecipe(null);
        setIsRecipeFormOpen(true);
    };

    const handleAddToShoppingList = (ingredient: Ingredient) => {
        if (ingredient.name) {
            addItem({
                name: ingredient.name,
                quantity: ingredient.quantity,
                unit: ingredient.unit,
                checked: false
            });
            alert(`"${ingredient.name}" adicionado à lista de compras!`);
        }
    };

    // Renderização dos Cards de Receita
    const renderRecipeCard = (recipe: Recipe) => (
        <Grid item xs={12} sm={6} md={4} key={recipe.id}>
            <ButtonBase 
                onClick={() => handleRecipeClick(recipe)}
                sx={{ width: '100%', textAlign: 'left' }}
            >
                <Paper 
                    sx={{ 
                        p: 2.5,
                        display: 'flex', 
                        flexDirection: 'column',
                        height: '100%',
                        width: '100%',
                        minHeight: '160px',
                        transition: 'all 0.2s',
                        '&:hover': {
                            transform: 'scale(1.02)',
                            boxShadow: 3
                        }
                    }}
                >
                    <Typography variant="h6" sx={{ mb: 1 }}>
                        {recipe.name}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1.5 }}>
                        {recipe.prepTime !== undefined && (
                            <RecipeTimeChip label="Prep" minutes={recipe.prepTime} />
                        )}
                        {recipe.cookTime !== undefined && (
                            <RecipeTimeChip label="Cozimento" minutes={recipe.cookTime} />
                        )}
                        <RecipeTimeChip 
                            label="Total"
                            minutes={calculateTotalTime(recipe)}
                            color="primary"
                        />
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography color="text.secondary" sx={{ fontSize: '0.9rem' }}>
                            {recipe.ingredients.length} ingredientes
                        </Typography>
                        {availabilityMap[recipe.id] && (
                            <Chip
                                icon={<CheckCircleIcon fontSize="small" />}
                                label="Ingredientes disponíveis"
                                size="small"
                                color="success"
                                variant="outlined"
                                sx={{ fontSize: '0.75rem', height: '24px' }}
                            />
                        )}
                    </Box>
                    
                    {recipe.servings && (
                        <Typography color="text.secondary" sx={{ fontSize: '0.9rem' }}>
                            Serve {recipe.servings} {recipe.servings === 1 ? 'porção' : 'porções'}
                        </Typography>
                    )}
                </Paper>
            </ButtonBase>
        </Grid>
    );

    return (
        <>
            {/* Cabeçalho e Busca */}
            <Box sx={{ flexGrow: 1 }}>
                <Container maxWidth="lg" sx={{ mt: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <IconButton onClick={onBack} sx={{ mr: 2 }}>
                            <ArrowBackIcon fontSize="large" />
                        </IconButton>
                        <Typography variant="h4" component="h1">
                            Receitas
                        </Typography>
                        <Button 
                            variant="contained" 
                            onClick={handleAddRecipe}
                            sx={{ ml: 'auto' }}
                        >
                            Nova Receita
                        </Button>
                    </Box>

                    <Paper sx={{ p: 2, mb: 3 }}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Buscar receita..."
                            value={searchTerm}
                            onChange={handleSearch}
                            InputProps={{
                                style: { fontSize: '1.1rem' },
                                endAdornment: (
                                    <IconButton edge="end" sx={{ p: 1.5 }}>
                                        <SearchIcon fontSize="medium" />
                                    </IconButton>
                                )
                            }}
                            sx={{ '& .MuiOutlinedInput-root': { minHeight: '56px' } }}
                        />
                    </Paper>

                    {/* Lista de Receitas */}
                    {loading ? (
                        <Typography>Carregando receitas...</Typography>
                    ) : (
                        <Grid container spacing={3}>
                            {filteredRecipes().length > 0 ? (
                                filteredRecipes().map(renderRecipeCard)
                            ) : (
                                <Grid item xs={12}>
                                    <Box sx={{ 
                                        textAlign: 'center', 
                                        py: 4,
                                        color: 'text.secondary'
                                    }}>
                                        <Typography variant="h6">
                                            Nenhuma receita encontrada
                                        </Typography>
                                        <Button 
                                            variant="contained" 
                                            onClick={handleAddRecipe}
                                            sx={{ mt: 2 }}
                                        >
                                            Adicionar Receita
                                        </Button>
                                    </Box>
                                </Grid>
                            )}
                        </Grid>
                    )}
                </Container>
            </Box>

            {/* Diálogo de Detalhes da Receita */}
            <Dialog
                open={isRecipeDetailOpen}
                onClose={() => setIsRecipeDetailOpen(false)}
                maxWidth="md"
                fullWidth
            >
                {selectedRecipe && (
                    <>
                        <DialogTitle>
                            <Typography variant="h5">{selectedRecipe.name}</Typography>
                        </DialogTitle>
                        <DialogContent>
                            <Box sx={{ mb: 3 }}>
                                {/* Informações de tempo */}
                                <Grid container spacing={2} sx={{ mb: 2 }}>
                                    {selectedRecipe.prepTime !== undefined && (
                                        <Grid item xs={4}>
                                            <Typography variant="subtitle2">Tempo de Preparo</Typography>
                                            <Typography>
                                                <RecipeTimeChip 
                                                    label="" 
                                                    minutes={selectedRecipe.prepTime} 
                                                    variant="filled" 
                                                />
                                            </Typography>
                                        </Grid>
                                    )}
                                    {selectedRecipe.cookTime !== undefined && (
                                        <Grid item xs={4}>
                                            <Typography variant="subtitle2">Tempo de Cozimento</Typography>
                                            <Typography>
                                                <RecipeTimeChip 
                                                    label="" 
                                                    minutes={selectedRecipe.cookTime} 
                                                    variant="filled" 
                                                />
                                            </Typography>
                                        </Grid>
                                    )}
                                    <Grid item xs={4}>
                                        <Typography variant="subtitle2">Tempo Total</Typography>
                                        <Typography>
                                            <RecipeTimeChip 
                                                label="" 
                                                minutes={calculateTotalTime(selectedRecipe)} 
                                                variant="filled" 
                                                color="primary"
                                            />
                                        </Typography>
                                    </Grid>
                                    {selectedRecipe.servings && (
                                        <Grid item xs={4}>
                                            <Typography variant="subtitle2">Porções</Typography>
                                            <Typography>{selectedRecipe.servings}</Typography>
                                        </Grid>
                                    )}
                                </Grid>

                                {/* Lista de Ingredientes com opção de adicionar à lista de compras */}
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3, mb: 1 }}>
                                    <Typography variant="h6">Ingredientes</Typography>
                                    <Button 
                                        startIcon={<ShoppingCartIcon />}
                                        variant="outlined"
                                        size="small"
                                        onClick={() => {
                                            if (window.confirm('Deseja adicionar todos os ingredientes indisponíveis à lista de compras?')) {
                                                selectedRecipe.ingredients.forEach(ingredient => {
                                                    const availability = checkIngredientAvailability(ingredient, freezerItems);
                                                    if (!availability.available) {
                                                        handleAddToShoppingList(ingredient);
                                                    }
                                                });
                                                alert('Ingredientes adicionados à lista de compras!');
                                            }
                                        }}
                                    >
                                        Adicionar Indisponíveis
                                    </Button>
                                </Box>
                                <Box component="ul" sx={{ pl: 2 }}>
                                    {selectedRecipe.ingredients.map((ingredient, index) => (
                                        <IngredientListItem 
                                            key={index} 
                                            ingredient={ingredient} 
                                            freezerItems={freezerItems} 
                                            onAddToShoppingList={handleAddToShoppingList}
                                        />
                                    ))}
                                </Box>

                                {/* Instruções */}
                                <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>Instruções</Typography>
                                <Typography sx={{ whiteSpace: 'pre-wrap' }}>
                                    {selectedRecipe.instructions}
                                </Typography>

                                {/* Notas (se existirem) */}
                                {selectedRecipe.notes && (
                                    <>
                                        <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>Notas</Typography>
                                        <Typography sx={{ whiteSpace: 'pre-wrap' }}>
                                            {selectedRecipe.notes}
                                        </Typography>
                                    </>
                                )}
                            </Box>
                        </DialogContent>
                        <DialogActions>
                            <Button 
                                onClick={() => {
                                    if (window.confirm(`Tem certeza que deseja excluir a receita "${selectedRecipe.name}"?`)) {
                                        deleteRecipe(selectedRecipe.id);
                                        setIsRecipeDetailOpen(false);
                                    }
                                }}
                                color="error"
                                sx={{ mr: 'auto' }}
                            >
                                Excluir
                            </Button>
                            <Button onClick={() => setIsRecipeDetailOpen(false)}>
                                Fechar
                            </Button>
                            <Button 
                                variant="contained" 
                                onClick={handleEditRecipe}
                            >
                                Editar
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>

            {/* Formulário de Receita */}
            <RecipeForm
                open={isRecipeFormOpen}
                onClose={handleCloseRecipeForm}
                initialData={selectedRecipe || undefined}
                onExited={handleRecipeFormClosed}
            />
        </>
    );
}; 