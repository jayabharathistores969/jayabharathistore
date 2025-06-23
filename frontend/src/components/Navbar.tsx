import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Badge, useTheme, useMediaQuery, Drawer, List, ListItemText, ListItemButton, Breadcrumbs, Link } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PersonIcon from '@mui/icons-material/Person';
import HomeIcon from '@mui/icons-material/Home';
import InfoIcon from '@mui/icons-material/Info';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import StorefrontIcon from '@mui/icons-material/Storefront';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/logo.png';
import ListItem from '@mui/material/ListItem';

const navLinks = [
  { label: 'Home', icon: <HomeIcon />, path: '/' },
  { label: 'Products', icon: <StorefrontIcon />, path: '/products' },
  { label: 'About', icon: <InfoIcon />, path: '/about' },
  { label: 'Contact', icon: <ContactMailIcon />, path: '/contact' },
];

const Navbar = React.memo(() => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleBack = () => {
    navigate(-1);
  };

  const isAdminRoute = location.pathname.startsWith('/admin');

  // Don't show navbar on admin routes
  if (isAdminRoute) {
    return null;
  }

  // Helper to check if a nav link is active
  const isActive = (path: string) => {
    // For root path, match exactly
    if (path === '/') return location.pathname === '/';
    // For other paths, match if pathname starts with path
    return location.pathname.startsWith(path);
  };

  return (
    <AppBar position="sticky" elevation={3} sx={{
      background: 'linear-gradient(90deg, #2196f3 0%, #21cbf3 100%)',
      backdropFilter: 'blur(8px)',
      boxShadow: '0 4px 24px rgba(33,150,243,0.10)',
    }}>
      <Toolbar>
        <img src={logo} alt="Logo" style={{ height: '48px', marginRight: '16px', borderRadius: 12, boxShadow: '0 2px 8px rgba(33,150,243,0.10)' }} />
        <Typography
          variant="h5"
          component={RouterLink}
          to="/"
          sx={{ flexGrow: 1, textDecoration: 'none', color: 'white', fontWeight: 700, fontFamily: 'Poppins, Roboto, Helvetica, Arial, sans-serif' }}
        >
          JayaBharathi Store
        </Typography>
        {isMobile ? (
          <>
            <IconButton color="inherit" onClick={() => setDrawerOpen(true)}>
              <MenuIcon />
            </IconButton>
            <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
              <Box sx={{ width: 250 }} role="presentation" onClick={() => setDrawerOpen(false)}>
                <List>
                  {navLinks.map((link) => (
                    <ListItemButton
                      component={RouterLink}
                      to={link.path}
                      key={link.label}
                      selected={isActive(link.path)}
                      sx={isActive(link.path) ? { background: 'rgba(33,150,243,0.10)', color: '#1976d2', fontWeight: 700 } : {}}
                    >
                      {link.icon}
                      <ListItemText primary={link.label} sx={{ ml: 2 }} />
                    </ListItemButton>
                  ))}
                  <ListItemButton component={RouterLink} to="/cart" selected={isActive('/cart')} sx={isActive('/cart') ? { background: 'rgba(33,150,243,0.10)', color: '#1976d2', fontWeight: 700 } : {}}>
                    <ShoppingCartIcon />
                    <ListItemText primary="Cart" sx={{ ml: 2 }} />
                  </ListItemButton>
                  {isAuthenticated ? (
                    <>
                      <ListItemButton component={RouterLink} to="/profile" selected={isActive('/profile')} sx={isActive('/profile') ? { background: 'rgba(33,150,243,0.10)', color: '#1976d2', fontWeight: 700 } : {}}>
                        <PersonIcon />
                        <ListItemText primary="Profile" sx={{ ml: 2 }} />
                      </ListItemButton>
                      <ListItemButton onClick={handleLogout}>
                        <ListItemText primary="Logout" sx={{ ml: 2 }} />
                      </ListItemButton>
                    </>
                  ) : (
                    <>
                      <ListItemButton component={RouterLink} to="/login" selected={isActive('/login')} sx={isActive('/login') ? { background: 'rgba(33,150,243,0.10)', color: '#1976d2', fontWeight: 700 } : {}}>
                        <ListItemText primary="Login" sx={{ ml: 2 }} />
                      </ListItemButton>
                      <ListItemButton component={RouterLink} to="/register" selected={isActive('/register')} sx={isActive('/register') ? { background: 'rgba(33,150,243,0.10)', color: '#1976d2', fontWeight: 700 } : {}}>
                        <ListItemText primary="Register" sx={{ ml: 2 }} />
                      </ListItemButton>
                    </>
                  )}
                </List>
              </Box>
            </Drawer>
          </>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {navLinks.map((link) => (
              <Button
                key={link.label}
                color="inherit"
                component={RouterLink}
                to={link.path}
                startIcon={link.icon}
                sx={{
                  fontWeight: 600,
                  borderRadius: 8,
                  px: 2,
                  fontFamily: 'Poppins, Roboto, Helvetica, Arial, sans-serif',
                  ...(isActive(link.path) && {
                    background: 'rgba(255,255,255,0.18)',
                    color: '#fff',
                    boxShadow: '0 2px 8px rgba(33,150,243,0.10)',
                  })
                }}
              >
                {link.label}
              </Button>
            ))}
            <IconButton color="inherit" component={RouterLink} to="/cart" sx={{ borderRadius: 12, background: isActive('/cart') ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.10)', '&:hover': { background: 'rgba(255,255,255,0.18)' } }}>
              <Badge badgeContent={0} color="secondary">
                <ShoppingCartIcon />
              </Badge>
            </IconButton>
            {isAuthenticated ? (
              <>
                <IconButton color="inherit" component={RouterLink} to="/profile" sx={{ borderRadius: 12, background: isActive('/profile') ? 'rgba(255,255,255,0.18)' : 'none' }}>
                  <PersonIcon />
                </IconButton>
                <Button color="inherit" onClick={handleLogout} sx={{ fontWeight: 600, borderRadius: 8, px: 2, fontFamily: 'Poppins, Roboto, Helvetica, Arial, sans-serif' }}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button color="inherit" component={RouterLink} to="/login" sx={{ fontWeight: 600, borderRadius: 8, px: 2, fontFamily: 'Poppins, Roboto, Helvetica, Arial, sans-serif', ...(isActive('/login') && { background: 'rgba(255,255,255,0.18)', color: '#fff' }) }}>
                  Login
                </Button>
                <Button color="inherit" component={RouterLink} to="/register" sx={{ fontWeight: 600, borderRadius: 8, px: 2, fontFamily: 'Poppins, Roboto, Helvetica, Arial, sans-serif', ...(isActive('/register') && { background: 'rgba(255,255,255,0.18)', color: '#fff' }) }}>
                  Register
                </Button>
              </>
            )}
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
});

export default Navbar; 