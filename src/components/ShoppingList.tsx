import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    IconButton,
    Checkbox,
    Button,
    Divider,
    Tooltip,
} from '@mui/material';
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    DeleteSweep as DeleteSweepIcon
} from '@mui/icons-material';
import { useShoppingListStore } from '../store/shoppingListStore';
import { ShoppingListItem } from '../types';
import { ShoppingListItemForm } from './ShoppingListItemForm';

export const ShoppingList: React.FC = () => {
    const { items, loading, fetchItems, deleteItem, toggleItemCheck, clearCheckedItems } = useShoppingListStore();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [itemToEdit, setItemToEdit] = useState<ShoppingListItem | undefined>(undefined);
    
    useEffect(() => {
        fetchItems();
    }, [fetchItems]);
    
    const handleAddItem = () => {
        setItemToEdit(undefined);
        setIsFormOpen(true);
    };
    
    const handleEditItem = (item: ShoppingListItem) => {
        setItemToEdit(item);
        setIsFormOpen(true);
    };
    
    const handleCloseForm = () => {
        setIsFormOpen(false);
    };
    
    const formatItemLabel = (item: ShoppingListItem): string => {
        if (item.quantity && item.unit) {
            return `${item.quantity} ${item.unit} ${item.name}`;
        } else if (item.quantity) {
            return `${item.quantity} ${item.name}`;
        } else {
            return item.name;
        }
    };
    
    return (
        <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Lista de Compras</Typography>
                <Box>
                    <Button
                        startIcon={<DeleteSweepIcon />}
                        color="error"
                        size="small"
                        disabled={!items.some(item => item.checked)}
                        onClick={() => {
                            if (window.confirm('Deseja remover todos os itens marcados como comprados?')) {
                                clearCheckedItems();
                            }
                        }}
                        sx={{ mr: 1 }}
                    >
                        Limpar Comprados
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleAddItem}
                        size="small"
                    >
                        Adicionar
                    </Button>
                </Box>
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            {loading ? (
                <Typography align="center" color="textSecondary">Carregando...</Typography>
            ) : items.length === 0 ? (
                <Typography align="center" color="textSecondary">
                    Sua lista de compras está vazia. Adicione itens clicando no botão acima.
                </Typography>
            ) : (
                <List>
                    {items.map((item) => (
                        <ListItem
                            key={item.id}
                            disablePadding
                            divider
                            secondaryAction={
                                <Box>
                                    <Tooltip title="Editar">
                                        <IconButton 
                                            edge="end" 
                                            aria-label="editar"
                                            onClick={() => handleEditItem(item)}
                                            size="small"
                                        >
                                            <EditIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Excluir">
                                        <IconButton 
                                            edge="end" 
                                            aria-label="deletar"
                                            onClick={() => {
                                                if (window.confirm(`Deseja remover "${item.name}" da lista de compras?`)) {
                                                    deleteItem(item.id);
                                                }
                                            }}
                                            color="error"
                                            size="small"
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            }
                            sx={{
                                py: 1,
                                px: 2,
                                backgroundColor: item.checked ? 'rgba(76, 175, 80, 0.08)' : 'transparent',
                            }}
                        >
                            <ListItemIcon>
                                <Checkbox
                                    edge="start"
                                    checked={item.checked}
                                    onChange={() => toggleItemCheck(item.id)}
                                    color="success"
                                />
                            </ListItemIcon>
                            <ListItemText
                                primary={formatItemLabel(item)}
                                secondary={item.notes}
                                primaryTypographyProps={{
                                    sx: item.checked ? {
                                        textDecoration: 'line-through',
                                        color: 'text.secondary'
                                    } : {},
                                }}
                            />
                        </ListItem>
                    ))}
                </List>
            )}
            
            <ShoppingListItemForm
                open={isFormOpen}
                onClose={() => {
                    handleCloseForm();
                    // Pequedn atraso para garantir que o item seja limpo após a animação de fechar
                    setTimeout(() => setItemToEdit(undefined), 100);
                }}
                initialData={itemToEdit}
            />
        </Paper>
    );
}; 