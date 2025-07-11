import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  Badge,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  Chip,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Paper,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Rating,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Search as SearchIcon,
  ShoppingCart as CartIcon,
  Person as PersonIcon,
  History as HistoryIcon,
  Support as SupportIcon,
  Home as HomeIcon,
  Category as CategoryIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Star as StarIcon,
  LocalShipping as ShippingIcon,
  Payment as PaymentIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { config } from '../config';
import api from '../api';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  stock: number;
  rating?: number;
}

interface Order {
  _id: string;
  products: Array<{
    product: Product;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  status: 'pending' | 'processing' | 'packed' | 'out_for_delivery' | 'delivered';
  orderDate: string;
  deliveryAddress: string;
  paymentMethod: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: { xs: 1, sm: 3 } }}>{children}</Box>}
    </div>
  );
}

const UserDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [tabValue, setTabValue] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<{ [key: string]: number }>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [cartLoading, setCartLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [supportDialog, setSupportDialog] = useState(false);
  const [supportMessage, setSupportMessage] = useState('');

  const categories = ['all', 'groceries', 'personal care', 'snacks', 'beverages', 'household'];

  useEffect(() => {
    const initializeData = async () => {
      setError(null);
      try {
        await Promise.all([
          fetchProducts(),
          fetchOrders(),
          fetchCart()
        ]);
      } catch (err) {
        setError('Failed to load dashboard data. Please try refreshing the page.');
        console.error('Dashboard initialization error:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, selectedCategory]);

  const fetchProducts = async () => {
    setProductsLoading(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.API_TIMEOUT);
      
      const response = await api.get('/products', {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      setProducts(response.data);
    } catch (error: any) {
      if (error.name === 'AbortError') {
        setError('Products request timed out. Please try again.');
      } else {
        console.error('Error fetching products:', error);
        setError('Failed to load products. Please try refreshing.');
      }
    } finally {
      setProductsLoading(false);
    }
  };

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.API_TIMEOUT);
      
      const response = await api.get('/orders/my-orders', {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      setOrders(response.data);
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.error('Orders request timed out');
      } else {
        console.error('Error fetching orders:', error);
      }
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchCart = async () => {
    setCartLoading(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.API_TIMEOUT);
      
      const response = await api.get('/cart', {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      const cartItems = response.data.items || [];
      const cartMap: { [key: string]: number } = {};
      cartItems.forEach((item: any) => {
        cartMap[item.product._id] = item.quantity;
      });
      setCart(cartMap);
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.error('Cart request timed out');
      } else {
        console.error('Error fetching cart:', error);
      }
    } finally {
      setCartLoading(false);
    }
  };

  const filterProducts = () => {
    const filtered = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
    setFilteredProducts(filtered);
  };

  const addToCart = async (productId: string) => {
    try {
      await api.post('/cart/add', {
        productId,
        quantity: 1
      });
      setCart(prev => ({
        ...prev,
        [productId]: (prev[productId] || 0) + 1
      }));
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const removeFromCart = async (productId: string) => {
    try {
      const currentQuantity = cart[productId];
      if (currentQuantity <= 1) {
        await api.delete('/cart/' + productId);
        setCart(prev => {
          const newCart = { ...prev };
          delete newCart[productId];
          return newCart;
        });
      } else {
        await api.put('/cart/' + productId, {
          quantity: currentQuantity - 1
        });
        setCart(prev => ({
          ...prev,
          [productId]: prev[productId] - 1
        }));
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const getCartItemCount = () => {
    return Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSupportSubmit = async () => {
    try {
      await api.post('/support', {
        message: supportMessage,
        userId: user?._id
      });
      setSupportMessage('');
      setSupportDialog(false);
      alert('Support message sent successfully!');
    } catch (error) {
      console.error('Error sending support message:', error);
      alert('Failed to send support message. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'processing': return 'info';
      case 'packed': return 'primary';
      case 'out_for_delivery': return 'secondary';
      case 'delivered': return 'success';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* App Bar */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant={isMobile ? "body1" : "h6"} component="div" sx={{ flexGrow: 1 }}>
            {isMobile ? "Jaya Bharathi Store" : "Jaya Bharathi Store - User Dashboard"}
          </Typography>
          <IconButton color="inherit" onClick={() => navigate('/cart')}>
            <Badge badgeContent={getCartItemCount()} color="error">
              <CartIcon />
            </Badge>
          </IconButton>
          <IconButton color="inherit" onClick={() => navigate('/profile')}>
            <PersonIcon />
          </IconButton>
          <Button color="inherit" onClick={logout} size={isMobile ? "small" : "medium"}>
            {isMobile ? "Logout" : "Logout"}
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: { xs: 2, sm: 4 }, mb: 4 }}>
        {/* Error Display */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
            <Button 
              size="small" 
              onClick={() => window.location.reload()} 
              sx={{ ml: 2 }}
            >
              Retry
            </Button>
          </Alert>
        )}

        {/* Welcome Section */}
        <Card sx={{ mb: 3, background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)', color: 'white' }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography variant={isMobile ? "h5" : "h4"} gutterBottom>
              Welcome back, {user?.name}!
            </Typography>
            <Typography variant="body1" sx={{ display: isMobile ? 'none' : 'block' }}>
              Your Local Grocery Partner - Shop with convenience and quality
            </Typography>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="dashboard tabs"
            variant={isMobile ? "fullWidth" : "standard"}
            scrollButtons={isMobile ? "auto" : false}
          >
            <Tab icon={<HomeIcon />} label={isMobile ? "Products" : "Products"} />
            <Tab icon={<HistoryIcon />} label={isMobile ? "Orders" : "Orders"} />
            <Tab icon={<SupportIcon />} label={isMobile ? "Support" : "Support"} />
          </Tabs>
        </Box>

        {/* Products Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            {/* Search and Filter */}
            <Grid item xs={12}>
              <Paper sx={{ p: { xs: 1, sm: 2 }, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Category</InputLabel>
                      <Select
                        value={selectedCategory}
                        label="Category"
                        onChange={(e) => setSelectedCategory(e.target.value)}
                      >
                        {categories.map((category) => (
                          <MenuItem key={category} value={category}>
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Products Grid */}
            {productsLoading ? (
              <Grid item xs={12}>
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                  <CircularProgress />
                </Box>
              </Grid>
            ) : filteredProducts.length === 0 ? (
              <Grid item xs={12}>
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="h6" color="text.secondary">
                    No products found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Try adjusting your search or category filter
                  </Typography>
                </Paper>
              </Grid>
            ) : (
              filteredProducts.map((product) => (
                <Grid item xs={12} sm={6} md={4} key={product._id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Box
                      component="img"
                      src={product.image || 'https://via.placeholder.com/300x200?text=Product'}
                      alt={product.name}
                      sx={{ height: { xs: 150, sm: 200 }, objectFit: 'cover' }}
                    />
                    <CardContent sx={{ flexGrow: 1, p: { xs: 1.5, sm: 2 } }}>
                      <Typography variant={isMobile ? "subtitle1" : "h6"} gutterBottom>
                        {product.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1, display: isMobile ? 'none' : 'block' }}>
                        {product.description}
                      </Typography>
                      <Chip label={product.category} size="small" sx={{ mb: 1 }} />
                      <Typography variant="h6" color="primary" sx={{ mb: 1 }}>
                        ₹{product.price}
                      </Typography>
                      {product.rating && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Rating value={product.rating} readOnly size="small" />
                          <Typography variant="body2" sx={{ ml: 1 }}>
                            ({product.rating})
                          </Typography>
                        </Box>
                      )}
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Stock: {product.stock} units
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {cart[product._id] ? (
                          <>
                            <IconButton
                              size="small"
                              onClick={() => removeFromCart(product._id)}
                              disabled={product.stock === 0}
                            >
                              <RemoveIcon />
                            </IconButton>
                            <Typography variant="body1" sx={{ minWidth: 30, textAlign: 'center' }}>
                              {cart[product._id]}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={() => addToCart(product._id)}
                              disabled={product.stock === 0}
                            >
                              <AddIcon />
                            </IconButton>
                          </>
                        ) : (
                          <Button
                            variant="contained"
                            fullWidth
                            onClick={() => addToCart(product._id)}
                            disabled={product.stock === 0}
                            startIcon={<AddIcon />}
                            size={isMobile ? "small" : "medium"}
                          >
                            Add to Cart
                          </Button>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        </TabPanel>

        {/* Orders Tab */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h5" gutterBottom>
            Order History
          </Typography>
          {ordersLoading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
              <CircularProgress />
            </Box>
          ) : orders.length === 0 ? (
            <Alert severity="info">No orders found. Start shopping to see your orders here!</Alert>
          ) : (
            <List>
              {orders.map((order) => (
                <Card key={order._id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6">
                        Order #{order._id.slice(-6)}
                      </Typography>
                      <Chip
                        label={order.status.replace('_', ' ').toUpperCase()}
                        color={getStatusColor(order.status) as any}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Date: {new Date(order.orderDate).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Total: ₹{order.totalAmount}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Payment: {order.paymentMethod}
                    </Typography>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Typography variant="subtitle2" gutterBottom>
                      Items:
                    </Typography>
                    {order.products.map((item, index) => (
                      <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Avatar src={item.product.image} sx={{ mr: 2, width: 40, height: 40 }} />
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="body2">
                            {item.product.name} x {item.quantity}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            ₹{item.price} each
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </List>
          )}
        </TabPanel>

        {/* Support Tab */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h5" gutterBottom>
            Support & Help
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Contact Information
                  </Typography>
                  <Typography variant="body2" paragraph>
                    <strong>Store Address:</strong><br />
                    Jaya Bharathi Store<br />
                    [Your Store Address]<br />
                    [City, State, PIN]
                  </Typography>
                  <Typography variant="body2" paragraph>
                    <strong>Phone:</strong> [Your Phone Number]<br />
                    <strong>Email:</strong> [Your Email]
                  </Typography>
                  <Typography variant="body2">
                    <strong>Business Hours:</strong><br />
                    Monday - Sunday: 8:00 AM - 10:00 PM
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Send us a Message
                  </Typography>
                  <Typography variant="body2" paragraph>
                    Have a question or need help? Send us a message and we'll get back to you soon.
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => setSupportDialog(true)}
                    startIcon={<SupportIcon />}
                  >
                    Send Message
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Container>

      {/* Support Dialog */}
      <Dialog open={supportDialog} onClose={() => setSupportDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Send Support Message</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Message"
            fullWidth
            multiline
            rows={4}
            value={supportMessage}
            onChange={(e) => setSupportMessage(e.target.value)}
            placeholder="Describe your issue or question..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSupportDialog(false)}>Cancel</Button>
          <Button onClick={handleSupportSubmit} variant="contained">
            Send Message
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserDashboard; 