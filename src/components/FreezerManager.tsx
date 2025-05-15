import React, { useState, useEffect } from 'react';
import { 
    Box, 
    AppBar, 
    Toolbar, 
    Typography, 
    Container,
    Grid,
    Paper,
    TextField,
    IconButton,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Divider,
    ButtonBase,
    Button
} from '@mui/material';
import { Add as AddIcon, Search as SearchIcon, Settings as SettingsIcon } from '@mui/icons-material';
import { useFreezerStore } from '../store/freezerStore';
import { useCategoryStore } from '../store/categoryStore';
import { FoodCategory, FoodItem } from '../types';
import { FoodItemForm } from './FoodItemForm';
import { CategoryManager } from './CategoryManager';

export const FreezerManager: React.FC = () => {
    const { filteredItems, setFilters, loading, error, items, fetchItems, lastSelectedCategory, setLastSelectedCategory } = useFreezerStore();
    const { categories } = useCategoryStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>(lastSelectedCategory);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
    const [itemToEdit, setItemToEdit] = useState<FoodItem | undefined>(undefined);
    const [showResults, setShowResults] = useState(false);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    useEffect(() => {
        setSelectedCategory(lastSelectedCategory);
    }, [lastSelectedCategory]);

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        const term = event.target.value;
        setSearchTerm(term);
        setShowResults(false);
    };

    const handleCategoryChange = (event: any) => {
        const category = event.target.value as string;
        setSelectedCategory(category);
        setLastSelectedCategory(category);
        setShowResults(false);
    };

    const performSearch = () => {
        setFilters({ searchTerm, category: selectedCategory || undefined });
        setShowResults(true);
        if (selectedCategory) {
            setLastSelectedCategory(selectedCategory);
        }
    };

    const handleOpenAddDialog = () => {
        setItemToEdit(undefined);
        setIsAddDialogOpen(true);
    };

    const handleCloseAddDialog = () => {
        setIsAddDialogOpen(false);
        setItemToEdit(undefined);
    };

    const handleEditItem = (item: FoodItem) => {
        setItemToEdit(item);
        setIsAddDialogOpen(true);
    };

    // Pegar os 5 itens mais recentes
    const recentItems = [...items]
        .sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime())
        .slice(0, 5);

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Gerenciador do Freezer
                    </Typography>
                    <IconButton 
                        color="inherit" 
                        aria-label="manage categories"
                        onClick={() => setIsCategoryManagerOpen(true)}
                        sx={{ mr: 1 }}
                    >
                        <SettingsIcon />
                    </IconButton>
                    <IconButton 
                        color="inherit" 
                        aria-label="add item"
                        onClick={handleOpenAddDialog}
                    >
                        <AddIcon />
                    </IconButton>
                </Toolbar>
            </AppBar>

            <FoodItemForm
                open={isAddDialogOpen}
                onClose={handleCloseAddDialog}
                initialData={itemToEdit}
            />

            <CategoryManager
                open={isCategoryManagerOpen}
                onClose={() => setIsCategoryManagerOpen(false)}
            />

            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Grid container spacing={3}>
                    {/* Search and Filter Section */}
                    <Grid item xs={12}>
                        <Paper sx={{ p: 2 }}>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <TextField
                                    fullWidth
                                    variant="outlined"
                                    placeholder="Buscar item..."
                                    value={searchTerm}
                                    onChange={handleSearch}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            performSearch();
                                        }
                                    }}
                                    InputProps={{
                                        endAdornment: (
                                            <IconButton 
                                                onClick={performSearch}
                                                edge="end"
                                            >
                                                <SearchIcon sx={{ color: 'text.secondary' }} />
                                            </IconButton>
                                        )
                                    }}
                                />
                                <FormControl sx={{ minWidth: 200 }}>
                                    <InputLabel>Categoria</InputLabel>
                                    <Select
                                        value={selectedCategory}
                                        onChange={handleCategoryChange}
                                        label="Categoria"
                                    >
                                        <MenuItem value="">Todas</MenuItem>
                                        {categories.map((category) => (
                                            <MenuItem key={category.id} value={category.id}>
                                                {category.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Box>
                        </Paper>
                    </Grid>

                    {/* Search Results Section */}
                    {showResults && (
                        <Grid item xs={12}>
                            <Paper sx={{ p: 2 }}>
                                <Typography variant="h6" gutterBottom>
                                    Resultados da Busca
                                </Typography>
                                {loading ? (
                                    <Typography>Buscando...</Typography>
                                ) : (
                                    <>
                                        {filteredItems().length > 0 ? (
                                            <Grid container spacing={2}>
                                                {filteredItems().map((item) => (
                                                    <Grid item xs={12} sm={6} md={4} key={item.id}>
                                                        <Paper 
                                                            sx={{ 
                                                                p: 2, 
                                                                display: 'flex', 
                                                                flexDirection: 'column',
                                                                height: '100%',
                                                                cursor: 'pointer',
                                                                '&:hover': {
                                                                    bgcolor: 'action.hover'
                                                                }
                                                            }}
                                                            onClick={() => handleEditItem(item)}
                                                        >
                                                            <Typography variant="h6">{item.name}</Typography>
                                                            <Typography color="text.secondary">
                                                                {item.category}
                                                            </Typography>
                                                            <Typography>
                                                                Quantidade: {item.quantity}
                                                            </Typography>
                                                            <Typography>
                                                                Gaveta: {item.location.drawer}
                                                            </Typography>
                                                        </Paper>
                                                    </Grid>
                                                ))}
                                            </Grid>
                                        ) : (
                                            <Box sx={{ 
                                                textAlign: 'center', 
                                                py: 4,
                                                color: 'text.secondary'
                                            }}>
                                                <Typography variant="h6">
                                                    Opa! Parece que o seu freezer não possui isso :(
                                                </Typography>
                                            </Box>
                                        )}
                                    </>
                                )}
                            </Paper>
                        </Grid>
                    )}

                    {/* Recent Items Section */}
                    <Grid item xs={12}>
                        <Paper sx={{ p: 2 }}>
                            <Typography variant="h6" gutterBottom>
                                Adicionados Recentemente
                            </Typography>
                            <Grid container spacing={2}>
                                {recentItems.map((item) => (
                                    <Grid item xs={12} sm={6} md={2.4} key={item.id}>
                                        <ButtonBase 
                                            onClick={() => handleEditItem(item)}
                                            sx={{ width: '100%', textAlign: 'left' }}
                                        >
                                            <Paper 
                                                sx={{ 
                                                    p: 2, 
                                                    display: 'flex', 
                                                    flexDirection: 'column',
                                                    height: '100%',
                                                    width: '100%',
                                                    bgcolor: 'primary.light',
                                                    color: 'primary.contrastText',
                                                    transition: 'all 0.2s',
                                                    '&:hover': {
                                                        bgcolor: 'primary.main',
                                                        transform: 'scale(1.02)',
                                                    }
                                                }}
                                            >
                                                <Typography variant="subtitle1" noWrap>
                                                    {item.name}
                                                </Typography>
                                                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                                    {item.category}
                                                </Typography>
                                                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                                    Qtd: {item.quantity}
                                                </Typography>
                                            </Paper>
                                        </ButtonBase>
                                    </Grid>
                                ))}
                            </Grid>
                        </Paper>
                    </Grid>

                    {/* Categories Section */}
                    <Grid item xs={12}>
                        <Paper sx={{ p: 2 }}>
                            <Typography variant="h6" gutterBottom>
                                Categorias
                            </Typography>
                            <Grid container spacing={2}>
                                {categories.map((category) => (
                                    <Grid item xs={12} sm={6} md={2.4} key={category.id}>
                                        <ButtonBase 
                                            onClick={() => {
                                                setSelectedCategory(category.id);
                                                setFilters({ category: category.id });
                                                setShowResults(true);
                                            }}
                                            sx={{ width: '100%' }}
                                        >
                                            <Paper 
                                                sx={{ 
                                                    p: 2, 
                                                    display: 'flex', 
                                                    flexDirection: 'column',
                                                    width: '100%',
                                                    bgcolor: selectedCategory === category.id ? 'primary.main' : 'primary.light',
                                                    color: 'primary.contrastText',
                                                    transition: 'all 0.2s',
                                                    '&:hover': {
                                                        bgcolor: 'primary.main',
                                                        transform: 'scale(1.02)',
                                                    }
                                                }}
                                            >
                                                <Typography variant="h6" align="center">
                                                    {category.name}
                                                </Typography>
                                            </Paper>
                                        </ButtonBase>
                                    </Grid>
                                ))}
                            </Grid>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
}; 