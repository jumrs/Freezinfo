import React, { useState, useEffect } from 'react';
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
    Divider
} from '@mui/material';
import { Search as SearchIcon, ArrowBack as ArrowBackIcon, CheckCircle as CheckCircleIcon, Cancel as CancelIcon } from '@mui/icons-material';
import { useRecipeStore } from '../store/recipeStore';
import { useFreezerStore } from '../store/freezerStore';
import { Recipe, Ingredient } from '../types';
import { RecipeForm } from './RecipeForm';

interface RecipeListProps {
    onBack: () => void;
}

export const RecipeList: React.FC<RecipeListProps> = ({ onBack }) => {
    const { recipes, loading, setFilters, filteredRecipes, fetchRecipes, deleteRecipe } = useRecipeStore();
    const { items: freezerItems } = useFreezerStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
    const [isRecipeFormOpen, setIsRecipeFormOpen] = useState(false);
    const [isRecipeDetailOpen, setIsRecipeDetailOpen] = useState(false);

    // Atualizar a lista de receitas quando o componente for montado
    useEffect(() => {
        fetchRecipes();
    }, [fetchRecipes]);

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
        // Não limpar a receita selecionada aqui para evitar problemas na transição
        // Atualizar a lista de receitas após fechar o formulário
        fetchRecipes();
    };

    const handleRecipeFormClosed = () => {
        // Limpar a receita selecionada somente após o formulário ter sido completamente fechado
        setTimeout(() => {
            setSelectedRecipe(null);
        }, 100);
    };

    const handleAddRecipe = () => {
        setSelectedRecipe(null);
        setIsRecipeFormOpen(true);
    };

    const formatTime = (minutes?: number) => {
        if (!minutes) return '';
        
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        
        if (hours > 0) {
            return `${hours}h${mins > 0 ? ` ${mins}min` : ''}`;
        }
        return `${mins}min`;
    };

    const getTotalTime = (recipe: Recipe) => {
        const prepTime = recipe.prepTime || 0;
        const cookTime = recipe.cookTime || 0;
        return formatTime(prepTime + cookTime);
    };

    const checkIngredientAvailability = (ingredient: Ingredient) => {
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

        return {
            available: ingredient.quantity ? freezerItem.quantity >= ingredient.quantity : true,
            freezerQuantity: freezerItem.quantity,
            recipeQuantity: ingredient.quantity || 0
        };
    };

    // Modifica a função formatIngredient para incluir a disponibilidade
    const formatIngredient = (ingredient: Recipe['ingredients'][0]) => {
        const { name, quantity, unit } = ingredient;
        const availability = checkIngredientAvailability(ingredient);
        
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

    return (
        <>
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

                    {loading ? (
                        <Typography>Carregando receitas...</Typography>
                    ) : (
                        <Grid container spacing={3}>
                            {filteredRecipes().length > 0 ? (
                                filteredRecipes().map((recipe) => (
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
                                                    {recipe.prepTime && (
                                                        <Chip 
                                                            label={`Prep: ${formatTime(recipe.prepTime)}`} 
                                                            size="small"
                                                            variant="outlined"
                                                        />
                                                    )}
                                                    {recipe.cookTime && (
                                                        <Chip 
                                                            label={`Cozimento: ${formatTime(recipe.cookTime)}`} 
                                                            size="small"
                                                            variant="outlined"
                                                        />
                                                    )}
                                                    {(recipe.prepTime || recipe.cookTime) && (
                                                        <Chip 
                                                            label={`Total: ${getTotalTime(recipe)}`} 
                                                            size="small"
                                                            color="primary"
                                                        />
                                                    )}
                                                </Box>
                                                
                                                <Typography color="text.secondary" sx={{ fontSize: '0.9rem', mb: 1 }}>
                                                    {recipe.ingredients.length} ingredientes
                                                </Typography>
                                                
                                                {recipe.servings && (
                                                    <Typography color="text.secondary" sx={{ fontSize: '0.9rem' }}>
                                                        Serve {recipe.servings} {recipe.servings === 1 ? 'porção' : 'porções'}
                                                    </Typography>
                                                )}
                                            </Paper>
                                        </ButtonBase>
                                    </Grid>
                                ))
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

            {/* Recipe Detail Dialog */}
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
                                <Grid container spacing={2} sx={{ mb: 2 }}>
                                    {selectedRecipe.prepTime && (
                                        <Grid item xs={4}>
                                            <Typography variant="subtitle2">Tempo de Preparo</Typography>
                                            <Typography>{formatTime(selectedRecipe.prepTime)}</Typography>
                                        </Grid>
                                    )}
                                    {selectedRecipe.cookTime && (
                                        <Grid item xs={4}>
                                            <Typography variant="subtitle2">Tempo de Cozimento</Typography>
                                            <Typography>{formatTime(selectedRecipe.cookTime)}</Typography>
                                        </Grid>
                                    )}
                                    {selectedRecipe.servings && (
                                        <Grid item xs={4}>
                                            <Typography variant="subtitle2">Porções</Typography>
                                            <Typography>{selectedRecipe.servings}</Typography>
                                        </Grid>
                                    )}
                                </Grid>

                                <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>Ingredientes</Typography>
                                <Box component="ul" sx={{ pl: 2 }}>
                                    {selectedRecipe.ingredients.map((ingredient, index) => {
                                        const { text, available } = formatIngredient(ingredient);
                                        return (
                                            <Box 
                                                component="li" 
                                                key={index} 
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
                                                    <CancelIcon color="error" fontSize="small" />
                                                )}
                                                <Typography>{text}</Typography>
                                            </Box>
                                        );
                                    })}
                                </Box>

                                <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>Instruções</Typography>
                                <Typography sx={{ whiteSpace: 'pre-wrap' }}>
                                    {selectedRecipe.instructions}
                                </Typography>

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

            {/* Recipe Form Dialog */}
            <RecipeForm
                open={isRecipeFormOpen}
                onClose={handleCloseRecipeForm}
                initialData={selectedRecipe || undefined}
                onExited={handleRecipeFormClosed}
            />
        </>
    );
}; 