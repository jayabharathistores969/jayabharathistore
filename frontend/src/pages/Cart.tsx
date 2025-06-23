import React from 'react';
import {
  Container, Typography, Box, Card, CardContent, Button, IconButton, Divider,
  TextField, CircularProgress, Alert
} from '@mui/material';
import { Delete as DeleteIcon, RemoveShoppingCart as RemoveShoppingCartIcon, Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Grid from '@mui/material/Grid';
import { config } from '../config';
import api from '../api';
import { AxiosError } from 'axios';

interface Product {
  _id: string;
  name: string;
  price: number;
  image: string;
  category: string;
}

interface CartItem {
  _id: string;
  product: Product;
  quantity: number;
}

interface Cart {
  items: CartItem[];
}

const Cart: React.FC = () => {
  const { user, token } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: cart, isLoading, error } = useQuery<Cart>({
    queryKey: ['cart', token],
    queryFn: async () => {
      try {
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await api.get('/cart');
        return response.data;
      } catch (error) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.status === 401) {
          navigate('/login');
          throw new Error('Please login to view your cart');
        } else if (axiosError.response?.status === 404) {
          return { items: [] }; // Return empty cart if not found
        }
        throw error;
      }
    },
    enabled: !!user,
    retry: 1,
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      if (!token) {
        throw new Error('No authentication token found');
      }
      const response = await api.put(`/cart/${itemId}`, { quantity });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (error) => {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 401) {
        navigate('/login');
      }
    }
  });

  const removeItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      if (!token) {
        throw new Error('No authentication token found');
      }
      const response = await api.delete(`/cart/${itemId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (error) => {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 401) {
        navigate('/login');
      }
    }
  });

  const handleQuantityChange = (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    updateQuantityMutation.mutate({ itemId, quantity });
  };

  const handleRemoveItem = (itemId: string) => {
    removeItemMutation.mutate(itemId);
  };

  const handleClearCart = async () => {
    if (!token) return;
    await api.delete('/cart');
    queryClient.invalidateQueries({ queryKey: ['cart'] });
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  // Map cart items to include product details if missing (backend returns only product ID)
  const validCartItems = cart?.items || [];


  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ py: 6, minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Poppins, Roboto, Helvetica, Arial, sans-serif' }}>
        <Alert severity="info" sx={{ fontSize: 18, p: 3, borderRadius: 3, boxShadow: '0 2px 8px rgba(33,150,243,0.10)' }}>
          Please <Button color="primary" onClick={() => navigate('/login')} sx={{ fontWeight: 600 }}>login</Button> to view your cart.
        </Alert>
      </Container>
    );
  }

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh" bgcolor="background.default">
        <CircularProgress size={60} thickness={4} color="primary" />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 6, minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Poppins, Roboto, Helvetica, Arial, sans-serif' }}>
        <Alert severity="error" sx={{ fontSize: 18, p: 3, borderRadius: 3, boxShadow: '0 2px 8px rgba(33,150,243,0.10)' }}>
          {error instanceof Error ? error.message : 'Error loading cart. Please try again later.'}
        </Alert>
      </Container>
    );
  }

  if (!validCartItems || validCartItems.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 6, minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Poppins, Roboto, Helvetica, Arial, sans-serif' }}>
        <RemoveShoppingCartIcon sx={{ fontSize: 100, color: 'grey.400', mb: 3 }} />
        <Typography variant="h4" fontWeight={700} gutterBottom>Your Cart is Empty</Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3, fontSize: 18 }}>
          Looks like you haven't added anything to your cart yet.
        </Typography>
        <Button variant="contained" size="large" color="primary" sx={{ px: 5, py: 1.5, fontWeight: 600, borderRadius: 3 }} onClick={() => navigate('/user/products')}>
          Shop Now
        </Button>
      </Container>
    );
  }

  const subtotal = validCartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const shipping = 0;
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', fontFamily: 'Poppins, Roboto, Helvetica, Arial, sans-serif' }}>
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Typography variant="h3" fontWeight={700} gutterBottom sx={{ mb: 4 }}>Your Cart</Typography>
        <Button variant="outlined" color="secondary" onClick={handleClearCart} sx={{ mb: 3, fontWeight: 600, borderRadius: 2, px: 3, py: 1, boxShadow: '0 2px 8px rgba(255,152,0,0.10)' }}>
          Clear Cart
        </Button>
        <Grid container spacing={5}>
          <Grid item xs={12} md={8}>
            {validCartItems.length === 0 ? (
              <Typography variant="body1">No valid products in your cart.</Typography>
            ) : (
              validCartItems.map((item) => (
                <Card key={item._id} sx={{ mb: 4, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', p: 3, borderRadius: 4, boxShadow: '0 4px 24px rgba(33,150,243,0.08)', transition: 'box-shadow 0.2s, transform 0.2s', '&:hover': { boxShadow: '0 8px 32px rgba(33,150,243,0.16)', transform: 'translateY(-4px)' } }}>
                  <Box
                    component="img"
                    src={item.product.image}
                    alt={item.product.name}
                    sx={{ width: { xs: '100%', sm: 120 }, height: 120, objectFit: 'cover', borderRadius: 3, mr: { sm: 4 }, mb: { xs: 2, sm: 0 }, boxShadow: 2 }}
                  />
                  <Box sx={{ flexGrow: 1, textAlign: { xs: 'center', sm: 'left' } }}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      {item.product.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {item.product.category}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'center', sm: 'space-between' }, gap: 2, flexWrap: 'wrap' }}>
                      <Typography variant="h6" color="primary" fontWeight={700}>
                        ₹{item.product.price}
                    </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton
                          onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          sx={{ bgcolor: 'grey.100', '&:hover': { bgcolor: 'grey.200' } }}
                        >
                        <RemoveIcon />
                      </IconButton>
                        <Typography variant="body1" sx={{ minWidth: 40, textAlign: 'center', fontWeight: 600 }}>
                          {item.quantity}
                        </Typography>
                        <IconButton
                          onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                          sx={{ bgcolor: 'grey.100', '&:hover': { bgcolor: 'grey.200' } }}
                        >
                        <AddIcon />
                        </IconButton>
                      </Box>
                      <IconButton
                        onClick={() => handleRemoveItem(item._id)}
                        color="error"
                        sx={{ bgcolor: 'error.50', '&:hover': { bgcolor: 'error.100' } }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                </Card>
              ))
            )}
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 4, borderRadius: 4, boxShadow: '0 8px 32px rgba(33,150,243,0.10)', position: { md: 'sticky' }, top: { md: 100 }, zIndex: 1 }}>
              <Typography variant="h6" gutterBottom fontWeight={700}>Order Summary</Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Subtotal:</Typography>
                  <Typography variant="body2" fontWeight={600}>₹{subtotal.toFixed(2)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Tax:</Typography>
                  <Typography variant="body2" fontWeight={600}>₹{tax.toFixed(2)}</Typography>
              </Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h6" fontWeight={700}>Total:</Typography>
                  <Typography variant="h6" fontWeight={700} color="primary">₹{total.toFixed(2)}</Typography>
              </Box>
              </Box>
              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={handleCheckout}
                sx={{
                  py: 1.5,
                  fontSize: 18,
                  fontWeight: 600,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #2196f3 0%, #21cbf3 100%)',
                  boxShadow: '0 4px 15px rgba(33,150,243,0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1976d2 0%, #1e88e5 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(33,150,243,0.4)',
                  },
                }}
              >
                Proceed to Checkout
              </Button>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Cart; 