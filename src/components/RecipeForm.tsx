import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Typography,
    Box,
    Alert,
    IconButton,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Grid,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    SelectChangeEvent
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { useRecipeStore } from '../store/recipeStore';
import { Recipe, Ingredient } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface RecipeFormProps {
    open: boolean;
    onClose: () => void;
    initialData?: Recipe;
}

// Opções de unidades comuns para ingredientes
const unitOptions = [
    'unidade(s)',
    'g',
    'kg',
    'ml',
    'l',
    'colher(es) de sopa',
    'colher(es) de chá',
    'xícara(s)',
    'pitada(s)',
    'a gosto'
];

export const RecipeForm: React.FC<RecipeFormProps> = ({
    open,
    onClose,
    initialData
}) => {
    const { addRecipe, updateRecipe, deleteRecipe } = useRecipeStore();
    const [recipe, setRecipe] = useState<Recipe>({
        id: '',
        name: '',
        ingredients: [{ name: '' }],
        instructions: '',
        dateAdded: new Date().toISOString(),
    });
    const [error, setError] = useState<string | null>(null);
    const [newIngredient, setNewIngredient] = useState<Ingredient>({
        name: '',
        quantity: undefined,
        unit: ''
    });

    // Reset form when dialog opens/closes or initialData changes
    useEffect(() => {
        if (open) {
            if (initialData) {
                setRecipe(initialData);
            } else {
                setRecipe({
                    id: uuidv4(),
                    name: '',
                    ingredients: [{ name: '' }],
                    instructions: '',
                    dateAdded: new Date().toISOString(),
                });
            }
            setError(null);
            setNewIngredient({
                name: '',
                quantity: undefined,
                unit: ''
            });
        }
    }, [open, initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setRecipe(prev => ({
            ...prev,
            [name]: value
        }));
        setError(null);
    };

    const handleNewIngredientChange = (field: keyof Ingredient) => (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent
    ) => {
        const value = e.target.value;
        setNewIngredient(prev => ({
            ...prev,
            [field]: field === 'quantity' ? (value === '' ? undefined : Number(value)) : value
        }));
    };

    const handleAddIngredient = () => {
        if (newIngredient.name.trim()) {
            setRecipe(prev => ({
                ...prev,
                ingredients: [...prev.ingredients, { 
                    name: newIngredient.name.trim(),
                    quantity: newIngredient.quantity,
                    unit: newIngredient.unit
                }]
            }));
            setNewIngredient({
                name: '',
                quantity: undefined,
                unit: ''
            });
        }
    };

    const handleRemoveIngredient = (index: number) => {
        setRecipe(prev => ({
            ...prev,
            ingredients: prev.ingredients.filter((_, i) => i !== index)
        }));
    };

    const handleUpdateIngredient = (index: number, field: keyof Ingredient) => (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent
    ) => {
        const value = e.target.value;
        
        setRecipe(prev => {
            const newIngredients = [...prev.ingredients];
            newIngredients[index] = {
                ...newIngredients[index],
                [field]: field === 'quantity' ? (value === '' ? undefined : Number(value)) : value
            };
            return {
                ...prev,
                ingredients: newIngredients
            };
        });
    };

    const handleSave = async () => {
        if (!recipe.name.trim()) {
            setError('O nome da receita não pode estar vazio');
            return;
        }

        if (recipe.ingredients.length === 0 || recipe.ingredients.some(ing => !ing.name.trim())) {
            setError('Adicione pelo menos um ingrediente válido');
            return;
        }

        if (!recipe.instructions.trim()) {
            setError('As instruções não podem estar vazias');
            return;
        }

        try {
            if (initialData) {
                await updateRecipe(recipe);
            } else {
                await addRecipe(recipe);
            }
            onClose();
        } catch (error) {
            setError('Erro ao salvar receita');
        }
    };

    const handleDelete = async () => {
        if (initialData) {
            try {
                await deleteRecipe(initialData.id);
                onClose();
            } catch (error) {
                setError('Erro ao excluir receita');
            }
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>{initialData ? 'Editar Receita' : 'Nova Receita'}</DialogTitle>
            <DialogContent>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <Box sx={{ mb: 3, mt: 1 }}>
                    <TextField
                        fullWidth
                        label="Nome da Receita"
                        name="name"
                        value={recipe.name}
                        onChange={handleChange}
                        error={!!error && !recipe.name.trim()}
                        sx={{ mb: 2, '& .MuiOutlinedInput-root': { minHeight: '56px' } }}
                    />

                    <Typography variant="subtitle1" sx={{ mb: 1, mt: 2 }}>
                        Ingredientes
                    </Typography>
                    
                    <List sx={{ mb: 2 }}>
                        {recipe.ingredients.map((ingredient, index) => (
                            <ListItem key={index} sx={{ px: 0, py: 1 }}>
                                <Grid container spacing={2} alignItems="center">
                                    <Grid item xs={2}>
                                        <TextField
                                            fullWidth
                                            type="number"
                                            label="Qtd"
                                            value={ingredient.quantity || ''}
                                            onChange={handleUpdateIngredient(index, 'quantity')}
                                            inputProps={{ min: 0, step: 0.1 }}
                                        />
                                    </Grid>
                                    <Grid item xs={3}>
                                        <FormControl fullWidth>
                                            <InputLabel>Unidade</InputLabel>
                                            <Select
                                                value={ingredient.unit || ''}
                                                onChange={handleUpdateIngredient(index, 'unit')}
                                                label="Unidade"
                                            >
                                                <MenuItem value="">
                                                    <em>Nenhuma</em>
                                                </MenuItem>
                                                {unitOptions.map((unit) => (
                                                    <MenuItem key={unit} value={unit}>
                                                        {unit}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <TextField
                                            fullWidth
                                            label="Ingrediente"
                                            value={ingredient.name}
                                            onChange={handleUpdateIngredient(index, 'name')}
                                            error={!ingredient.name.trim()}
                                        />
                                    </Grid>
                                    <Grid item xs={1}>
                                        <IconButton 
                                            edge="end" 
                                            onClick={() => handleRemoveIngredient(index)}
                                            disabled={recipe.ingredients.length <= 1}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Grid>
                                </Grid>
                            </ListItem>
                        ))}
                    </List>

                    <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                            Adicionar Novo Ingrediente
                        </Typography>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={2}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    label="Qtd"
                                    value={newIngredient.quantity || ''}
                                    onChange={handleNewIngredientChange('quantity')}
                                    inputProps={{ min: 0, step: 0.1 }}
                                />
                            </Grid>
                            <Grid item xs={3}>
                                <FormControl fullWidth>
                                    <InputLabel>Unidade</InputLabel>
                                    <Select
                                        value={newIngredient.unit || ''}
                                        onChange={handleNewIngredientChange('unit')}
                                        label="Unidade"
                                    >
                                        <MenuItem value="">
                                            <em>Nenhuma</em>
                                        </MenuItem>
                                        {unitOptions.map((unit) => (
                                            <MenuItem key={unit} value={unit}>
                                                {unit}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={5}>
                                <TextField
                                    fullWidth
                                    label="Ingrediente"
                                    value={newIngredient.name}
                                    onChange={handleNewIngredientChange('name')}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter' && newIngredient.name.trim()) {
                                            handleAddIngredient();
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={2}>
                                <Button 
                                    variant="contained" 
                                    onClick={handleAddIngredient}
                                    disabled={!newIngredient.name.trim()}
                                    fullWidth
                                    sx={{ height: '100%' }}
                                >
                                    <AddIcon />
                                </Button>
                            </Grid>
                        </Grid>
                    </Box>

                    <Typography variant="subtitle1" sx={{ mb: 1 }}>
                        Instruções
                    </Typography>
                    <TextField
                        fullWidth
                        multiline
                        rows={6}
                        name="instructions"
                        value={recipe.instructions}
                        onChange={handleChange}
                        error={!!error && !recipe.instructions.trim()}
                        sx={{ mb: 2 }}
                    />

                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                        <TextField
                            label="Tempo de Preparo (min)"
                            name="prepTime"
                            type="number"
                            value={recipe.prepTime || ''}
                            onChange={handleChange}
                            sx={{ flex: 1 }}
                        />
                        <TextField
                            label="Tempo de Cozimento (min)"
                            name="cookTime"
                            type="number"
                            value={recipe.cookTime || ''}
                            onChange={handleChange}
                            sx={{ flex: 1 }}
                        />
                        <TextField
                            label="Porções"
                            name="servings"
                            type="number"
                            value={recipe.servings || ''}
                            onChange={handleChange}
                            sx={{ flex: 1 }}
                        />
                    </Box>

                    <TextField
                        fullWidth
                        label="Notas Adicionais"
                        name="notes"
                        multiline
                        rows={3}
                        value={recipe.notes || ''}
                        onChange={handleChange}
                        sx={{ mb: 2 }}
                    />
                </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
                {initialData && (
                    <Button 
                        onClick={handleDelete} 
                        color="error" 
                        sx={{ mr: 'auto', padding: '10px 20px' }}
                    >
                        Excluir
                    </Button>
                )}
                <Button onClick={onClose} sx={{ padding: '10px 20px' }}>
                    Cancelar
                </Button>
                <Button 
                    onClick={handleSave} 
                    variant="contained" 
                    sx={{ padding: '10px 20px' }}
                >
                    Salvar
                </Button>
            </DialogActions>
        </Dialog>
    );
}; 