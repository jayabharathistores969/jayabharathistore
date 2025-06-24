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
import { Link } from 'react-router-dom';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  stock: number;
}

const LandingPage: React.FC = () => {
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
    // Fetch products from the correct backend endpoint
    const fetchProducts = async () => {
      try {
        setLoading(true);
        console.log('Fetching products from:', api.defaults.baseURL + '/products');
        const response = await api.get('/products');
        console.log('Products response:', response.data);
        setProducts(response.data);
      } catch (error: any) {
        console.error('Failed to fetch products', error);
        console.error('Error details:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
          config: error.config
        });
        
        let errorMessage = 'Failed to load products.';
        if (error.response?.status === 401) {
          errorMessage = 'Authentication required to load products.';
        } else if (error.response?.status === 404) {
          errorMessage = 'Products endpoint not found.';
        } else if (error.response?.status === 500) {
          errorMessage = 'Server error while loading products.';
        } else if (error.code === 'ERR_NETWORK') {
          errorMessage = 'Network error - please check your connection.';
        }
        
        setSnackbar({
          open: true,
          message: errorMessage,
          severity: 'error',
        });
        // No fallback products, only show error
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

  const navItems = [
    { text: 'Home', path: '/', icon: <HomeIcon /> },
    { text: 'Products', path: '/products', icon: <StoreIcon /> },
    { text: 'About', path: '/about', icon: <InfoIcon /> },
    { text: 'Contact', path: '/contact', icon: <ContactIcon /> },
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa' }}>
      {/* Hero Section */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        py: { xs: 8, md: 12 },
        textAlign: 'center'
      }}>
        <Container maxWidth="lg">
          <Typography variant={isMobile ? "h3" : "h2"} fontWeight={700} gutterBottom sx={{ mb: 2 }}>
            Quality Groceries, Delivered Fast
          </Typography>
          <Typography variant={isMobile ? "h6" : "h5"} sx={{ mb: 4, opacity: 0.9, maxWidth: '700px', mx: 'auto' }}>
            Your trusted neighborhood grocery partner. Fresh products, great prices, and friendly service, right to your doorstep.
          </Typography>
          
          <Button 
            variant="contained" 
            size="large"
            onClick={() => navigate('/products')}
            sx={{ 
              px: 5, 
              py: 1.5,
              borderRadius: 3,
              bgcolor: 'white',
              color: 'primary.main',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.9)',
                transform: 'scale(1.05)'
              },
              transition: 'all 0.2s ease-in-out'
            }}
          >
            Shop Now
          </Button>

          {/* Search Bar can be here if needed, or removed for cleaner look */}
        </Container>
      </Box>

      {/* Featured Products */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <FlashIcon sx={{ mr: 2, color: 'primary.main', fontSize: '2.5rem' }} />
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
                   {product.stock === 0 && (
                    <Chip
                      label="Out of Stock"
                      color="error"
                      size="small"
                      sx={{ position: 'absolute', top: 8, left: 8, fontWeight: 'bold' }}
                    />
                  )}
                </Box>
                
                <CardContent sx={{ flexGrow: 1, p: 2 }}>
                  <Typography variant="h6" fontWeight={600} gutterBottom sx={{ minHeight: 64 }}>
                    {product.name}
                  </Typography>
                   <Chip 
                    label={product.category} 
                    size="small" 
                    sx={{ mb: 2 }}
                  />
                </CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, pt: 0 }}>
                    <Typography variant="h5" color="primary" fontWeight={700}>
                      ₹{product.price}
                    </Typography>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<CartIcon />}
                      onClick={() => navigate(`/products`)} // Simplified action
                      sx={{ borderRadius: 2 }}
                    >
                      View
                    </Button>
                  </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Why Choose Us Section */}
      <Box sx={{ bgcolor: 'white', py: 8 }}>
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
          <TrendingIcon sx={{ mr: 2, color: 'primary.main', fontSize: '2.5rem' }} />
          <Typography variant="h4" fontWeight={700}>
            Trending Now
          </Typography>
        </Box>
        <Grid container spacing={3}>
          {trendingProducts.map((product: any) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
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
                 <CardMedia
                  component="img"
                  height="180"
                  image={product.image}
                  alt={product.name}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent sx={{ flexGrow: 1, p: 2 }}>
                  <Typography gutterBottom variant="h6" component="div" noWrap>
                    {product.name}
                  </Typography>
                  <Typography variant="h5" color="primary" fontWeight="bold">
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

export default LandingPage; 