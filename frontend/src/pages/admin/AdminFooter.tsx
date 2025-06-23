import React from 'react';
import { Box, Typography, Container } from '@mui/material';

const AdminFooter: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 2,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) =>
          theme.palette.mode === 'light'
            ? theme.palette.grey[200]
            : theme.palette.grey[800],
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="body2" color="text.secondary" align="center">
          © {new Date().getFullYear()} Admin Dashboard - All Rights Reserved.
        </Typography>
      </Container>
    </Box>
  );
};

export default AdminFooter; 