import React, { useState } from 'react';
import {
  Container, Typography, Stepper, Step, StepLabel, Box, Button, TextField, Card, CardContent, Divider, Grid, CircularProgress, Alert, useTheme, useMediaQuery, FormControl, RadioGroup, FormControlLabel, Radio
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { config } from '../config';
import api from '../api';
import axios from 'axios';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const steps = ['Shipping Address', 'Payment Details', 'Review Order'];

const Checkout: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
    mobileNumber: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('Card');
  const [pincodeError, setPincodeError] = useState('');
  const [mobileNumberError, setMobileNumberError] = useState('');
  const [isFetchingPincode, setIsFetchingPincode] = useState(false);

  const { data: cart, isLoading: isCartLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const response = await api.get('/cart');
      return response.data;
    },
    enabled: !!user,
  });

  const { data: userDetails } = useQuery({
    queryKey: ['userDetails', user?._id],
    queryFn: async () => {
      const response = await api.get('/users/profile');
      return response.data;
    },
    enabled: !!user,
  });

  React.useEffect(() => {
    if (userDetails && userDetails.addresses && userDetails.addresses.length > 0) {
      const defaultAddress = userDetails.addresses.find((addr: any) => addr.isDefault) || userDetails.addresses[0];
      setShippingAddress(defaultAddress);
    }
  }, [userDetails]);

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const response = await api.post('/orders', orderData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      setActiveStep((prev) => prev + 1);
    },
  });

  const paymentVerificationMutation = useMutation({
    mutationFn: async (data: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string; }) => {
      const payload = { ...data, shippingAddress };
      const response = await api.post('/payment/verify', payload);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      navigate(`/order-success/${data.orderId}`);
    },
    onError: (error) => {
      console.error("Payment verification failed", error);
      alert('Payment failed. Please try again.');
    }
  });

  const handleNext = () => {
    let isValid = true;
    if (activeStep === 0) {
      // Pincode validation
      if (shippingAddress.postalCode.trim() !== '601101') {
        setPincodeError('Sorry, we only deliver to pincode 601101 at the moment.');
        isValid = false;
      } else {
        setPincodeError('');
      }

      // Mobile number validation
      if (!/^\d{10}$/.test(shippingAddress.mobileNumber)) {
        setMobileNumberError('Please enter a valid 10-digit mobile number.');
        isValid = false;
      } else {
        setMobileNumberError('');
      }

      if (!isValid) {
        return; // Stop if validation fails
      }
    }

    if (activeStep === steps.length - 1) {
      if (paymentMethod === 'Card' || paymentMethod === 'UPI') {
        // Handle Razorpay payment
        displayRazorpay();
      } else {
        // Handle Cash on Delivery
        const orderData = {
          items: cart.items,
          shippingAddress,
          paymentMethod,
        };
        createOrderMutation.mutate(orderData);
      }
    } else {
      setPincodeError('');
      setMobileNumberError('');
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShippingAddress({
      ...shippingAddress,
      [e.target.name]: e.target.value,
    });
    if (e.target.name === 'postalCode') {
      setPincodeError('');
    }
    if (e.target.name === 'mobileNumber') {
      setMobileNumberError('');
    }
  };

  const handlePincodeBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const pincode = e.target.value;
    if (pincode.length === 6 && /^\d{6}$/.test(pincode)) {
      setIsFetchingPincode(true);
      setPincodeError('');
      try {
        const response = await axios.get(`https://api.postalpincode.in/pincode/${pincode}`);
        if (response.data && response.data[0] && response.data[0].PostOffice.length > 0) {
          const postOffice = response.data[0].PostOffice[0];
          setShippingAddress(prev => ({
            ...prev,
            city: postOffice.District,
            country: postOffice.State,
          }));
        } else {
          setPincodeError('Invalid pincode or no data found.');
        }
      } catch (error) {
        setPincodeError('Failed to fetch pincode details.');
        console.error('Pincode API error:', error);
      } finally {
        setIsFetchingPincode(false);
      }
    }
  };

  const displayRazorpay = async () => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    script.onload = async () => {
      try {
        const orderAmount = total;

        // 1. Create Order on Backend
        const { data: order } = await api.post('/payment/create-order', {
          amount: orderAmount,
        });

        // 2. Open Razorpay Checkout
        const options = {
          key: process.env.REACT_APP_RAZORPAY_KEY_ID,
          amount: order.amount,
          currency: "INR",
          name: "JayaBharathi Store",
          description: "Order Payment",
          image: "/logo192.png",
          order_id: order.id,
          handler: function (response: any) {
            paymentVerificationMutation.mutate({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
          },
          prefill: {
            name: user?.name,
            email: user?.email,
            contact: shippingAddress.mobileNumber,
          },
          notes: {
            address: `${shippingAddress.address}, ${shippingAddress.city} - ${shippingAddress.postalCode}`,
          },
          theme: {
            color: "#2196f3",
          },
        };
        
        const rzp = new window.Razorpay(options);
        rzp.open();
      } catch (error) {
        console.error("Razorpay error:", error);
        alert("Error initiating payment. Please try again.");
      }
    };
  };

  if (isCartLoading) {
    return <CircularProgress />;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Alert severity="info">Your cart is empty. Add items to proceed to checkout.</Alert>
        <Button onClick={() => navigate('/user/products')} sx={{ mt: 2 }}>Go to Products</Button>
      </Container>
    );
  }

  const subtotal = cart.items.reduce((sum: number, item: any) => sum + item.product.price * item.quantity, 0);
  const shipping = 0;
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  return (
    <Container maxWidth="md" sx={{ py: { xs: 2, sm: 4 } }}>
      <Typography variant={isMobile ? 'h5' : 'h4'} gutterBottom>Checkout</Typography>
      <Stepper activeStep={activeStep} sx={{ mb: 4 }} alternativeLabel={!isMobile}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{isMobile ? label.split(' ')[0] : label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          {activeStep === 0 && (
            <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {userDetails?.addresses && userDetails.addresses.length > 0 && (
                <Box mb={2}>
                  <Typography variant="h6" gutterBottom>Select a shipping address</Typography>
                  <FormControl component="fieldset">
                    <RadioGroup
                      name="selectedAddress"
                      value={shippingAddress.address}
                      onChange={(e) => {
                        const selected = userDetails.addresses.find((a: any) => a.address === e.target.value);
                        if (selected) {
                          setShippingAddress(selected);
                        }
                      }}
                    >
                      {userDetails.addresses.map((addr: any) => (
                        <FormControlLabel
                          key={addr._id}
                          value={addr.address}
                          control={<Radio />}
                          label={`${addr.fullName}, ${addr.address}, ${addr.city}`}
                        />
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <Divider sx={{ my: 2 }} />
                </Box>
              )}
              <TextField label="Full Name" name="fullName" value={shippingAddress.fullName} onChange={handleAddressChange} fullWidth required />
              <TextField 
                label="Mobile Number"
                name="mobileNumber"
                value={shippingAddress.mobileNumber}
                onChange={handleAddressChange}
                fullWidth
                required
                error={!!mobileNumberError}
                helperText={mobileNumberError}
                inputProps={{ maxLength: 10, type: 'tel' }}
              />
              <TextField label="Address" name="address" value={shippingAddress.address} onChange={handleAddressChange} fullWidth required />
              <TextField
                label="Postal Code"
                name="postalCode"
                value={shippingAddress.postalCode}
                onChange={handleAddressChange}
                onBlur={handlePincodeBlur}
                fullWidth
                required
                error={!!pincodeError}
                helperText={pincodeError || "Only pincode 601101 is deliverable."}
                InputProps={{
                  endAdornment: isFetchingPincode ? <CircularProgress size={20} /> : null,
                }}
              />
              <TextField 
                label="City" 
                name="city" 
                value={shippingAddress.city} 
                onChange={handleAddressChange} 
                fullWidth 
                required 
                InputLabelProps={{ shrink: !!shippingAddress.city }}
              />
              <TextField 
                label="State" 
                name="country"
                value={shippingAddress.country} 
                onChange={handleAddressChange} 
                fullWidth 
                required 
                InputLabelProps={{ shrink: !!shippingAddress.country }}
              />
            </Box>
          )}
          {activeStep === 1 && (
            <Box>
              <FormControl component="fieldset">
                <Typography variant="h6" sx={{ mb: 2 }}>Select Payment Method</Typography>
                <RadioGroup
                  aria-label="payment method"
                  name="paymentMethod"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <FormControlLabel value="Card" control={<Radio />} label="Credit/Debit Card" />
                  <FormControlLabel value="UPI" control={<Radio />} label="UPI" />
                  <FormControlLabel value="COD" control={<Radio />} label="Cash on Delivery" />
                </RadioGroup>
              </FormControl>

              {paymentMethod === 'Card' && (
                <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 3 }}>
                  <TextField label="Card Number" fullWidth required />
                  <TextField label="Expiry Date" fullWidth required />
                  <TextField label="CVV" fullWidth required />
                  <TextField label="Name on Card" fullWidth required />
                </Box>
              )}
              {paymentMethod === 'UPI' && (
                <Alert severity="info" sx={{ mt: 3 }}>
                  You will be redirected to your UPI app to complete the payment.
                </Alert>
              )}
              {paymentMethod === 'COD' && (
                <Alert severity="info" sx={{ mt: 3 }}>
                  You can pay in cash at the time of delivery.
                </Alert>
              )}
            </Box>
          )}
          {activeStep === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>Review your order</Typography>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6">Shipping Address</Typography>
                  <Typography>{shippingAddress.fullName}</Typography>
                  <Typography>{shippingAddress.address}</Typography>
                  <Typography>{shippingAddress.city}, {shippingAddress.postalCode}</Typography>
                  <Typography>{shippingAddress.country}</Typography>
                  <Typography sx={{ mt: 1, fontWeight: 'bold' }}>{shippingAddress.mobileNumber}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6">Order Summary</Typography>
                  {cart.items.map((item: any) => (
                    <Box key={item.product._id} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography>{item.product.name} x {item.quantity}</Typography>
                      <Typography>₹{(item.product.price * item.quantity).toFixed(2)}</Typography>
                    </Box>
                  ))}
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>Subtotal</Typography>
                    <Typography>₹{subtotal.toFixed(2)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>Tax</Typography>
                    <Typography>₹{tax.toFixed(2)}</Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h6">Total</Typography>
                    <Typography variant="h6">₹{total.toFixed(2)}</Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                    <Typography variant="h6">Payment Method</Typography>
                    <Typography variant="h6">{paymentMethod}</Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
          {activeStep === steps.length ? (
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h5" gutterBottom>Thank you for your order!</Typography>
              <Typography>Your order number is #{createOrderMutation.data?._id}. We have emailed your order confirmation, and will send you an update when your order has shipped.</Typography>
              <Button onClick={() => navigate('/user/products')} sx={{ mt: 2 }}>Continue Shopping</Button>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
              <Button disabled={activeStep === 0} onClick={handleBack} fullWidth={isMobile}>Back</Button>
              <Button variant="contained" onClick={handleNext} disabled={createOrderMutation.isPending} fullWidth={isMobile}>
                {createOrderMutation.isPending ? <CircularProgress size={24} /> : activeStep === steps.length - 1 ? 'Place Order' : 'Next'}
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default Checkout;