import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  IconButton, 
  useTheme, 
  useMediaQuery, 
  Drawer, 
  List, 
  ListItemText, 
  ListItemButton,
  Avatar,
  Menu,
  MenuItem,
  Divider
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Inventory as InventoryIcon,
  ShoppingCart as OrdersIcon,
  AdminPanelSettings as AdminIcon,
  Menu as MenuIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  ArrowBack as BackIcon
} from '@mui/icons-material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import logo from '../../assets/logo.png';

const adminNavLinks = [
  { label: 'Dashboard', icon: <DashboardIcon />, path: '/admin/dashboard' },
  { label: 'Users', icon: <PeopleIcon />, path: '/admin/users' },
  { label: 'Products', icon: <InventoryIcon />, path: '/admin/products' },
  { label: 'Orders', icon: <OrdersIcon />, path: '/admin/orders' },
];

const AdminNavbar: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const isActiveLink = (path: string) => location.pathname === path;

  return (
    <AppBar position="sticky" elevation={3} sx={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      backdropFilter: 'blur(8px)',
      boxShadow: '0 4px 24px rgba(102,126,234,0.15)',
    }}>
      <Toolbar>
        <img src={logo} alt="Logo" style={{ height: '48px', marginRight: '16px', borderRadius: 12, boxShadow: '0 2px 8px rgba(102,126,234,0.15)' }} />
        
        {/* Back to Main Site Button */}
        <IconButton
          color="inherit"
          onClick={() => navigate('/')}
          sx={{ 
            mr: 2,
            borderRadius: 2,
            background: 'rgba(255,255,255,0.1)',
            '&:hover': { 
              background: 'rgba(255,255,255,0.2)',
              transform: 'translateX(-2px)'
            },
            transition: 'all 0.2s ease'
          }}
          title="Back to Main Site"
        >
          <BackIcon />
        </IconButton>
        
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <AdminIcon sx={{ mr: 1, color: 'rgba(255,255,255,0.9)' }} />
          <Typography
            variant="h5"
            sx={{ 
              color: 'white', 
              fontWeight: 700, 
              fontFamily: 'Poppins, Roboto, Helvetica, Arial, sans-serif',
              textShadow: '0 1px 2px rgba(0,0,0,0.1)'
            }}
          >
          Admin Panel
        </Typography>
        </Box>

        {isMobile ? (
          <>
            <IconButton color="inherit" onClick={() => setDrawerOpen(true)}>
              <MenuIcon />
            </IconButton>
            <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
              <Box sx={{ width: 280, pt: 2 }} role="presentation">
                <Box sx={{ px: 3, py: 2, borderBottom: '1px solid #e0e0e0' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                      <AdminIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {user?.name || 'Admin'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Administrator
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                <List sx={{ pt: 1 }}>
                  <ListItemButton 
                    onClick={() => { navigate('/'); setDrawerOpen(false); }}
                    sx={{
                      mx: 1,
                      borderRadius: 2,
                      mb: 0.5,
                      background: 'rgba(102,126,234,0.1)',
                      '&:hover': {
                        background: 'rgba(102,126,234,0.15)',
                      }
                    }}
                  >
                    <BackIcon />
                    <ListItemText primary="Back to Main Site" sx={{ ml: 2 }} />
                  </ListItemButton>
                  
                  {adminNavLinks.map((link) => (
                    <ListItemButton 
                      component={Link} 
                      to={link.path} 
                      key={link.label}
                      selected={isActiveLink(link.path)}
                      onClick={() => setDrawerOpen(false)}
                      sx={{
                        mx: 1,
                        borderRadius: 2,
                        mb: 0.5,
                        '&.Mui-selected': {
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          color: 'white',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                          }
                        }
                      }}
                    >
                      {link.icon}
                      <ListItemText primary={link.label} sx={{ ml: 2 }} />
                    </ListItemButton>
                  ))}
                  <Divider sx={{ my: 2 }} />
                  <ListItemButton onClick={handleLogout}>
                    <LogoutIcon />
                    <ListItemText primary="Logout" sx={{ ml: 2 }} />
                  </ListItemButton>
                </List>
              </Box>
            </Drawer>
          </>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {adminNavLinks.map((link) => (
              <Button
                key={link.label}
                color="inherit"
                component={Link}
                to={link.path}
                startIcon={link.icon}
                variant={isActiveLink(link.path) ? "contained" : "text"}
                sx={{ 
                  fontWeight: 600, 
                  borderRadius: 8, 
                  px: 2, 
                  py: 1,
                  background: isActiveLink(link.path) ? 'rgba(255,255,255,0.15)' : 'transparent',
                  '&:hover': { 
                    background: isActiveLink(link.path) ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)' 
                  }, 
                  fontFamily: 'Poppins, Roboto, Helvetica, Arial, sans-serif',
                  textTransform: 'none',
                  minWidth: 'auto'
                }}
              >
                {link.label}
              </Button>
            ))}
            
            <Divider orientation="vertical" flexItem sx={{ mx: 2, borderColor: 'rgba(255,255,255,0.2)' }} />
            
            <IconButton
              color="inherit"
              onClick={handleProfileMenuOpen}
              sx={{ 
                borderRadius: 12, 
                background: 'rgba(255,255,255,0.10)', 
                '&:hover': { background: 'rgba(255,255,255,0.18)' } 
              }}
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'rgba(255,255,255,0.2)' }}>
                <PersonIcon />
              </Avatar>
            </IconButton>
            
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleProfileMenuClose}
              PaperProps={{
                sx: {
                  mt: 1,
                  minWidth: 200,
                  borderRadius: 2,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
                }
              }}
            >
              <MenuItem onClick={handleProfileMenuClose} sx={{ py: 1.5 }}>
                <PersonIcon sx={{ mr: 2, color: 'text.secondary' }} />
                <Box>
                  <Typography variant="subtitle2" fontWeight={600}>
                    {user?.name || 'Admin'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user?.email}
                  </Typography>
                </Box>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleProfileMenuClose} sx={{ py: 1.5 }}>
                <SettingsIcon sx={{ mr: 2, color: 'text.secondary' }} />
                Settings
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout} sx={{ py: 1.5, color: 'error.main' }}>
                <LogoutIcon sx={{ mr: 2 }} />
                Logout
              </MenuItem>
            </Menu>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default AdminNavbar; 