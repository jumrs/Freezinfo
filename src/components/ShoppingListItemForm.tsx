import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
} from '@mui/material';
import { useShoppingListStore } from '../store/shoppingListStore';
import { ShoppingListItem } from '../types';

interface ShoppingListItemFormProps {
    open: boolean;
    onClose: () => void;
    initialData?: ShoppingListItem;
}

export const ShoppingListItemForm: React.FC<ShoppingListItemFormProps> = ({
    open,
    onClose,
    initialData,
}) => {
    const [name, setName] = useState('');
    const [quantity, setQuantity] = useState<string>('');
    const [unit, setUnit] = useState('');
    const [notes, setNotes] = useState('');
    
    const { addItem, updateItem } = useShoppingListStore();
    
    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setQuantity(initialData.quantity?.toString() || '');
            setUnit(initialData.unit || '');
            setNotes(initialData.notes || '');
        } else {
            // Clear form for new item
            setName('');
            setQuantity('');
            setUnit('');
            setNotes('');
        }
    }, [initialData, open]);
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const itemData = {
            name,
            quantity: quantity ? parseFloat(quantity) : undefined,
            unit: unit || undefined,
            checked: initialData?.checked || false,
            notes: notes || undefined,
        };
        
        try {
            if (initialData) {
                await updateItem(initialData.id, itemData);
            } else {
                await addItem(itemData);
            }
            onClose();
        } catch (error) {
            console.error('Error saving shopping list item:', error);
        }
    };
    
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>{initialData ? 'Editar Item' : 'Adicionar Item à Lista'}</DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <TextField
                            autoFocus
                            label="Nome do Item"
                            fullWidth
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                label="Quantidade"
                                type="number"
                                inputProps={{ min: 0, step: 0.1 }}
                                fullWidth
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                            />
                            <TextField
                                label="Unidade"
                                fullWidth
                                value={unit}
                                onChange={(e) => setUnit(e.target.value)}
                                placeholder="ex: kg, g, unid."
                            />
                        </Box>
                        <TextField
                            label="Observações"
                            fullWidth
                            multiline
                            rows={2}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} color="inherit">
                        Cancelar
                    </Button>
                    <Button type="submit" variant="contained">
                        {initialData ? 'Atualizar' : 'Adicionar'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}; 