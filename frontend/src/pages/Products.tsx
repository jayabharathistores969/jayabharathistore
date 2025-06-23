import React, { useState, useEffect } from 'react';
import {
  Container, 
  Typography, 
  Card, 
  CardContent, 
  CardMedia, 
  Button, 
  Box, 
  Chip, 
  useTheme, 
  Snackbar, 
  Alert, 
  CircularProgress,
  TextField,
  InputAdornment,
  Rating,
  IconButton,
  Tooltip,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Switch,
  FormControlLabel,
  Divider,
  Badge,
  Fab,
  useMediaQuery,
  Paper
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  ShoppingCart as CartIcon,
  Star as StarIcon,
  LocalOffer as OfferIcon,
  TrendingUp as TrendingIcon,
  FlashOn as FlashIcon,
  ArrowBack as BackIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { Grid } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { config } from '../config';
import BackButton from '../components/BackButton';
import api from '../api';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  stock: number;
  unit: string;
  isAvailable: boolean;
}

const Products: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' | 'warning' }>({ open: false, message: '', severity: 'success' });
  const [addingId, setAddingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [sortBy, setSortBy] = useState('name');
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const { token } = useAuth();

  const categories = ['all', ...Array.from(new Set(products.map(product => product.category)))];

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/products/all');
      setProducts(response.data);
      const maxPrice = Math.max(...response.data.map((p: Product) => p.price), 0);
      setPriceRange([0, Math.ceil(maxPrice / 100) * 100]);
    } catch (error: any) {
      console.error('Error fetching products:', error);
      setError('Failed to load products. Please try refreshing the page.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleFavoriteToggle = (productId: string) => {
    setFavorites(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
    setSnackbar({
      open: true,
      message: favorites.includes(productId) ? 'Removed from favorites' : 'Added to favorites',
      severity: 'success'
    });
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
    const matchesAvailability = !showOnlyAvailable || product.isAvailable;
    return matchesSearch && matchesCategory && matchesPrice && matchesAvailability;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'name':
        return a.name.localeCompare(b.name);
      case 'stock':
        return b.stock - a.stock;
      default:
        return 0;
    }
  });

  const addToCart = async (productId: string) => {
    if (!token) {
      setSnackbar({ open: true, message: 'Please login to add items to cart', severity: 'error' });
      return;
    }

    setAddingId(productId);
    try {
      await api.post('/cart/add', {
        productId,
        quantity: 1
      });
      setSnackbar({ open: true, message: 'Product added to cart!', severity: 'success' });
    } catch (error) {
      console.error('Error adding to cart:', error);
      setSnackbar({ open: true, message: 'Failed to add product to cart', severity: 'error' });
    } finally {
      setAddingId(null);
    }
  };

  const Filters = () => (
    <Box sx={{ p: 2, width: isMobile ? 'auto' : 280 }}>
      <Typography variant="h6" gutterBottom>Filters</Typography>
      <Divider sx={{ my: 2 }} />
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Category</InputLabel>
        <Select
          value={selectedCategory}
          label="Category"
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {categories.map(cat => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
        </Select>
      </FormControl>
      <Typography gutterBottom>Price Range</Typography>
      <Slider
        value={priceRange}
        onChange={(_, newValue) => setPriceRange(newValue as [number, number])}
        valueLabelDisplay="auto"
        min={0}
        max={1000}
        sx={{ mb: 2 }}
      />
      <FormControlLabel
        control={<Switch checked={showOnlyAvailable} onChange={(e) => setShowOnlyAvailable(e.target.checked)} />}
        label="Show only available"
      />
    </Box>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Paper sx={{ mb: 4, p: 2, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <BackButton />
            <Typography variant={isMobile ? 'h5' : 'h4'} fontWeight={700} sx={{ flexGrow: 1 }}>
              Our Products
            </Typography>
            {isMobile && (
              <IconButton onClick={() => setFilterDrawerOpen(true)}>
                <FilterIcon />
              </IconButton>
            )}
            <TextField
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
              size="small"
              sx={{ width: isMobile ? '100%' : 250 }}
            />
            <FormControl size="small" sx={{ width: isMobile ? '100%' : 200 }}>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                label="Sort By"
                onChange={(e) => setSortBy(e.target.value)}
              >
                <MenuItem value="name">Name</MenuItem>
                <MenuItem value="price-low">Price: Low to High</MenuItem>
                <MenuItem value="price-high">Price: High to Low</MenuItem>
                <MenuItem value="stock">Stock</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Paper>

        <Grid container spacing={3}>
          {!isMobile && (
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 2, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', position: 'sticky', top: 20 }}>
                <Filters />
              </Paper>
            </Grid>
          )}
          
          <Grid item xs={12} md={isMobile ? 12 : 9}>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            
            {sortedProducts.length === 0 && !loading ? (
              <Box sx={{ textAlign: 'center', py: 10 }}>
                <Typography variant="h5">No products found</Typography>
                <Typography color="text.secondary">Try adjusting your filters or search term.</Typography>
              </Box>
            ) : (
              <Grid container spacing={isMobile ? 2 : 3}>
                {sortedProducts.map((product) => (
                  <Grid item xs={12} sm={6} md={4} key={product._id}>
                    <Card sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      borderRadius: 3,
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      '&:hover': {
                        transform: 'translateY(-6px)',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.12)'
                      }
                    }}>
                      <Box sx={{ position: 'relative' }}>
                        <CardMedia
                          component="img"
                          height="200"
                          image={product.image || 'https://via.placeholder.com/300x200?text=Product'}
                          alt={product.name}
                          sx={{ objectFit: 'cover' }}
                        />
                        <IconButton
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            bgcolor: 'rgba(255,255,255,0.9)',
                            '&:hover': { bgcolor: 'white' }
                          }}
                          onClick={() => handleFavoriteToggle(product._id)}
                        >
                          {favorites.includes(product._id) ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
                        </IconButton>
                        {!product.isAvailable && (
                          <Chip
                            label="Out of Stock"
                            color="error"
                            size="small"
                            sx={{ position: 'absolute', top: 8, left: 8, fontWeight: 'bold' }}
                          />
                        )}
                         {product.isAvailable && product.stock < 10 && product.stock > 0 && (
                          <Chip
                            label="Low Stock"
                            color="warning"
                            size="small"
                            sx={{ position: 'absolute', top: 8, left: 8, fontWeight: 'bold' }}
                          />
                        )}
                      </Box>
                      <CardContent sx={{ flexGrow: 1, p: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Typography variant="h6" fontWeight={600} gutterBottom>
                            {product.name}
                          </Typography>
                          <Chip label={product.category} size="small" />
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, height: 40 }}>
                          {product.description}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Rating value={4.5} readOnly size="small" />
                          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                            (4.5)
                          </Typography>
                        </Box>
                        
                      </CardContent>
                      <Box sx={{ p: 2, pt: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="h5" color="primary.main" fontWeight={700}>
                            ₹{product.price}
                          </Typography>
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={addingId === product._id ? <CircularProgress size={20} color="inherit" /> : <CartIcon />}
                            onClick={() => addToCart(product._id)}
                            disabled={!product.isAvailable || addingId === product._id}
                            sx={{ borderRadius: 2, px: 2 }}
                          >
                            {addingId === product._id ? 'Adding...' : 'Add to Cart'}
                          </Button>
                        </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Grid>
        </Grid>

        <Drawer anchor="left" open={filterDrawerOpen} onClose={() => setFilterDrawerOpen(false)}>
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Filters</Typography>
            <IconButton onClick={() => setFilterDrawerOpen(false)}><CloseIcon /></IconButton>
          </Box>
          <Divider />
          <Filters />
        </Drawer>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default Products; 