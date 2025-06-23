import React from 'react';
import { Container, Typography, Box, Card, CardContent, Avatar } from '@mui/material';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';
import FavoriteIcon from '@mui/icons-material/Favorite';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import { Grid } from '@mui/material';

const About: React.FC = () => {
  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', fontFamily: 'Poppins, Roboto, Helvetica, Arial, sans-serif' }}>
      {/* Hero Section */}
      <Box
        sx={{
          width: '100%',
          py: { xs: 6, md: 10 },
          px: 2,
          background: 'linear-gradient(90deg, #2196f3 0%, #21cbf3 100%)',
          borderRadius: { xs: 0, md: '0 0 48px 48px' },
          boxShadow: '0 8px 32px rgba(33,150,243,0.10)',
          mb: 8,
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h3" fontWeight={700} color="white" gutterBottom sx={{ letterSpacing: 1 }}>
            About JayaBharathi Store
          </Typography>
          <Typography variant="h6" color="rgba(255,255,255,0.92)" paragraph>
            JayaBharathi Store is committed to providing the best online shopping experience. Our mission is to deliver quality products, unbeatable prices, and exceptional customer service to every customer.
          </Typography>
        </Container>
      </Box>
      {/* Info Cards Section */}
      <Container maxWidth="md" sx={{ mb: 10 }}>
        <Grid container spacing={5} sx={{ mt: 2 }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', borderRadius: 4, boxShadow: '0 4px 24px rgba(33,150,243,0.08)', textAlign: 'center', p: 3, transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-8px)', boxShadow: '0 8px 32px rgba(33,150,243,0.16)' } }}>
              <CardContent>
                <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56, mb: 2, mx: 'auto' }}>
                  <EmojiObjectsIcon sx={{ fontSize: 32 }} />
                </Avatar>
                <Typography variant="h6" fontWeight={700} gutterBottom>Our Mission</Typography>
                <Typography color="text.secondary">
                  To make shopping easy, affordable, and enjoyable for everyone.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', borderRadius: 4, boxShadow: '0 4px 24px rgba(33,150,243,0.08)', textAlign: 'center', p: 3, transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-8px)', boxShadow: '0 8px 32px rgba(33,150,243,0.16)' } }}>
              <CardContent>
                <Avatar sx={{ bgcolor: 'secondary.main', width: 56, height: 56, mb: 2, mx: 'auto' }}>
                  <FavoriteIcon sx={{ fontSize: 32 }} />
                </Avatar>
                <Typography variant="h6" fontWeight={700} gutterBottom>Our Values</Typography>
                <Typography color="text.secondary">
                  Integrity, customer focus, and innovation drive everything we do.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', borderRadius: 4, boxShadow: '0 4px 24px rgba(33,150,243,0.08)', textAlign: 'center', p: 3, transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-8px)', boxShadow: '0 8px 32px rgba(33,150,243,0.16)' } }}>
              <CardContent>
                <Avatar sx={{ bgcolor: 'success.main', width: 56, height: 56, mb: 2, mx: 'auto' }}>
                  <LocalShippingIcon sx={{ fontSize: 32 }} />
                </Avatar>
                <Typography variant="h6" fontWeight={700} gutterBottom>Why Choose Us?</Typography>
                <Typography color="text.secondary">
                  Fast delivery, secure payments, and a wide range of products set us apart.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
      <Box sx={{ mt: 8, textAlign: 'center' }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>Contact Us</Typography>
        <Typography variant="body1" sx={{ fontWeight: 600, fontSize: 18, mb: 1 }}>
          Email: <a href="mailto:contact@jayabharathistore.xyz" style={{ color: '#2196f3', textDecoration: 'none' }}>contact@jayabharathistore.xyz</a>
        </Typography>
        <Typography variant="body1" sx={{ fontWeight: 600, fontSize: 18 }}>
          Phone: <a href="tel:9894490969" style={{ color: '#43a047', textDecoration: 'none' }}>9894490969</a>
        </Typography>
      </Box>
    </Box>
  );
};

export default About; 