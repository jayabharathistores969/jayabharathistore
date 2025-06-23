import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box, Card, CardContent, Button, Avatar, Divider, Tabs, Tab, TextField, Snackbar, Alert, useTheme, IconButton, Stack, Chip, Grid, useMediaQuery, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress
} from '@mui/material';
import {
  Person as PersonIcon, ShoppingBag as OrderIcon, Favorite as FavoriteIcon,
  LocationOn as AddressIcon, Logout as LogoutIcon, Edit as EditIcon, PhotoCamera as PhotoCameraIcon, Image as ImageIcon, Close as CloseIcon, Add as AddIcon, Delete as DeleteIcon, Cancel as CancelIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';
import AddressForm from '../components/AddressForm';

function TabPanel(props: { children?: React.ReactNode; index: number; value: number }) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

interface Address {
  _id?: string;
  fullName: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  mobileNumber: string;
}

const Profile: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user, logout, token, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [tabValue, setTabValue] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [userDetails, setUserDetails] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [editPicOpen, setEditPicOpen] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user details
  const { data: userDetailsData, isLoading: userLoading, refetch: refetchUserDetails } = useQuery({
    queryKey: ['userDetails', user?._id],
    queryFn: async () => {
      const response = await api.get('/users/profile');
      return response.data;
    },
    enabled: !!token && !authLoading, // Only fetch when authenticated
  });

  React.useEffect(() => {
    if (userDetailsData) {
      setUserDetails({
        name: userDetailsData.name,
        email: userDetailsData.email,
      });
      setProfileImage(userDetailsData.profileImage);
    }
  }, [userDetailsData]);

  // Upload profile photo
  const uploadPhotoMutation = useMutation({
    mutationFn: async (base64Image: string) => {
      const response = await api.put(
        '/users/profile-photo',
        { profileImage: base64Image }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userDetails'] });
      setEditPicOpen(false);
    }
  });

  // Address Mutations
  const addAddressMutation = useMutation({
    mutationFn: (address: Address) => api.post('/users/profile/address', address),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userDetails'] });
      setAddressModalOpen(false);
    },
  });

  const updateAddressMutation = useMutation({
    mutationFn: (address: Address) => api.put(`/users/profile/address/${address._id}`, address),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userDetails'] });
      setAddressModalOpen(false);
    },
  });

  const deleteAddressMutation = useMutation({
    mutationFn: (addressId: string) => api.delete(`/users/profile/address/${addressId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userDetails'] });
    },
  });

  const handleSaveAddress = (address: Address) => {
    if (address._id) {
      updateAddressMutation.mutate(address);
    } else {
      addAddressMutation.mutate(address);
    }
  };

  // Orders
  const { data: orders, isLoading: ordersLoading, isError: isOrdersError } = useQuery({
    queryKey: ['orders', user?._id],
    queryFn: async () => {
      const response = await api.get('/orders');
      return response.data;
    },
    enabled: !!token && !authLoading, // Only fetch when authenticated
  });

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => setTabValue(newValue);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setUserDetails({ ...userDetails, [e.target.name]: e.target.value });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    updateProfileMutation.mutate(userDetails);
  };

  // Handle gallery upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const img = event.target?.result as string;
        setProfileImage(img);
        await uploadPhotoMutation.mutate(img);
        setEditPicOpen(false);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  // Handle camera open/close
  const handleOpenCamera = async () => {
    setCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      alert('Camera not available.');
      setCameraOpen(false);
    }
  };
  const handleCloseCamera = () => {
    setCameraOpen(false);
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
  };
  // Capture photo from camera
  const handleCapturePhoto = async () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const img = canvas.toDataURL('image/png');
        setProfileImage(img);
        handleCloseCamera();
        await uploadPhotoMutation.mutate(img);
        setEditPicOpen(false);
      }
    }
  };

  // Remove profile image
  const handleRemoveProfileImage = async () => {
    setProfileImage(null);
    await uploadPhotoMutation.mutate(''); // Send empty string to remove
  };

  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof userDetails) => {
      const response = await api.put('/users/profile', data);
      return response.data;
    },
    onSuccess: (data: any) => {
      setUserDetails(data.user || data);
      setEditMode(false);
      queryClient.invalidateQueries({ queryKey: ['userDetails'] });
      setSuccess(true);
      setIsSaving(false);
    },
    onError: () => {
      setIsSaving(false);
    }
  });

  const handleEditMode = (value: boolean) => {
    setEditMode(value);
    setIsSaving(false);
    setSuccess(false);
    setError(null);
  };

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ py: 6, minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Poppins, Roboto, Helvetica, Arial, sans-serif' }}>
        <Alert severity="info" sx={{ fontSize: 18, p: 3, borderRadius: 3, boxShadow: '0 2px 8px rgba(33,150,243,0.10)' }}>
          Please login to view your profile
        </Alert>
      </Container>
    );
  }

  if (userLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh" bgcolor="background.default">
        <CircularProgress size={60} thickness={4} color="primary" />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', fontFamily: 'Poppins, Roboto, Helvetica, Arial, sans-serif' }}>
      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 6 } }}>
        <Grid container spacing={{ xs: 2, md: 5 }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 4, boxShadow: '0 8px 32px rgba(33,150,243,0.10)', p: { xs: 2, md: 3 }, mb: 2, background: 'linear-gradient(135deg, #2196f3 0%, #21cbf3 100%)', color: 'white' }}>
              <CardContent>
                <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
                  <Box sx={{ position: 'relative' }}>
                    <Avatar
                      src={profileImage || undefined}
                      sx={{ width: 110, height: 110, bgcolor: 'white', mb: 2, boxShadow: '0 2px 8px rgba(33,150,243,0.10)', border: '3px solid #fff' }}
                    >
                      {!profileImage && <PersonIcon sx={{ fontSize: 70, color: '#2196f3' }} />}
                    </Avatar>
                    <IconButton
                      sx={{ position: 'absolute', bottom: 8, right: 8, bgcolor: 'primary.main', color: 'white', boxShadow: 2, '&:hover': { bgcolor: 'secondary.main' } }}
                      onClick={() => setEditPicOpen(true)}
                      size="large"
                    >
                      <PhotoCameraIcon />
                    </IconButton>
                  </Box>
                  <Typography variant={isMobile ? 'h6' : 'h5'} gutterBottom fontWeight={700} sx={{ color: 'white', fontFamily: 'Poppins, Roboto, Helvetica, Arial, sans-serif', textAlign: 'center' }}>{userDetailsData?.name || user.name}</Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)', wordBreak: 'break-all' }}>{userDetailsData?.email || user.email}</Typography>
                </Box>
                <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.2)' }} />
                <Box>
                  <Button
                    variant={editMode ? 'outlined' : 'contained'}
                    fullWidth
                    onClick={() => handleEditMode(!editMode)}
                    startIcon={<EditIcon />}
                    sx={{ mb: 2, fontWeight: 700, borderRadius: 2, fontFamily: 'Poppins, Roboto, Helvetica, Arial, sans-serif', background: editMode ? 'white' : 'rgba(255,255,255,0.15)', color: editMode ? '#2196f3' : 'white', '&:hover': { background: editMode ? 'rgba(33,150,243,0.08)' : 'white', color: '#2196f3' } }}
                  >
                    {editMode ? 'Cancel' : 'Edit Profile'}
                  </Button>
                  {editMode && (
                    <Box sx={{ p: 3, borderRadius: 3, boxShadow: 3, bgcolor: 'white', maxWidth: 350, mx: 'auto' }}>
                      <Box display="flex" justifyContent="flex-end">
                        <IconButton onClick={() => handleEditMode(false)}>
                          <CancelIcon />
                        </IconButton>
                      </Box>
                    <form onSubmit={handleSubmit}>
                      <TextField
                          label="Name"
                          name="name"
                          value={userDetails.name}
                          onChange={handleInputChange}
                          fullWidth
                          sx={{ mb: 2 }}
                      />
                      <TextField
                          label="Email"
                          name="email"
                          value={userDetails.email}
                          disabled
                          fullWidth
                          sx={{ mb: 2 }}
                      />
                      <Button
                          type="submit"
                          variant="contained"
                          fullWidth
                          sx={{ fontWeight: 700, borderRadius: 2 }}
                          disabled={isSaving}
                      >
                          {isSaving ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Save Changes'}
                      </Button>
                        {success && (
                          <Alert severity="success" sx={{ mt: 2 }}>
                            Profile updated successfully!
                          </Alert>
                        )}
                        {error && (
                          <Alert severity="error" sx={{ mt: 2 }}>
                            {error}
                          </Alert>
                  )}
                  <Button
                          startIcon={<LogoutIcon />}
                    color="error"
                    fullWidth
                          sx={{ mt: 2 }}
                    onClick={logout}
                  >
                    Logout
                  </Button>
                      </form>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={8}>
            <Card sx={{ borderRadius: 4, boxShadow: '0 8px 32px rgba(33,150,243,0.10)', p: { xs: 1, sm: 2, md: 3 } }}>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange} 
                aria-label="profile tabs" 
                sx={{ borderBottom: 1, borderColor: 'divider' }}
                variant={isMobile ? "scrollable" : "standard"}
                scrollButtons="auto"
              >
                <Tab label={isMobile ? '' : "My Orders"} icon={<OrderIcon />} iconPosition="start" />
                <Tab label={isMobile ? '' : "My Address"} icon={<AddressIcon />} iconPosition="start" />
                <Tab label={isMobile ? '' : "My Wishlist"} icon={<FavoriteIcon />} iconPosition="start" />
              </Tabs>
              <Divider />

              <TabPanel value={tabValue} index={0}>
                {ordersLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                    <CircularProgress />
                  </Box>
                ) : isOrdersError ? (
                  <Alert severity="error" sx={{ m: 3 }}>Failed to load your orders. Please try again later.</Alert>
                ) : (
                  <Stack spacing={3}>
                    {Array.isArray(orders) && orders.length > 0 ? (
                      orders.map((order: any) => (
                        <Card key={order._id} sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(33,150,243,0.10)' }}>
                          <CardContent>
                            <Typography variant="h6">Order ID: {order._id}</Typography>
                            <Typography>Date: {new Date(order.createdAt).toLocaleDateString()}</Typography>
                            <Typography>Total: ${order.totalAmount}</Typography>
                            <Typography>Status: {order.status}</Typography>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <Typography sx={{ textAlign: 'center', color: 'text.secondary', py: 5 }}>
                        You have no orders yet.
                      </Typography>
                    )}
                  </Stack>
                )}
              </TabPanel>
              <TabPanel value={tabValue} index={1}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h5" gutterBottom>My Addresses</Typography>
                  <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setSelectedAddress(null); setAddressModalOpen(true); }}>
                    Add Address
                  </Button>
                </Box>
                {userDetailsData?.addresses?.length > 0 ? (
                  <Grid container spacing={2}>
                    {userDetailsData.addresses.map((addr: Address) => (
                      <Grid item xs={12} key={addr._id}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="h6">{addr.fullName}</Typography>
                            <Typography>{addr.address}</Typography>
                            <Typography>{`${addr.city}, ${addr.postalCode}`}</Typography>
                            <Typography>{addr.country}</Typography>
                            <Typography>{addr.mobileNumber}</Typography>
                            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                              <Button onClick={() => { setSelectedAddress(addr); setAddressModalOpen(true); }}>Edit</Button>
                              <Button color="error" onClick={() => deleteAddressMutation.mutate(addr._id!)}>Delete</Button>
                            </Stack>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Typography>No saved addresses.</Typography>
                )}
              </TabPanel>
              <TabPanel value={tabValue} index={2}>
                <Typography sx={{ textAlign: 'center', color: 'text.secondary', py: 5 }}>
                  Your wishlist is empty.
                </Typography>
              </TabPanel>
            </Card>
          </Grid>
        </Grid>

        {/* Edit Picture Dialog */}
        <Dialog open={editPicOpen} onClose={() => setEditPicOpen(false)} maxWidth="sm" fullWidth fullScreen={isMobile}>
          <DialogTitle>Update Profile Picture</DialogTitle>
          <DialogContent>
            <Stack spacing={2} my={1}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<ImageIcon />}
              >
                Upload from Gallery
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </Button>
              <Button
                variant="outlined"
                onClick={handleOpenCamera}
                startIcon={<PhotoCameraIcon />}
              >
                Take a Photo
              </Button>
              {profileImage && (
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleRemoveProfileImage}
                  startIcon={<CloseIcon />}
                >
                  Remove Photo
                </Button>
              )}
            </Stack>
          </DialogContent>
        </Dialog>

        {/* Camera Dialog */}
        <Dialog open={cameraOpen} onClose={handleCloseCamera} fullScreen={isMobile}>
          <DialogTitle>Take a Photo</DialogTitle>
          <DialogContent sx={{ position: 'relative' }}>
            <video ref={videoRef} autoPlay style={{ width: '100%', borderRadius: 8 }} />
            <IconButton
              sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(0,0,0,0.5)', color: 'white' }}
              onClick={handleCloseCamera}
            >
              <CloseIcon />
            </IconButton>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCapturePhoto} variant="contained">
              Capture
            </Button>
          </DialogActions>
        </Dialog>

        <AddressForm
          open={addressModalOpen}
          onClose={() => setAddressModalOpen(false)}
          onSave={handleSaveAddress}
          address={selectedAddress}
          isLoading={addAddressMutation.isPending || updateAddressMutation.isPending}
        />
      </Container>
    </Box>
  );
};

export default Profile;