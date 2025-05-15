import React, { useState, useEffect, useContext } from 'react';
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
    FormControl as MuiFormControl,
    InputLabel,
    ButtonBase,
    Menu,
    Tooltip
} from '@mui/material';
import { 
    Add as AddIcon, 
    Search as SearchIcon, 
    Settings as SettingsIcon,
    DarkMode as DarkModeIcon,
    LightMode as LightModeIcon
} from '@mui/icons-material';
import { useFreezerStore } from '../store/freezerStore';
import { useCategoryStore } from '../store/categoryStore';
import { FoodItem } from '../types';
import { FoodItemForm } from './FoodItemForm';
import { CategoryManager } from './CategoryManager';
import { ColorModeContext } from '../App';

export const FreezerManager: React.FC = () => {
    const { filteredItems, setFilters, loading, items, fetchItems, lastSelectedCategory, setLastSelectedCategory } = useFreezerStore();
    const { categories } = useCategoryStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>(lastSelectedCategory);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
    const [itemToEdit, setItemToEdit] = useState<FoodItem | undefined>(undefined);
    const [showResults, setShowResults] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const colorMode = useContext(ColorModeContext);

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

    // Função auxiliar para obter o nome da categoria
    const getCategoryName = (categoryId: string) => {
        const category = categories.find(cat => cat.id === categoryId);
        return category?.name || categoryId;
    };

    const handleSettingsClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleSettingsClose = () => {
        setAnchorEl(null);
    };

    const handleManageCategories = () => {
        setIsCategoryManagerOpen(true);
        handleSettingsClose();
    };

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Freezinfo
                    </Typography>
                    <Tooltip title={colorMode.mode === 'dark' ? 'Modo claro' : 'Modo escuro'}>
                        <IconButton 
                            color="inherit" 
                            onClick={colorMode.toggleColorMode}
                            sx={{ mr: 1 }}
                        >
                            {colorMode.mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
                        </IconButton>
                    </Tooltip>
                    <IconButton 
                        color="inherit" 
                        aria-label="configurações"
                        onClick={handleSettingsClick}
                        sx={{ mr: 1 }}
                    >
                        <SettingsIcon />
                    </IconButton>
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleSettingsClose}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'right',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                    >
                        <MenuItem onClick={handleManageCategories}>
                            Gerenciar Categorias
                        </MenuItem>
                    </Menu>
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
                                <MuiFormControl sx={{ minWidth: 200 }}>
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
                                </MuiFormControl>
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
                                                                {getCategoryName(item.category)}
                                                            </Typography>
                                                            <Typography>
                                                                Quantidade: {item.quantity}
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
                                                    {getCategoryName(item.category)}
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