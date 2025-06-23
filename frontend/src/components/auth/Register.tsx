import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  IconButton,
  InputAdornment,
  Snackbar,
  Alert,
  Stepper,
  Step,
  StepLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Card,
  CardContent,
  CircularProgress,
  useMediaQuery
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Email,
  Person,
  Phone,
  Lock,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import CancelIcon from '@mui/icons-material/Cancel';
import { config } from '../../config';

const StyledLink = styled(RouterLink)(({ theme }) => ({
  textDecoration: 'none',
  color: theme.palette.primary.main,
  fontSize: '0.95rem',
  fontWeight: 500,
  '&:hover': {
    textDecoration: 'underline',
  },
}));

const passwordRules = [
  { label: 'At least 8 characters', test: (pw: string) => pw.length >= 8 },
  { label: 'At least one uppercase letter', test: (pw: string) => /[A-Z]/.test(pw) },
  { label: 'At least one lowercase letter', test: (pw: string) => /[a-z]/.test(pw) },
  { label: 'At least one number', test: (pw: string) => /\d/.test(pw) },
  { label: 'At least one symbol', test: (pw: string) => /[!@#$%^&*(),.?":{}|<>]/.test(pw) },
  { label: 'No spaces', test: (pw: string) => !/\s/.test(pw) },
];

const Register = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [step, setStep] = useState(0); // 0: Register, 1: OTP, 2: Success
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const { name, email, phone, password, confirmPassword } = formData;

    if (!name || !email || !password || !phone || !confirmPassword) {
      setMessage('All fields are required');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post(`${config.API_URL}/auth/register/send-otp`, {
        name,
        email,
        phone,
        password,
      });
      setMessage(res.data.message);
      setStep(1);
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await axios.post(`${config.API_URL}/auth/register/verify-otp`, {
        email: formData.email,
        otp,
      });
      setMessage(res.data.message);
      setStep(2);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', py: { xs: 2, sm: 6 } }}>
      <Container maxWidth="sm">
        <Card elevation={8} sx={{ borderRadius: 5, p: { xs: 2, sm: 4 }, mt: { xs: 2, sm: 4 } }}>
          <CardContent>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography variant={isMobile ? 'h5' : 'h4'} fontWeight={700} gutterBottom>
                Create Your Account
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Sign up to get started with JayaBharathi Store
              </Typography>
            </Box>
            <Stepper activeStep={step} alternativeLabel={!isMobile} sx={{ mb: 4 }}>
              <Step><StepLabel>Register</StepLabel></Step>
              <Step><StepLabel>Verify OTP</StepLabel></Step>
              <Step><StepLabel>Success</StepLabel></Step>
            </Stepper>

            {step === 0 && (
              <form onSubmit={handleRegister} autoComplete="off">
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="name"
                  label="Full Name"
                  name="name"
                  autoComplete="name"
                  autoFocus
                  value={formData.name}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="phone"
                  label="Phone Number"
                  name="phone"
                  autoComplete="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Phone color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock color="primary" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <List dense sx={{ mb: 2 }}>
                  {passwordRules.map((rule, idx) => {
                    const passed = rule.test(formData.password);
                    return (
                      <ListItem key={idx} sx={{ py: 0 }}>
                        <ListItemIcon>
                          {passed ? (
                            <CheckCircleIcon color="success" fontSize="small" />
                          ) : (
                            <CancelIcon color="error" fontSize="small" />
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary={rule.label}
                          sx={{ color: passed ? 'success.main' : 'error.main', fontSize: 14 }}
                        />
                      </ListItem>
                    );
                  })}
                </List>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="confirmPassword"
                  label="Confirm Password"
                  type={showPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />
                {message && (
                  <Alert severity="error" sx={{ mt: 2 }}>{message}</Alert>
                )}
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  sx={{ mt: 3, mb: 2, py: 1.5, fontWeight: 700, borderRadius: 3, fontSize: 18 }}
                  disabled={loading}
                  endIcon={loading ? <CircularProgress size={22} color="inherit" /> : null}
                >
                  Register & Send OTP
                </Button>
                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Already have an account?{' '}
                    <StyledLink to="/login">Login</StyledLink>
                  </Typography>
                </Box>
              </form>
            )}

            {step === 1 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h5" fontWeight={700} gutterBottom>
                  Enter the OTP sent to your email
                </Typography>
                <form onSubmit={handleVerifyOtp} autoComplete="off" style={{ maxWidth: 320, margin: '0 auto' }}>
                  <TextField
                    label="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    fullWidth
                    sx={{ mb: 3 }}
                  />
                  {message && (
                    <Alert severity="error" sx={{ mb: 2 }}>{message}</Alert>
                  )}
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    sx={{ py: 1.5, fontWeight: 700, borderRadius: 3, fontSize: 18 }}
                    disabled={loading}
                    endIcon={loading ? <CircularProgress size={22} color="inherit" /> : null}
                  >
                    Verify OTP
                  </Button>
                </form>
              </Box>
            )}

            {step === 2 && (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <CheckCircleIcon color="success" sx={{ fontSize: 64, mb: 2 }} />
                <Typography variant="h4" fontWeight={700} color="success.main" gutterBottom>
                  Registration Successful!
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  {message || 'You can now log in to your account.'}
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  sx={{ mt: 2, fontWeight: 700, borderRadius: 3, fontSize: 18 }}
                  onClick={() => navigate('/login')}
                >
                  Go to Login
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
        <Snackbar
          open={openSnackbar}
          autoHideDuration={6000}
          onClose={() => setOpenSnackbar(false)}
        >
          <Alert
            onClose={() => setOpenSnackbar(false)}
            severity={error?.includes('successful') ? 'success' : 'error'}
            sx={{ width: '100%' }}
          >
            {error}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default Register;
