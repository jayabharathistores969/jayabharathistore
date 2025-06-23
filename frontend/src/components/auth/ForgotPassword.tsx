import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Snackbar,
  Alert,
  IconButton,
  InputAdornment,
  Step,
  Stepper,
  StepLabel,
  CircularProgress,
  List,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ListItem from '@mui/material/ListItem';
import { Link } from 'react-router-dom';
import { Visibility, VisibilityOff, Email, Lock, Key } from '@mui/icons-material';
import axios from 'axios';
import { config } from '../../config';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

const passwordRules = [
  { label: 'At least 8 characters', test: (pw: string) => pw.length >= 8 },
  { label: 'At least one uppercase letter', test: (pw: string) => /[A-Z]/.test(pw) },
  { label: 'At least one lowercase letter', test: (pw: string) => /[a-z]/.test(pw) },
  { label: 'At least one number', test: (pw: string) => /\d/.test(pw) },
  { label: 'At least one symbol', test: (pw: string) => /[!@#$%^&*(),.?":{}|<>]/.test(pw) },
  { label: 'No spaces', test: (pw: string) => !/\s/.test(pw) },
];

const ForgotPassword = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | ''; text: string }>({ type: '', text: '' });
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [loading, setLoading] = useState(false);

  const steps = ['Enter Email', 'Enter OTP', 'Reset Password'];

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${config.API_URL}/auth/send-otp`, { email });
      setMessage({
        type: 'success',
        text: response.data.message || 'OTP has been sent to your email'
      });
      setActiveStep(1);
    } catch (err: any) {
      setMessage({
        type: 'error',
        text:
          (err.response?.data?.errors && err.response.data.errors.join(', ')) ||
          err.response?.data?.message ||
          err.message ||
          'Failed to send OTP. Please try again.',
      });
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setMessage({
        type: 'error',
        text: 'Passwords do not match'
      });
      setOpenSnackbar(true);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${config.API_URL}/auth/verify-otp`, {
        email,
        otp,
        newPassword
      }, {
        timeout: config.API_TIMEOUT,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      setMessage({
        type: 'success',
        text: response.data.message || 'Password successfully reset'
      });
      setOpenSnackbar(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 
              err.code === 'ECONNABORTED' ? 'Request timed out. Please try again.' :
              err.code === 'ERR_NETWORK' ? 'Cannot connect to server. Please try again later.' :
              'Failed to reset password'
      });
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5" 
          sx={{
            background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
            backgroundClip: 'text',
            color: 'transparent',
            mb: 3
          }}
        >
          Reset Password
        </Typography>

        <Stepper activeStep={activeStep} alternativeLabel sx={{ width: '100%', mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {activeStep === 0 && (
          <Box component="form" onSubmit={handleSendOTP} sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 3,
                mb: 2,
                background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #FE5B7B 30%, #FF7E43 90%)',
                }
              }}
              disabled={loading}
              startIcon={loading && <CircularProgress size={20} color="inherit" />}
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </Button>
          </Box>
        )}

        {activeStep === 1 && (
          <Box component="form" onSubmit={handleVerifyOTP} sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="otp"
              label="Enter OTP"
              name="otp"
              autoFocus
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Key />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="newPassword"
              label="New Password"
              type={showPassword ? 'text' : 'password'}
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <List dense>
              {passwordRules.map((rule, idx) => {
                const passed = rule.test(newPassword);
                return (
                  <ListItem key={idx}>
                    <ListItemIcon>
                      {passed ? (
                        <CheckCircleIcon color="success" fontSize="small" />
                      ) : (
                        <CancelIcon color="error" fontSize="small" />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={rule.label}
                      style={{ color: passed ? 'green' : 'red' }}
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
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 3,
                mb: 2,
                background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #FE5B7B 30%, #FF7E43 90%)',
                }
              }}
              disabled={loading}
              startIcon={loading && <CircularProgress size={20} color="inherit" />}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </Box>
        )}
        
        <Snackbar 
          open={openSnackbar} 
          autoHideDuration={6000} 
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={message.type || 'info'} 
            sx={{ width: '100%' }}
          >
            {message.text}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
};

export default ForgotPassword; 