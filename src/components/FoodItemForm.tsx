import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    DialogContentText,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid,
    Alert,
    Box
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
    const { addFoodItem, updateFoodItem, deleteFoodItem } = useFreezerStore();
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
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

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

    const handleDeleteConfirmation = () => {
        setConfirmDeleteOpen(true);
    };

    const handleDeleteCancel = () => {
        setConfirmDeleteOpen(false);
    };

    const handleDelete = async () => {
        if (initialData && initialData.id) {
            try {
                await deleteFoodItem(initialData.id);
                setConfirmDeleteOpen(false);
                onClose();
            } catch (error) {
                console.error('Failed to delete item:', error);
                setError('Erro ao remover o item');
                setConfirmDeleteOpen(false);
            }
        }
    };

    return (
        <>
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
                                sx={{ '& .MuiOutlinedInput-root': { minHeight: '56px' }, '& .MuiInputBase-input': { fontSize: '1.1rem' } }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth sx={{ '& .MuiOutlinedInput-root': { minHeight: '56px' } }}>
                                <InputLabel>Categoria</InputLabel>
                                <Select
                                    value={formData.category}
                                    label="Categoria"
                                    onChange={(e) => handleChange('category', e.target.value)}
                                    sx={{ '& .MuiSelect-select': { fontSize: '1.1rem' } }}
                                >
                                    {categories.map((category) => (
                                        <MenuItem key={category.id} value={category.id} sx={{ minHeight: '48px', fontSize: '1.1rem' }}>
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
                                sx={{ '& .MuiOutlinedInput-root': { minHeight: '56px' }, '& .MuiInputBase-input': { fontSize: '1.1rem' } }}
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
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '4px' }, '& .MuiInputBase-input': { fontSize: '1.1rem', lineHeight: 1.4 } }}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ display: 'flex', justifyContent: 'space-between', px: 3, py: 2, gap: 1 }}>
                    {initialData && (
                        <Button onClick={handleDeleteConfirmation} variant="contained" color="error" sx={{ padding: '10px 20px', fontSize: '0.9rem' }}>
                            REMOVER
                        </Button>
                    )}
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button onClick={onClose} sx={{ padding: '10px 20px', fontSize: '0.9rem' }}>Cancelar</Button>
                        <Button onClick={handleSubmit} variant="contained" color="primary" sx={{ padding: '10px 20px', fontSize: '0.9rem' }}>
                            {initialData ? 'Salvar' : 'Adicionar'}
                        </Button>
                    </Box>
                </DialogActions>
            </Dialog>

            <Dialog
                open={confirmDeleteOpen}
                onClose={handleDeleteCancel}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    Confirmar remoção
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Tem certeza que deseja remover este item? Esta ação não pode ser desfeita.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ px:3, py: 2, gap: 1}}>
                    <Button onClick={handleDeleteCancel} sx={{ padding: '10px 20px', fontSize: '0.9rem' }}>Cancelar</Button>
                    <Button onClick={handleDelete} color="error" autoFocus sx={{ padding: '10px 20px', fontSize: '0.9rem' }}>
                        Confirmar
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}; 