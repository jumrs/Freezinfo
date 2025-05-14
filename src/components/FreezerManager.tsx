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
    ButtonBase
} from '@mui/material';
import { Add as AddIcon, Search as SearchIcon } from '@mui/icons-material';
import { useFreezerStore } from '../store/freezerStore';
import { FoodCategory, FoodItem } from '../types';
import { FoodItemForm } from './FoodItemForm';

export const FreezerManager: React.FC = () => {
    const { filteredItems, setFilters, loading, error, items, fetchItems } = useFreezerStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<FoodCategory | ''>('');
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [itemToEdit, setItemToEdit] = useState<FoodItem | undefined>(undefined);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        const term = event.target.value;
        setSearchTerm(term);
        setFilters({ searchTerm: term, category: selectedCategory || undefined });
    };

    const handleCategoryChange = (event: any) => {
        const category = event.target.value as FoodCategory | '';
        setSelectedCategory(category);
        setFilters({ searchTerm, category: category || undefined });
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

            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Grid container spacing={3}>
                    {/* Search and Filter Section */}
                    <Grid item xs={12}>
                        <Paper sx={{ p: 2, display: 'flex', gap: 2 }}>
                            <Box sx={{ display: 'flex', flexGrow: 1, gap: 1 }}>
                                <TextField
                                    fullWidth
                                    variant="outlined"
                                    placeholder="Buscar item..."
                                    value={searchTerm}
                                    onChange={handleSearch}
                                    InputProps={{
                                        startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                    }}
                                />
                                <IconButton 
                                    color="primary" 
                                    onClick={() => setFilters({ searchTerm, category: selectedCategory || undefined })}
                                    sx={{ 
                                        bgcolor: 'primary.main',
                                        color: 'white',
                                        '&:hover': {
                                            bgcolor: 'primary.dark',
                                        }
                                    }}
                                >
                                    <SearchIcon />
                                </IconButton>
                            </Box>
                            <FormControl sx={{ minWidth: 200 }}>
                                <InputLabel>Categoria</InputLabel>
                                <Select
                                    value={selectedCategory}
                                    onChange={handleCategoryChange}
                                    label="Categoria"
                                >
                                    <MenuItem value="">Todas</MenuItem>
                                    {Object.values(FoodCategory).map((category) => (
                                        <MenuItem key={category} value={category}>
                                            {category}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Paper>
                    </Grid>

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

                    <Grid item xs={12}>
                        <Divider sx={{ my: 2 }} />
                    </Grid>

                    {/* Items Grid */}
                    <Grid item xs={12}>
                        <Paper sx={{ p: 2 }}>
                            <Typography variant="h6" gutterBottom>
                                Todos os Itens
                            </Typography>
                            {loading ? (
                                <Typography>Carregando...</Typography>
                            ) : error ? (
                                <Typography color="error">{error}</Typography>
                            ) : (
                                <Grid container spacing={2}>
                                    {filteredItems().map((item) => (
                                        <Grid item xs={12} sm={6} md={4} key={item.id}>
                                            <Paper 
                                                sx={{ 
                                                    p: 2, 
                                                    display: 'flex', 
                                                    flexDirection: 'column',
                                                    height: '100%'
                                                }}
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
                            )}
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
}; 