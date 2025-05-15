import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    TextField,
    Typography,
    Box,
    Alert
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useCategoryStore } from '../store/categoryStore';
import { Category } from '../db/categoryConfig';

interface CategoryManagerProps {
    open: boolean;
    onClose: () => void;
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({
    open,
    onClose
}) => {
    const { categories, addCategory, updateCategory, deleteCategory } = useCategoryStore();
    const [newCategoryName, setNewCategoryName] = useState('');
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Limpar erro quando o diálogo é fechado
    useEffect(() => {
        if (!open) {
            setError(null);
            setNewCategoryName('');
            setEditingCategory(null);
        }
    }, [open]);

    const handleAddCategory = async () => {
        if (!newCategoryName.trim()) {
            setError('O nome da categoria não pode estar vazio');
            return;
        }

        try {
            await addCategory(newCategoryName.trim());
            setNewCategoryName('');
            setError(null);
        } catch (error) {
            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError('Erro ao adicionar categoria');
            }
        }
    };

    const handleUpdateCategory = async (category: Category) => {
        if (!editingCategory?.name.trim()) {
            setError('O nome da categoria não pode estar vazio');
            return;
        }

        try {
            await updateCategory(editingCategory);
            setEditingCategory(null);
            setError(null);
        } catch (error) {
            setError('Erro ao atualizar categoria');
        }
    };

    const handleDeleteCategory = async (category: Category) => {
        if (category.isDefault) {
            setError('Não é possível excluir categorias padrão');
            return;
        }

        try {
            await deleteCategory(category.id);
            setError(null);
        } catch (error) {
            setError('Erro ao excluir categoria');
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Gerenciar Categorias</DialogTitle>
            <DialogContent>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}
                
                <Box sx={{ mb: 3 }}>
                    <TextField
                        fullWidth
                        label="Nova Categoria"
                        value={newCategoryName}
                        onChange={(e) => {
                            setNewCategoryName(e.target.value);
                            setError(null);
                        }}
                        error={!!error && !editingCategory}
                        helperText={!editingCategory && error}
                        sx={{ mb: 1 }}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter' && newCategoryName.trim()) {
                                handleAddCategory();
                            }
                        }}
                    />
                    <Button
                        variant="contained"
                        onClick={handleAddCategory}
                        disabled={!newCategoryName.trim()}
                    >
                        Adicionar Categoria
                    </Button>
                </Box>

                <List>
                    {categories.map((category) => (
                        <ListItem key={category.id}>
                            {editingCategory?.id === category.id ? (
                                <TextField
                                    fullWidth
                                    value={editingCategory.name}
                                    onChange={(e) => {
                                        setEditingCategory({
                                            ...editingCategory,
                                            name: e.target.value
                                        });
                                        setError(null);
                                    }}
                                    error={!!error}
                                    helperText={error}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter' && editingCategory.name.trim()) {
                                            handleUpdateCategory(category);
                                        }
                                    }}
                                />
                            ) : (
                                <ListItemText 
                                    primary={category.name}
                                    secondary={category.isDefault ? 'Categoria padrão' : undefined}
                                />
                            )}
                            <ListItemSecondaryAction>
                                {editingCategory?.id === category.id ? (
                                    <>
                                        <Button
                                            onClick={() => handleUpdateCategory(category)}
                                            color="primary"
                                            disabled={!editingCategory.name.trim()}
                                        >
                                            Salvar
                                        </Button>
                                        <Button
                                            onClick={() => {
                                                setEditingCategory(null);
                                                setError(null);
                                            }}
                                            color="secondary"
                                        >
                                            Cancelar
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <IconButton
                                            edge="end"
                                            onClick={() => setEditingCategory(category)}
                                            disabled={category.isDefault}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton
                                            edge="end"
                                            onClick={() => handleDeleteCategory(category)}
                                            disabled={category.isDefault}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </>
                                )}
                            </ListItemSecondaryAction>
                        </ListItem>
                    ))}
                </List>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary">
                    Fechar
                </Button>
            </DialogActions>
        </Dialog>
    );
}; 