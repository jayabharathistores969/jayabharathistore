import React, { useEffect } from 'react';
import {
  Container, Typography, Box, Button, CircularProgress, Alert, Paper, Grid, Divider
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircleOutline as CheckCircleIcon } from '@mui/icons-material';
import api from '../api';

const OrderSuccess: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  const { data: order, isLoading, error } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const { data } = await api.get(`/orders/${orderId}`);
      return data;
    },
    enabled: !!orderId,
    retry: 1,
  });

  useEffect(() => {
    // Redirect if there's no orderId
    if (!orderId) {
      navigate('/');
    }
  }, [orderId, navigate]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !order) {
    return (
      <Container maxWidth="sm" sx={{ py: 4, textAlign: 'center' }}>
        <Alert severity="error">
          Failed to load order details. Please check your order history or contact support.
        </Alert>
        <Button variant="contained" color="primary" onClick={() => navigate('/')} sx={{ mt: 2 }}>
          Go to Homepage
        </Button>
      </Container>
    );
  }

  const { shippingAddress, items, totalAmount, createdAt } = order;

  return (
    <Container maxWidth="md" sx={{ py: { xs: 3, md: 5 } }}>
      <Paper sx={{ p: { xs: 2, md: 4 }, borderRadius: 3, boxShadow: 3 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <CheckCircleIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h4" component="h1" gutterBottom>
            Thank You for Your Order!
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Your payment was successful and your order is confirmed.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Order ID: {order._id}
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Shipping Address</Typography>
            <Typography>{shippingAddress.fullName}</Typography>
            <Typography>{shippingAddress.address}</Typography>
            <Typography>{shippingAddress.city}, {shippingAddress.postalCode}</Typography>
            <Typography>{shippingAddress.country}</Typography>
            <Typography>Mobile: {shippingAddress.mobileNumber}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Order Summary</Typography>
            <Typography>Order Date: {new Date(createdAt).toLocaleDateString()}</Typography>
            <Typography fontWeight="bold" sx={{ mt: 1 }}>Total Amount: ₹{totalAmount.toFixed(2)}</Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />
        
        <Typography variant="h6" gutterBottom>Items Ordered</Typography>
        {items.map((item: any) => (
          <Box key={item.product._id} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <img src={item.product.image} alt={item.product.name} width="60" height="60" style={{ borderRadius: 8, marginRight: 16 }} />
            <Box sx={{ flexGrow: 1 }}>
              <Typography>{item.product.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                Quantity: {item.quantity}
              </Typography>
            </Box>
            <Typography>₹{(item.price * item.quantity).toFixed(2)}</Typography>
          </Box>
        ))}

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button variant="contained" color="primary" component={Link} to="/user/products">
            Continue Shopping
          </Button>
          <Button variant="outlined" color="primary" component={Link} to="/orders">
            View My Orders
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default OrderSuccess; 