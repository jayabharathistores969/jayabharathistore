import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Link,
  Alert,
  CircularProgress,
  Switch,
  FormControlLabel,
  InputAdornment,
  IconButton,
  Grid,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  AdminPanelSettings as AdminIcon,
  Person as UserIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { config } from '../config';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleAdminToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const isAdminChecked = event.target.checked;
    setIsAdmin(isAdminChecked);
  };

  const loginMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const url = isAdmin
        ? `${config.API_URL}/admin/login`
        : `${config.API_URL}/auth/login`;
      const response = await axios.post(url, {
        email: data.email,
        password: data.password
      });
      return response.data;
    },
    onSuccess: (data) => {
      login(data.token, data.user);
      if (data.user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/user', { replace: true });
      }
    },
    onError: (error: any) => {
      if (error.response?.status === 404) {
        setError('User not found. Please register.');
      } else if (error.response?.status === 401) {
        setError('Invalid credentials.');
      } else {
        setError(error.response?.data?.message || 'Login failed. Please try again.');
      }
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('Email and password are required.');
      return;
    }
    loginMutation.mutate(formData);
  };

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.secondary.light} 100%)`
    }}>
      <Container maxWidth="lg">
        <Paper
          elevation={16}
          sx={{
            borderRadius: 4,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' }
          }}
        >
          {!isMobile && (
            <Grid item md={6}>
              <Box sx={{
                height: '100%',
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}>
                <Box sx={{
                  textAlign: 'center',
                  color: 'white',
                  p: 4
                }}>
                  <Typography variant="h3" component="h2" sx={{ fontWeight: 'bold', mb: 2 }}>
                    Welcome to JayaBharathi Store
                  </Typography>
                  <Typography variant="h6" sx={{ opacity: 0.9 }}>
                    Your one-stop destination for quality products
                  </Typography>
                </Box>
              </Box>
            </Grid>
          )}
          <Grid item xs={12} md={6}>
            <Box sx={{ p: { xs: 3, sm: 5 } }}>
              <Typography variant="h4" component="h1" sx={{ textAlign: 'center', fontWeight: 'bold', mb: 1, color: 'primary.main' }}>
                Welcome Back
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 3 }}>
                Please enter your credentials to continue
              </Typography>
              
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2,
                p: 1,
                backgroundColor: isAdmin ? 'primary.lighter' : 'grey.100',
                borderRadius: 2,
                transition: 'all 0.3s ease'
              }}>
                <FormControlLabel
                  control={<Switch checked={isAdmin} onChange={handleAdminToggle} />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {isAdmin ? <AdminIcon /> : <UserIcon />}
                      <Typography variant="body2" fontWeight="medium">
                        {isAdmin ? 'Admin Login' : 'User Login'}
                      </Typography>
                    </Box>
                  }
                />
              </Box>

              {error && (
                <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                  {error}
                </Alert>
              )}

              <form onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  margin="normal"
                  required
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  margin="normal"
                  required
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          onMouseDown={handleMouseDownPassword}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <Box sx={{ textAlign: 'right', my: 1 }}>
                  <Link href="/forgot-password" variant="body2" underline="hover">
                    Forgot Password?
                  </Link>
                </Box>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loginMutation.isPending}
                  sx={{
                    py: 1.5,
                    mt: 2,
                    borderRadius: 2,
                    fontWeight: 'bold',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                  }}
                >
                  {loginMutation.isPending ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
                </Button>
              </form>

              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Don't have an account?{' '}
                  <Link href="/register" underline="hover">
                    Sign Up
                  </Link>
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;