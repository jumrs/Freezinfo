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
    LightMode as LightModeIcon,
    MenuBook as MenuBookIcon
} from '@mui/icons-material';
import { useFreezerStore } from '../store/freezerStore';
import { useCategoryStore } from '../store/categoryStore';
import { FoodItem } from '../types';
import { FoodItemForm } from './FoodItemForm';
import { CategoryManager } from './CategoryManager';
import { RecipeForm } from './RecipeForm';
import { RecipeList } from './RecipeList';
import { ColorModeContext } from '../App';

export const FreezerManager: React.FC = () => {
    const { filteredItems, setFilters, loading, items, fetchItems, lastSelectedCategory, setLastSelectedCategory, getSortedItems } = useFreezerStore();
    const { categories } = useCategoryStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>(lastSelectedCategory);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
    const [isRecipeFormOpen, setIsRecipeFormOpen] = useState(false);
    const [showRecipeList, setShowRecipeList] = useState(false);
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
        setFilters({ searchTerm });
        setShowResults(true);
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

    const handleOpenRecipeForm = () => {
        setIsRecipeFormOpen(true);
    };

    const handleCloseRecipeForm = () => {
        setIsRecipeFormOpen(false);
    };

    const handleOpenRecipeList = () => {
        setShowRecipeList(true);
    };

    const handleCloseRecipeList = () => {
        setShowRecipeList(false);
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

    if (showRecipeList) {
        return <RecipeList onBack={handleCloseRecipeList} />;
    }

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
                            sx={{ mr: 1, p: 1.5 }}
                        >
                            {colorMode.mode === 'dark' ? <LightModeIcon fontSize="large" /> : <DarkModeIcon fontSize="large" />}
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Receitas">
                        <IconButton 
                            color="inherit" 
                            aria-label="receitas"
                            onClick={handleOpenRecipeList}
                            sx={{ mr: 1, p: 1.5 }}
                        >
                            <MenuBookIcon fontSize="large" />
                        </IconButton>
                    </Tooltip>
                    <IconButton 
                        color="inherit" 
                        aria-label="configurações"
                        onClick={handleSettingsClick}
                        sx={{ mr: 1, p: 1.5 }}
                    >
                        <SettingsIcon fontSize="large" />
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
                        sx={{ p: 1.5 }}
                    >
                        <AddIcon fontSize="large" />
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

            <RecipeForm
                open={isRecipeFormOpen}
                onClose={handleCloseRecipeForm}
            />

            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Grid container spacing={3}>
                    {/* Search and Filter Section */}
                    <Grid item xs={12}>
                        <Paper sx={{ p: 2 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
                                        style: { fontSize: '1.1rem' },
                                        endAdornment: (
                                            <IconButton 
                                                onClick={performSearch}
                                                edge="end"
                                                sx={{ p: 1.5 }}
                                            >
                                                <SearchIcon fontSize="medium" />
                                            </IconButton>
                                        )
                                    }}
                                    sx={{ '& .MuiOutlinedInput-root': { minHeight: '56px' } }}
                                />
                                <Grid container spacing={2}>
                                    {/* Botão Todos */}
                                    <Grid item xs={12} sm={6} md={2.4}>
                                        <ButtonBase 
                                            onClick={() => {
                                                if (selectedCategory === "todos" && showResults) {
                                                    // Se já está selecionado, desseleciona
                                                    setSelectedCategory("");
                                                    setFilters({});
                                                    setShowResults(false);
                                                } else {
                                                    // Se não está selecionado, seleciona
                                                    setSelectedCategory("todos");
                                                    setFilters({});  // Sem filtro de categoria para mostrar todos
                                                    setShowResults(true);
                                                }
                                            }}
                                            sx={{ width: '100%' }}
                                        >
                                            <Paper 
                                                sx={{ 
                                                    p: 2, 
                                                    display: 'flex', 
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    width: '100%',
                                                    minHeight: '90px',
                                                    bgcolor: selectedCategory === "todos" && showResults ? 'primary.main' : 'primary.light',
                                                    color: 'primary.contrastText',
                                                    transition: 'all 0.2s',
                                                    '&:hover': {
                                                        bgcolor: 'primary.main',
                                                        transform: 'scale(1.02)',
                                                    }
                                                }}
                                            >
                                                <Typography 
                                                    variant="h6" 
                                                    align="center"
                                                    sx={{
                                                        fontSize: '1rem',
                                                        whiteSpace: 'normal',
                                                        wordBreak: 'break-word',
                                                        lineHeight: '1.3',
                                                    }}
                                                >
                                                    Todos
                                                </Typography>
                                            </Paper>
                                        </ButtonBase>
                                    </Grid>
                                    {/* Outras categorias */}
                                    {categories.map((category) => (
                                        <Grid item xs={12} sm={6} md={2.4} key={category.id}>
                                            <ButtonBase 
                                                onClick={() => {
                                                    if (selectedCategory === category.id && showResults) {
                                                        // Se já está selecionado, desseleciona
                                                        setSelectedCategory("");
                                                        setFilters({});
                                                        setShowResults(false);
                                                    } else {
                                                        // Se não está selecionado, seleciona
                                                        setSelectedCategory(category.id);
                                                        setFilters({ category: category.id });
                                                        setShowResults(true);
                                                    }
                                                }}
                                                sx={{ width: '100%' }}
                                            >
                                                <Paper 
                                                    sx={{ 
                                                        p: 2, 
                                                        display: 'flex', 
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        width: '100%',
                                                        minHeight: '90px',
                                                        bgcolor: selectedCategory === category.id && showResults ? 'primary.main' : 'primary.light',
                                                        color: 'primary.contrastText',
                                                        transition: 'all 0.2s',
                                                        '&:hover': {
                                                            bgcolor: 'primary.main',
                                                            transform: 'scale(1.02)',
                                                        }
                                                    }}
                                                >
                                                    <Typography 
                                                        variant="h6" 
                                                        align="center"
                                                        sx={{
                                                            fontSize: '1rem',
                                                            whiteSpace: 'normal',
                                                            wordBreak: 'break-word',
                                                            lineHeight: '1.3',
                                                        }}
                                                    >
                                                        {getCategoryName(category.id)}
                                                    </Typography>
                                                </Paper>
                                            </ButtonBase>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>
                        </Paper>
                    </Grid>

                    {/* Search Results Section */}
                    {showResults && (
                        <Grid item xs={12}>
                            <Paper sx={{ p: 2 }}>
                                <Typography variant="h6" gutterBottom>
                                    {selectedCategory === "todos" ? "Todos os Itens" : "Resultados da Busca"}
                                </Typography>
                                {loading ? (
                                    <Typography>Buscando...</Typography>
                                ) : (
                                    <>
                                        {(selectedCategory === "todos" ? getSortedItems() : filteredItems()).length > 0 ? (
                                            <Grid container spacing={2}>
                                                {(selectedCategory === "todos" ? getSortedItems() : filteredItems()).map((item) => (
                                                    <Grid item xs={12} sm={6} md={4} key={item.id}>
                                                        <Paper 
                                                            sx={{ 
                                                                p: 2.5,
                                                                display: 'flex', 
                                                                flexDirection: 'column',
                                                                height: '100%',
                                                                minHeight: '120px',
                                                                cursor: 'pointer',
                                                                '&:hover': {
                                                                    bgcolor: 'action.hover'
                                                                }
                                                            }}
                                                            onClick={() => handleEditItem(item)}
                                                        >
                                                            <Typography variant="h6" sx={{ fontSize: '1.1rem', mb: 0.5 }}>{item.name}</Typography>
                                                            <Typography color="text.secondary" sx={{ fontSize: '0.9rem', mb: 0.5 }}>
                                                                {getCategoryName(item.category)}
                                                            </Typography>
                                                            <Typography sx={{ fontSize: '0.9rem' }}>
                                                                Quantidade: {item.quantity}
                                                            </Typography>
                                                            {item.notes && (
                                                                <Typography color="text.secondary" sx={{ fontSize: '0.85rem', mt: 1, fontStyle: 'italic' }}>
                                                                    {item.notes}
                                                                </Typography>
                                                            )}
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
                                                    p: 2.5,
                                                    display: 'flex', 
                                                    flexDirection: 'column',
                                                    height: '100%',
                                                    width: '100%',
                                                    minHeight: '100px',
                                                    bgcolor: 'primary.light',
                                                    color: 'primary.contrastText',
                                                    transition: 'all 0.2s',
                                                    '&:hover': {
                                                        bgcolor: 'primary.main',
                                                        transform: 'scale(1.02)',
                                                    }
                                                }}
                                            >
                                                <Typography variant="subtitle1" noWrap sx={{ fontSize: '1rem', mb: 0.5 }}>
                                                    {item.name}
                                                </Typography>
                                                <Typography variant="body2" sx={{ opacity: 0.8, fontSize: '0.85rem', mb: 0.5 }}>
                                                    {getCategoryName(item.category)}
                                                </Typography>
                                                <Typography variant="body2" sx={{ opacity: 0.8, fontSize: '0.85rem' }}>
                                                    Qtd: {item.quantity}
                                                </Typography>
                                                {item.notes && (
                                                    <Typography variant="body2" sx={{ opacity: 0.8, fontSize: '0.85rem', mt: 0.5, fontStyle: 'italic' }}>
                                                        {item.notes.length > 20 ? `${item.notes.substring(0, 20)}...` : item.notes}
                                                    </Typography>
                                                )}
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