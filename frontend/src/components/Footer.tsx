import React from 'react';
import { Box, Typography, Link, Container, Stack } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import PhoneIcon from '@mui/icons-material/Phone';

const Footer = React.memo(() => {
  return (
    <Box component="footer" sx={{
      bgcolor: 'transparent',
      background: 'linear-gradient(90deg, #2196f3 0%, #21cbf3 100%)',
      color: 'white',
      py: 4,
      mt: 8,
      borderRadius: '24px 24px 0 0',
      boxShadow: '0 -2px 16px rgba(33,150,243,0.10)',
    }}>
      <Container maxWidth="lg">
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" spacing={2}>
          <Typography variant="body1" sx={{ fontWeight: 600, fontFamily: 'Poppins, Roboto, Helvetica, Arial, sans-serif' }}>
            &copy; {new Date().getFullYear()} JayaBharathi Store. All rights reserved.
          </Typography>
          <Stack direction="row" alignItems="center" spacing={2}>
            <PhoneIcon fontSize="small" sx={{ transition: 'color 0.2s', '&:hover': { color: '#ffc947' } }} />
            <Typography variant="body1">
              <Link href="tel:9894490969" color="inherit" underline="hover" sx={{ fontWeight: 600, fontFamily: 'Poppins, Roboto, Helvetica, Arial, sans-serif', '&:hover': { color: '#ffc947' } }}>
                98944 90969
              </Link>
            </Typography>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
});

export default Footer; 