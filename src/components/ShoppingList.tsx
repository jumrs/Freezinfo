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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    DeleteSweep as DeleteSweepIcon,
    KitchenOutlined as FreezerIcon
} from '@mui/icons-material';
import { useShoppingListStore } from '../store/shoppingListStore';
import { useFreezerStore } from '../store/freezerStore';
import { ShoppingListItem } from '../types';
import { ShoppingListItemForm } from './ShoppingListItemForm';
import { FoodItemForm } from './FoodItemForm';

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
    
    const formatItemLabel = (item: ShoppingListItem): string => {
        if (item.quantity && item.unit) {
            return `${item.quantity} ${item.unit} ${item.name}`;
        } else if (item.quantity) {
            return `${item.quantity} ${item.name}`;
        } else {
            return item.name;
        }
    };

    // Verifica se o item já existe no freezer
    const findItemInFreezer = (shoppingItem: ShoppingListItem) => {
        return freezerItems.find(freezerItem => 
            freezerItem.name.toLowerCase() === shoppingItem.name.toLowerCase()
        );
    };

    // Processar um item para adicionar ao freezer
    const processItemForFreezer = (shoppingItem: ShoppingListItem) => {
        const existingFreezerItem = findItemInFreezer(shoppingItem);
        
        if (existingFreezerItem) {
            // Se o item já existe, aumenta a quantidade e continua o processamento
            updateFoodItem({
                ...existingFreezerItem,
                quantity: existingFreezerItem.quantity + (shoppingItem.quantity || 1)
            }).then(() => {
                setProcessingIndex(prev => prev + 1);
            });
        } else {
            // Se não existe, abre o formulário para adicionar novo item
            setCurrentShoppingItem(shoppingItem);
            setIsFoodItemFormOpen(true);
        }
    };

    // Inicia o processo de limpar itens comprados
    const handleClearCheckedItems = () => {
        const checkedItems = items.filter(item => item.checked);
        if (checkedItems.length === 0) return;
        
        setConfirmDialogOpen(true);
    };

    // Quando o usuário confirma que quer adicionar ao freezer
    const handleConfirmAddToFreezer = () => {
        const checkedItems = items.filter(item => item.checked);
        setCheckedItemsToProcess(checkedItems);
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
        </Paper>
    );
}; 