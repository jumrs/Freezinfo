import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid,
    Alert
} from '@mui/material';
import { FoodItem } from '../types';
import { useFreezerStore } from '../store/freezerStore';
import { useCategoryStore } from '../store/categoryStore';

interface FoodItemFormProps {
    open: boolean;
    onClose: () => void;
    initialData?: FoodItem;
}

export const FoodItemForm: React.FC<FoodItemFormProps> = ({
    open,
    onClose,
    initialData
}) => {
    const { addFoodItem, updateFoodItem } = useFreezerStore();
    const { categories } = useCategoryStore();
    const [formData, setFormData] = useState<FoodItem>(initialData || {
        id: '',
        name: '',
        quantity: 1,
        category: '',
        dateAdded: new Date().toISOString(),
        location: {
            drawer: 1,
            section: 'front'
        }
    });
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (open) {
            setFormData(
                initialData || {
                    id: '',
                    name: '',
                    quantity: 1,
                    category: '',
                    dateAdded: new Date().toISOString(),
                    location: {
                        drawer: 1,
                        section: 'front'
                    }
                }
            );
        }
    }, [open, initialData]);

    const handleChange = (field: keyof FoodItem, value: any) => {
        if (field === 'quantity' && value < 0) {
            setError('A quantidade não pode ser menor que zero');
            return;
        }
        setError(null);
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async () => {
        if (formData.quantity < 0) {
            setError('A quantidade não pode ser menor que zero');
            return;
        }

        try {
            if (initialData) {
                await updateFoodItem(formData as FoodItem);
            } else {
                const newItem: FoodItem = {
                    ...formData as Omit<FoodItem, 'id'>,
                    id: Date.now().toString(),
                    dateAdded: new Date().toISOString()
                };
                await addFoodItem(newItem);
            }
            onClose();
        } catch (error) {
            console.error('Failed to save item:', error);
            setError('Erro ao salvar o item');
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                {initialData ? 'Editar Item' : 'Adicionar Novo Item'}
            </DialogTitle>
            <DialogContent>
                {error && (
                    <Alert severity="error" sx={{ mb: 2, mt: 1 }}>
                        {error}
                    </Alert>
                )}
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Nome"
                            value={formData.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <FormControl fullWidth>
                            <InputLabel>Categoria</InputLabel>
                            <Select
                                value={formData.category}
                                label="Categoria"
                                onChange={(e) => handleChange('category', e.target.value)}
                            >
                                {categories.map((category) => (
                                    <MenuItem key={category.id} value={category.id}>
                                        {category.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            fullWidth
                            type="number"
                            label="Quantidade"
                            value={formData.quantity}
                            onChange={(e) => handleChange('quantity', parseInt(e.target.value))}
                            inputProps={{ min: 0 }}
                            error={!!error && error.includes('quantidade')}
                            helperText={error && error.includes('quantidade') ? error : ''}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Observações"
                            multiline
                            rows={3}
                            value={formData.notes}
                            onChange={(e) => handleChange('notes', e.target.value)}
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancelar</Button>
                <Button onClick={handleSubmit} variant="contained" color="primary">
                    {initialData ? 'Salvar' : 'Adicionar'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}; 