import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Container,
  Divider,
  Paper,
  TextField,
  InputAdornment,
  Chip,
  Rating,
  IconButton,
  Badge,
  AppBar,
  Toolbar,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  useTheme,
  useMediaQuery,
  Fab,
  Tooltip,
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import {
  Search as SearchIcon,
  ShoppingCart as CartIcon,
  Person as PersonIcon,
  Menu as MenuIcon,
  Home as HomeIcon,
  Storefront as StoreIcon,
  Info as InfoIcon,
  ContactMail as ContactIcon,
  ArrowBack as BackIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  LocalShipping as ShippingIcon,
  Security as SecurityIcon,
  Support as SupportIcon,
  Star as StarIcon,
  TrendingUp as TrendingIcon,
  FlashOn as FlashIcon,
  LocalOffer as OfferIcon
} from '@mui/icons-material';
import logo from '../assets/logo.png';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  stock: number;
}

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await api.get('/products');
        setProducts(response.data);
      } catch (error) {
        console.error('Failed to fetch products', error);
        setSnackbar({
          open: true,
          message: 'Failed to load products.',
          severity: 'error',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];

  const handleLogout = () => {
    navigate('/login');
  };

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
                         product.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredProducts = filteredProducts.slice(0, 8);
  const trendingProducts = filteredProducts.slice(2, 6);

  if (loading || authLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa' }}>
      {/* Hero Section */}
      <Box sx={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        py: { xs: 6, md: 8 },
        textAlign: 'center'
      }}>
        <Container maxWidth="lg">
          <Typography variant={isMobile ? 'h4' : 'h2'} fontWeight={700} gutterBottom sx={{ mb: 3 }}>
            Welcome to JayaBharathi Store
          </Typography>
          <Typography variant={isMobile ? 'h6' : 'h5'} sx={{ mb: 4, opacity: 0.9 }}>
            Your trusted neighborhood grocery partner with quality products and friendly service
          </Typography>
          {/* Search Bar */}
          <Box sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}>
            <TextField
              fullWidth
              placeholder="Search for products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: 3,
                  bgcolor: 'white',
                  '& .MuiOutlinedInput-notchedOutline': { border: 'none' }
                }
              }}
            />
          </Box>
          {/* Category Chips */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
            {categories.map((category) => (
              <Chip
                key={category}
                label={category.charAt(0).toUpperCase() + category.slice(1)}
                onClick={() => setSelectedCategory(category)}
                color={selectedCategory === category ? 'secondary' : 'default'}
                sx={{
                  bgcolor: selectedCategory === category ? 'white' : 'rgba(255,255,255,0.2)',
                  color: selectedCategory === category ? 'primary.main' : 'white',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                }}
              />
            ))}
          </Box>
        </Container>
      </Box>

      {/* Featured Products */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <FlashIcon sx={{ mr: 2, color: 'primary.main' }} />
          <Typography variant="h4" fontWeight={700}>
            Featured Products
          </Typography>
        </Box>
        <Grid container spacing={3}>
          {featuredProducts.map((product: any) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
              <Card sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 3,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
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
                  {product.stock < 10 && (
                    <Chip
                      label="Low Stock"
                      color="warning"
                      size="small"
                      sx={{ position: 'absolute', top: 8, left: 8 }}
                    />
                  )}
                </Box>
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    {product.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {product.description}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Rating value={4.5} readOnly size="small" />
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                      (4.5)
                    </Typography>
                  </Box>
                  <Chip
                    label={product.category}
                    size="small"
                    sx={{ mb: 2, bgcolor: 'primary.light', color: 'white' }}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                    <Typography variant="h6" color="primary" fontWeight={700}>
                      ₹{product.price}
                    </Typography>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<CartIcon />}
                      onClick={() => navigate('/products')}
                      sx={{ borderRadius: 2 }}
                    >
                      Add to Cart
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Why Choose Us Section */}
      <Box sx={{ bgcolor: 'white', py: 6 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" fontWeight={700} align="center" sx={{ mb: 6 }}>
            Why Choose JayaBharathi Store?
          </Typography>
          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={12} sm={6} md={3} sx={{ textAlign: 'center' }}>
              <Paper elevation={0} sx={{ p: 3, bgcolor: 'transparent' }}>
                <ShippingIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" fontWeight={600}>Fast Delivery</Typography>
                <Typography variant="body2" color="text.secondary">
                  Same day delivery for orders placed before 2 PM
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3} sx={{ textAlign: 'center' }}>
              <Paper elevation={0} sx={{ p: 3, bgcolor: 'transparent' }}>
                <SecurityIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" fontWeight={600}>Secure Payment</Typography>
                <Typography variant="body2" color="text.secondary">
                  Multiple payment options with secure transactions
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3} sx={{ textAlign: 'center' }}>
              <Paper elevation={0} sx={{ p: 3, bgcolor: 'transparent' }}>
                <StarIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" fontWeight={600}>Quality Products</Typography>
                <Typography variant="body2" color="text.secondary">
                  Fresh and high-quality products from trusted suppliers
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3} sx={{ textAlign: 'center' }}>
              <Paper elevation={0} sx={{ p: 3, bgcolor: 'transparent' }}>
                <SupportIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" fontWeight={600}>24/7 Support</Typography>
                <Typography variant="body2" color="text.secondary">
                  Round the clock customer support for your queries
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Trending Products */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <TrendingIcon sx={{ mr: 2, color: 'primary.main' }} />
          <Typography variant="h4" fontWeight={700}>
            Trending Now
          </Typography>
        </Box>
        <Grid container spacing={3}>
          {trendingProducts.map((product: any) => (
            <Grid item xs={12} sm={6} md={3} key={product._id}>
               <Card sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 3,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
                }
              }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={product.image}
                  alt={product.name}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent>
                  <Typography gutterBottom variant="h6" component="div">
                    {product.name}
                  </Typography>
                  <Typography variant="h6" color="primary">
                    ₹{product.price}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Home;