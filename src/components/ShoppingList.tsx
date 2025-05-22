import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Checkbox,
    IconButton,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Tooltip,
    Divider
} from '@mui/material';
import {
    Delete as DeleteIcon,
    Edit as EditIcon,
    AddShoppingCart as AddIcon,
    DeleteSweep as DeleteSweepIcon,
    Kitchen as FreezerIcon
} from '@mui/icons-material';
import { useShoppingListStore } from '../store/shoppingListStore';
import { useFreezerStore } from '../store/freezerStore';
import { ShoppingListItemForm } from './ShoppingListItemForm';
import { FoodItemForm } from './FoodItemForm';
import { ShoppingListItem } from '../types';

export const ShoppingList: React.FC = () => {
    const { items, loading, fetchItems, deleteItem, toggleItemCheck, clearCheckedItems } = useShoppingListStore();
    const { items: freezerItems, addFoodItem, updateFoodItem, fetchItems: fetchFreezerItems } = useFreezerStore();
    
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [itemToEdit, setItemToEdit] = useState<ShoppingListItem | undefined>(undefined);
    const [isFoodItemFormOpen, setIsFoodItemFormOpen] = useState(false);
    const [currentShoppingItem, setCurrentShoppingItem] = useState<ShoppingListItem | null>(null);
    const [checkedItemsToProcess, setCheckedItemsToProcess] = useState<ShoppingListItem[]>([]);
    const [processingIndex, setProcessingIndex] = useState(-1);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    
    useEffect(() => {
        fetchItems();
        fetchFreezerItems();
    }, [fetchItems, fetchFreezerItems]);

    // Processar próximo item na fila para adicionar ao freezer
    useEffect(() => {
        if (processingIndex >= 0 && processingIndex < checkedItemsToProcess.length) {
            processItemForFreezer(checkedItemsToProcess[processingIndex]);
        } else if (processingIndex >= checkedItemsToProcess.length && checkedItemsToProcess.length > 0) {
            // Finalizado o processamento de todos os itens
            clearCheckedItems();
            setCheckedItemsToProcess([]);
            setProcessingIndex(-1);
        }
    }, [processingIndex, checkedItemsToProcess]);
    
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
    
    const handleDeleteItem = (id: string) => {
        if (window.confirm('Deseja realmente remover este item?')) {
            deleteItem(id);
        }
    };
    
    const handleToggleCheck = (id: string) => {
        toggleItemCheck(id);
    };
    
    const handleClearCheckedItems = () => {
        const checkedItems = items.filter(item => item.checked);
        if (checkedItems.length > 0) {
            setCheckedItemsToProcess(checkedItems);
            setConfirmDialogOpen(true);
        }
    };

    // Processar um item para adicionar no freezer
    const processItemForFreezer = (item: ShoppingListItem) => {
        const existingItem = freezerItems.find(
            freezerItem => freezerItem.name.toLowerCase() === item.name.toLowerCase()
        );

        if (existingItem) {
            // Se o item já existe, apenas incrementa a quantidade
            const newQuantity = (existingItem.quantity || 1) + (item.quantity || 1);
            updateFoodItem({
                ...existingItem,
                quantity: newQuantity
            });
            // Continua para o próximo item
            setProcessingIndex(prev => prev + 1);
        } else {
            // Se é um novo item, abre o formulário para confirmar os detalhes antes de adicionar
            setCurrentShoppingItem(item);
            setIsFoodItemFormOpen(true);
        }
    };

    // Quando o usuário opta por adicionar ao freezer
    const handleConfirmAddToFreezer = () => {
        setProcessingIndex(0);
        setConfirmDialogOpen(false);
    };

    // Quando o usuário escolhe não adicionar ao freezer
    const handleRejectAddToFreezer = () => {
        clearCheckedItems();
        setConfirmDialogOpen(false);
    };

    // Quando o formulário do FoodItem fecha
    const handleFoodItemFormClose = () => {
        setIsFoodItemFormOpen(false);
        setCurrentShoppingItem(null);
        // Continua o processamento com o próximo item
        setProcessingIndex(prev => prev + 1);
    };
    
    // Formatar o rótulo do item da lista de compras
    const formatItemLabel = (item: ShoppingListItem): string => {
        let label = item.name;
        
        if (item.quantity) {
            label += ` - ${item.quantity}`;
            if (item.unit) {
                label += ` ${item.unit}`;
            }
        }
        
        return label;
    };
    
    return (
        <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                    <Button
                        startIcon={<DeleteSweepIcon />}
                        color="error"
                        size="small"
                        disabled={!items.some(item => item.checked)}
                        onClick={handleClearCheckedItems}
                        sx={{ mr: 1 }}
                    >
                        Limpar comprados
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
                                            aria-label="excluir" 
                                            onClick={() => handleDeleteItem(item.id)}
                                            size="small"
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            }
                        >
                            <ListItemIcon>
                                <Checkbox
                                    edge="start"
                                    checked={item.checked || false}
                                    onChange={() => handleToggleCheck(item.id)}
                                    inputProps={{ 'aria-labelledby': item.id }}
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
            
            {/* Diálogo de confirmação para adicionar ao freezer */}
            <Dialog
                open={confirmDialogOpen}
                onClose={() => setConfirmDialogOpen(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    Adicionar itens ao freezer?
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        Deseja adicionar os itens comprados ao freezer? 
                        Se um item já existir, sua quantidade será aumentada.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleRejectAddToFreezer} color="inherit">
                        Não, apenas remover
                    </Button>
                    <Button 
                        onClick={handleConfirmAddToFreezer} 
                        color="primary"
                        variant="contained"
                        startIcon={<FreezerIcon />}
                        autoFocus
                    >
                        Sim, adicionar
                    </Button>
                </DialogActions>
            </Dialog>
            
            {/* Formulário para editar itens da lista de compras */}
            <ShoppingListItemForm
                open={isFormOpen}
                onClose={() => {
                    handleCloseForm();
                    setTimeout(() => setItemToEdit(undefined), 100);
                }}
                initialData={itemToEdit}
            />
            
            {/* Formulário para adicionar ao freezer */}
            {currentShoppingItem && (
                <FoodItemForm
                    open={isFoodItemFormOpen}
                    onClose={handleFoodItemFormClose}
                    initialData={{
                        id: '',
                        name: currentShoppingItem.name,
                        quantity: currentShoppingItem.quantity || 1,
                        category: '',
                        dateAdded: new Date().toISOString(),
                        notes: currentShoppingItem.notes
                    }}
                />
            )}
        </>
    );
}; 