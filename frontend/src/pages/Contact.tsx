import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Alert,
  Avatar,
  Stack,
  Fade,
  CircularProgress,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import PersonIcon from '@mui/icons-material/Person';
import { motion } from 'framer-motion';
import MessageIcon from '@mui/icons-material/Message';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useMutation } from '@tanstack/react-query';
import { config } from '../config';

const Contact: React.FC = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [userDetails, setUserDetails] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const apiUrl = process.env.REACT_APP_API_URL || config.API_URL;
      await axios.post(`${apiUrl}/contact`, form);
      setSubmitted(true);
      setForm({ name: '', email: '', message: '' });
    } catch (error: any) {
      setErrorMsg('Failed to send message. Please try again later.');
    }
    setLoading(false);
  };

  if (!user) {
    return (
      <Box sx={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Alert severity="info" sx={{ fontSize: 18, borderRadius: 2, fontWeight: 600 }}>
          Please log in to use the Contact Us form.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', position: 'relative' }}>
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'url(/background-wave.svg) no-repeat top center',
          zIndex: -1,
          opacity: 0.05,
        }}
      />

      <Box
        sx={{
          width: '100%',
          py: { xs: 6, md: 8 },
          px: 2,
          background: 'linear-gradient(90deg, #2196f3 0%, #21cbf3 100%)',
          borderRadius: { xs: 0, md: '0 0 48px 48px' },
          boxShadow: '0 8px 32px rgba(33,150,243,0.10)',
          mb: 8,
        }}
      >
        <Container maxWidth="sm">
          <Typography variant="h3" fontWeight={700} color="white" gutterBottom sx={{ letterSpacing: 1 }}>
            Contact Us
          </Typography>
          <Typography variant="h6" color="rgba(255,255,255,0.92)" paragraph>
            Have a question or need help? Fill out the form below and our team will get back to you soon.
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="sm" sx={{ mb: 10 }}>
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card
            sx={{
              borderRadius: 4,
              boxShadow: '0 4px 24px rgba(33,150,243,0.08)',
              p: { xs: 2, md: 3 },
              transition: 'transform 0.3s ease',
              '&:hover': { transform: 'scale(1.01)' },
            }}
          >
            <CardContent>
              <Fade in={submitted}>
                <Box>
                  {submitted && (
                    <Alert severity="success" sx={{ mb: 2, fontSize: 16, borderRadius: 2, fontWeight: 600 }}>
                      🎉 Thank you for contacting us! We'll respond shortly.
                    </Alert>
                  )}
                </Box>
              </Fade>
              {!submitted && (
                <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {errorMsg && (
                    <Alert severity="error" sx={{ fontWeight: 500 }}>
                      {errorMsg}
                    </Alert>
                  )}
                  <TextField
                    label="Name"
                    name="name"
                    value={userDetails.name}
                    onChange={(e) => setUserDetails({ ...userDetails, name: e.target.value })}
                    required
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon color="primary" />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    label="Email"
                    name="email"
                    value={userDetails.email}
                    onChange={(e) => setUserDetails({ ...userDetails, email: e.target.value })}
                    type="email"
                    required
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <MailOutlineIcon color="primary" />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    label="Message"
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    required
                    fullWidth
                    multiline
                    rows={4}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <MessageIcon color="primary" />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    sx={{
                      fontWeight: 700,
                      borderRadius: 3,
                      py: 1.5,
                      fontSize: 18,
                      background: 'linear-gradient(90deg, #2196f3 0%, #21cbf3 100%)',
                      boxShadow: '0 2px 8px rgba(33,150,243,0.10)',
                    }}
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Send Message'}
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <Dialog open={submitted} onClose={() => setSubmitted(false)}>
          <DialogTitle>✅ Message Sent!</DialogTitle>
          <DialogContent>
            Thank you! We'll get back to you shortly.
          </DialogContent>
        </Dialog>

        <Box sx={{ mt: 5, textAlign: 'center' }}>
          <Stack direction="row" spacing={3} justifyContent="center" alignItems="center">
            <Avatar sx={{ bgcolor: 'primary.main', width: 44, height: 44 }}>
              <EmailIcon />
            </Avatar>
            <Typography variant="body1" sx={{ fontWeight: 600, fontSize: 18 }}>
              <a href="mailto:contact@jayabharathistore.xyz" style={{ color: '#2196f3', textDecoration: 'none' }}>
                contact@jayabharathistore.xyz
              </a>
            </Typography>
          </Stack>
          <Stack direction="row" spacing={3} justifyContent="center" alignItems="center" sx={{ mt: 2 }}>
            <Avatar sx={{ bgcolor: 'success.main', width: 44, height: 44 }}>
              <PhoneIcon />
            </Avatar>
            <Typography variant="body1" sx={{ fontWeight: 600, fontSize: 18 }}>
              <a href="tel:9894490969" style={{ color: '#43a047', textDecoration: 'none' }}>
                9894490969
              </a>
            </Typography>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

export default Contact;
