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
  Add as AddIcon,
  Remove as RemoveIcon,
  Refresh as RefreshIcon,
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

const User: React.FC = () => {
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
  const [supportDialog, setSupportDialog] = useState(false);
  const [supportMessage, setSupportMessage] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const categories = ['all', 'groceries', 'personal care', 'snacks', 'beverages', 'household'];

  useEffect(() => {
    fetchProducts();
    fetchOrders();
    fetchCart();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, selectedCategory]);

  const refreshData = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchProducts(),
        fetchOrders(),
        fetchCart()
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders/my-orders');
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchCart = async () => {
    try {
      const response = await api.get('/cart');
      const cartItems = response.data.items || [];
      const cartMap: { [key: string]: number } = {};
      cartItems.forEach((item: any) => {
        cartMap[item.product._id] = item.quantity;
      });
      setCart(cartMap);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;
    
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product =>
        product.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }
    
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
      await api.post('/cart/remove', {
        productId,
        quantity: 1
      });
      setCart(prev => {
        const newCart = { ...prev };
        if (newCart[productId] > 1) {
          newCart[productId] -= 1;
        } else {
          delete newCart[productId];
        }
        return newCart;
      });
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
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: { xs: 2, sm: 4 }, mb: 4 }}>
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

        {/* Refresh Button */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={refreshData}
            disabled={refreshing}
            size={isMobile ? "small" : "medium"}
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="dashboard tabs"
            variant={isMobile ? "fullWidth" : "standard"}
            scrollButtons={isMobile ? "auto" : false}
          >
            <Tab icon={<HomeIcon />} label="Products" />
            <Tab icon={<HistoryIcon />} label="Orders" />
            <Tab icon={<SupportIcon />} label="Support" />
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
            {filteredProducts.length === 0 ? (
              <Grid item xs={12}>
                <Alert severity="info">
                  No products found matching your criteria. Try adjusting your search or filters.
                </Alert>
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              Order History
            </Typography>
          </Box>
          {orders.length === 0 ? (
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

export default User; 