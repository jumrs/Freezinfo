import React, { useState } from 'react';
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
    Grid
} from '@mui/material';
import { FoodCategory, FoodItem, FreezerLocation } from '../types';
import { useFreezerStore } from '../store/freezerStore';

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
    const [formData, setFormData] = useState<Partial<FoodItem>>(
        initialData || {
            name: '',
            category: FoodCategory.CARNES,
            quantity: 1,
            location: { drawer: 1, section: 'A' },
            dateAdded: new Date().toISOString(),
        }
    );

    const handleChange = (field: keyof FoodItem, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleLocationChange = (field: keyof FreezerLocation, value: any) => {
        setFormData(prev => ({
            ...prev,
            location: {
                ...prev.location!,
                [field]: value
            }
        }));
    };

    const handleSubmit = async () => {
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
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                {initialData ? 'Editar Item' : 'Adicionar Novo Item'}
            </DialogTitle>
            <DialogContent>
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
                                {Object.values(FoodCategory).map((category) => (
                                    <MenuItem key={category} value={category}>
                                        {category}
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
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            fullWidth
                            type="number"
                            label="Gaveta"
                            value={formData.location?.drawer}
                            onChange={(e) => handleLocationChange('drawer', parseInt(e.target.value))}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Seção"
                            value={formData.location?.section}
                            onChange={(e) => handleLocationChange('section', e.target.value)}
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