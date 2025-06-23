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
import { useAuth } from '../../contexts/AuthContext';
import { config } from '../../config';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
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
    setFormData({
      email: '',
      password: '',
    });
  };

  const loginMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const url = isAdmin
        ? `${config.API_URL}/admin/login`
        : `${config.API_URL}/auth/login`;
      console.log('Making API call to:', url);
      console.log('Request data:', { email: data.email, password: data.password });
      
      const response = await axios.post(url, {
        email: data.email,
        password: data.password
      });
      console.log('API response:', response.data);
      return response.data;
    },
    onSuccess: async (data) => {
      await login(data.token, data.user);
      if (data.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/home');
      }
    },
    onError: (error: any) => {
      console.error('Login error:', error);
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
    console.log('Form submitted:', { formData, isAdmin });
    
    if (!formData.email || !formData.password) {
      setError('Email and password are required.');
      return;
    }
    
    console.log('Calling login mutation...');
    loginMutation.mutate(formData);
  };

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  return (
      <Container maxWidth="xs" sx={{ mt: 8, mb: 8 }}>
        <Paper elevation={12} sx={{ p: 4, borderRadius: '16px' }}>
          <Typography variant="h4" component="h1" sx={{ textAlign: 'center', fontWeight: 'bold', mb: 1, color: '#1a237e' }}>
            Welcome{' '}
            <Box component="span" sx={{ color: '#f48c06' }}>
              Back
            </Box>
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
            backgroundColor: isAdmin ? 'primary.light' : 'grey.100',
            borderRadius: 2,
            transition: 'all 0.3s ease'
          }}>
            <FormControlLabel
              control={
                <Switch 
                  checked={isAdmin} 
                  onChange={handleAdminToggle}
                  color="primary"
                />
              }
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
            <Alert severity="error" sx={{ mb: 2 }}>
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
                borderRadius: '8px',
                color: 'white',
                fontWeight: 'bold',
                background: 'linear-gradient(to right, #22c1c3, #fdbb2d)',
                '&:hover': {
                    background: 'linear-gradient(to right, #1ca3a6, #e3a729)',
                },
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
        </Paper>
      </Container>
  );
};

export default Login; 