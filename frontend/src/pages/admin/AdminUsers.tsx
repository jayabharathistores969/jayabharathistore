import React, { useEffect, useState, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Snackbar, 
  Alert, 
  Stack, 
  IconButton, 
  Menu, 
  MenuItem,
  Card,
  CardContent,
  Avatar,
  Chip,
  TextField,
  InputAdornment,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Badge,
  Tooltip,
  Fab,
  Grid,
  Container,
  FormControl,
  InputLabel,
  Select,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { 
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
  Add as AddIcon,
  People as PeopleIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Person as PersonIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
  ArrowBack as BackIcon
} from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api';
import type { User } from '../../contexts/AuthContext';

const AdminUsers: React.FC = () => {
  const { token, loading: authLoading } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' | 'warning' }>({ open: false, message: '', severity: 'success' });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isBanning, setIsBanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);

  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    admins: 0,
    banned: 0
  });

  const fetchUsers = useCallback(async () => {
    if (authLoading || !token) {
      if (!authLoading && !token) setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data);
      setStats({
        total: response.data.length,
        active: response.data.filter((u: User) => !u.isBanned).length,
        admins: response.data.filter((u: User) => u.role === 'admin').length,
        banned: response.data.filter((u: User) => u.isBanned).length
      });
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError('Failed to fetch users. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [authLoading, token]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handlePromote = async (userId: string) => {
    setLoadingUserId(userId);
    try {
      const response = await api.put(`/admin/users/${userId}/promote`);
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user._id === userId ? { ...user, role: response.data.user.role } : user
        )
      );
    } catch (error) {
      // handle error
    } finally {
      setLoadingUserId(null);
    }
  };

  const handleDemote = async (userId: string) => {
    setLoadingUserId(userId);
    try {
      const response = await api.put(`/admin/users/${userId}/demote`);
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user._id === userId ? { ...user, role: response.data.user.role } : user
        )
      );
    } catch (error) {
      // handle error
    } finally {
      setLoadingUserId(null);
    }
  };

  const handleToggleBan = async (userId: string, currentlyActive: boolean) => {
    setLoadingUserId(userId);
    try {
      const endpoint = currentlyActive ? `/admin/users/${userId}/ban` : `/admin/users/${userId}/unban`;
      const response = await api.put(endpoint);
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user._id === userId
            ? { ...user, active: response.data.user.active, isBanned: !response.data.user.active }
            : user
        )
      );
      setSnackbar({ open: true, message: `User ${response.data.user.active ? 'unbanned' : 'banned'} successfully`, severity: 'success' });
    } catch (error) {
      console.error('Error toggling ban:', error);
      setSnackbar({ open: true, message: 'Failed to update user status', severity: 'error' });
    } finally {
      setLoadingUserId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await api.delete(`/admin/users/${id}`);
        setSnackbar({ open: true, message: 'User deleted successfully', severity: 'success' });
        fetchUsers();
      } catch (error) {
        console.error('Failed to delete user:', error);
        setSnackbar({ open: true, message: 'Failed to delete user', severity: 'error' });
      }
    }
  };

  const ActionCell = ({ row }: { row: User }) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
      setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
      setAnchorEl(null);
    };

    const handleAction = (action: () => void) => {
      action();
      handleClose();
    };

    return (
      <>
        <IconButton 
          onClick={handleClick}
          sx={{ 
            borderRadius: 2,
            '&:hover': { background: 'rgba(0,0,0,0.04)' }
          }}
        >
          <MoreVertIcon />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          PaperProps={{
            sx: {
              borderRadius: 2,
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              minWidth: 180
            }
          }}
        >
          <MenuItem 
            onClick={() => handleAction(() => handleToggleBan(row._id, row.active))}
            sx={{ color: row.active ? 'error.main' : 'success.main' }}
          >
            {row.active ? 
              <><BlockIcon sx={{ mr: 2, fontSize: 20 }} /> Ban User</> : 
              <><CheckCircleIcon sx={{ mr: 2, fontSize: 20 }} /> Unban User</>
            }
          </MenuItem>
          {row.role === 'user' ? (
            <MenuItem onClick={() => handleAction(() => handlePromote(row._id))} sx={{ color: 'primary.main' }}>
              <AdminPanelSettingsIcon sx={{ mr: 2, fontSize: 20 }} />
              Promote to Admin
            </MenuItem>
          ) : (
            <MenuItem onClick={() => handleAction(() => handleDemote(row._id))} sx={{ color: 'warning.main' }}>
              <PersonIcon sx={{ mr: 2, fontSize: 20 }} />
              Demote to User
            </MenuItem>
          )}
          <Divider />
          <MenuItem onClick={() => handleAction(() => handleDelete(row._id))} sx={{ color: 'error.main' }}>
            <DeleteIcon sx={{ mr: 2, fontSize: 20 }} />
            Delete User
          </MenuItem>
        </Menu>
      </>
    );
  };

  const columns: GridColDef[] = [
    { 
      field: 'name', 
      headerName: 'User', 
      width: 250,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: params.row.role === 'admin' ? 'primary.main' : 'grey.500' }}>
            {params.row.role === 'admin' ? <AdminPanelSettingsIcon /> : <PersonIcon />}
          </Avatar>
          <Box>
            <Typography variant="subtitle2" fontWeight={600}>
              {params.value}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {params.row.email}
            </Typography>
          </Box>
        </Box>
      )
    },
    { 
      field: 'role', 
      headerName: 'Role', 
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={params.value === 'admin' ? 'primary' : 'default'}
          variant={params.value === 'admin' ? 'filled' : 'outlined'}
          size="small"
          icon={params.value === 'admin' ? <AdminPanelSettingsIcon /> : <PersonIcon />}
        />
      )
    },
    { 
      field: 'active', 
      headerName: 'Status', 
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Active' : 'Banned'}
          color={params.value ? 'success' : 'error'}
          variant="outlined"
          size="small"
          icon={params.value ? <CheckCircleIcon /> : <BlockIcon />}
        />
      )
    },
    { 
      field: 'createdAt', 
      headerName: 'Joined', 
      type: 'dateTime', 
      width: 150, 
      valueGetter: ({ value }) => value && new Date(value),
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary">
          {params.value ? new Date(params.value).toLocaleDateString() : 'N/A'}
        </Typography>
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      width: 100,
      renderCell: (params) => <ActionCell row={params.row} />,
    },
  ];

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || (filterStatus === 'banned' ? user.active : !user.active);
    return matchesSearch && matchesRole && matchesStatus;
  });

  const StatCard = ({ title, value, icon, color }: { title: string, value: number, icon: React.ReactElement, color: string }) => (
    <Grid item xs={12} sm={6} md={3}>
      <Card sx={{ display: 'flex', alignItems: 'center', p: 2, borderRadius: 3, boxShadow: 3 }}>
        <Avatar sx={{ bgcolor: color, width: 56, height: 56, mr: 2 }}>
          {icon}
        </Avatar>
        <Box>
          <Typography variant="h6" fontWeight="bold">{value}</Typography>
          <Typography color="text.secondary">{title}</Typography>
        </Box>
      </Card>
    </Grid>
  );

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      pb: 4
    }}>
      {/* Header */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
        color: 'white',
        p: { xs: 2, sm: 3, md: 4 },
        mb: 4
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              onClick={() => navigate('/admin/dashboard')}
              sx={{ 
                color: 'white',
                bgcolor: 'rgba(255,255,255,0.1)',
                '&:hover': { 
                  bgcolor: 'rgba(255,255,255,0.2)',
                  transform: 'translateX(-2px)'
                },
                transition: 'all 0.2s ease'
              }}
            >
              <BackIcon />
            </IconButton>
            <Box>
              <Typography variant={isMobile ? 'h5' : 'h3'} fontWeight={700} mb={1}>
                User Management
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9, display: isMobile ? 'none' : 'block' }}>
                Manage user accounts, permissions, and access control
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            onClick={fetchUsers}
            disabled={loading}
            startIcon={<RefreshIcon />}
            sx={{ 
              bgcolor: 'rgba(255,255,255,0.2)', 
              color: 'white',
              px: { xs: 2, sm: 3 },
              py: { xs: 1, sm: 1.5 },
              fontSize: { xs: '0.9rem', sm: '1.1rem' },
              '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
            }}
          >
            {loading ? 'Refreshing...' : 'Refresh Users'}
          </Button>
        </Box>
      </Box>

      <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 4 } }}>
        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <StatCard title="Total Users" value={stats.total} icon={<PeopleIcon />} color="#2196f3" />
          <StatCard title="Active Users" value={stats.active} icon={<CheckCircleIcon />} color="#4caf50" />
          <StatCard title="Admins" value={stats.admins} icon={<AdminPanelSettingsIcon />} color="#ff9800" />
          <StatCard title="Banned" value={stats.banned} icon={<BlockIcon />} color="#f44336" />
        </Grid>

        {/* Search and Filter */}
        <Card sx={{ mb: 4, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="action" />
                      </InputAdornment>
                    ),
                    sx: { borderRadius: 2 }
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': { borderColor: '#2196f3' },
                      '&.Mui-focused fieldset': { borderColor: '#2196f3' }
                    }
                  }}
                />
              </Grid>
              <Grid item xs={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Role Filter</InputLabel>
                  <Select
                    value={filterRole}
                    label="Role Filter"
                    onChange={(e) => setFilterRole(e.target.value)}
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="all">All Roles</MenuItem>
                    <MenuItem value="user">Users</MenuItem>
                    <MenuItem value="admin">Admins</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Status Filter</InputLabel>
                  <Select
                    value={filterStatus}
                    label="Status Filter"
                    onChange={(e) => setFilterStatus(e.target.value)}
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="banned">Banned</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Users List */}
        {filteredUsers.length === 0 ? (
          <Card sx={{ borderRadius: 4, textAlign: 'center', py: 8 }}>
            <CardContent>
              <Avatar sx={{ bgcolor: 'grey.300', width: 80, height: 80, mx: 'auto', mb: 3 }}>
                <PeopleIcon sx={{ fontSize: 40 }} />
              </Avatar>
              <Typography variant="h5" color="text.secondary" mb={2}>
                No Users Found
              </Typography>
              <Typography variant="body1" color="text.secondary" mb={3}>
                {searchTerm || filterRole !== 'all' || filterStatus !== 'all'
                  ? 'Try adjusting your search criteria or filters.'
                  : 'Users will appear here once they register.'
                }
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {filteredUsers.map((user) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={user._id}>
                <Card sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  borderRadius: 4,
                  transition: 'all 0.3s ease',
                  border: '1px solid #e0e0e0',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                    borderColor: '#2196f3'
                  }
                }}>
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Avatar 
                        sx={{ 
                          width: 60, 
                          height: 60, 
                          mr: 2,
                          bgcolor: user.role === 'admin' ? '#ff9800' : '#2196f3',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
                        }}
                      >
                        {user.name?.charAt(0)?.toUpperCase() || 'U'}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" fontWeight={600} mb={1}>
                          {user.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {user.email}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <Chip
                            label={user.role}
                            color={user.role === 'admin' ? 'warning' : 'primary'}
                            size="small"
                            icon={user.role === 'admin' ? <AdminPanelSettingsIcon /> : <PersonIcon />}
                          />
                          <Chip
                            label={user.active ? 'Active' : 'Banned'}
                            color={user.active ? 'success' : 'error'}
                            size="small"
                            icon={user.active ? <CheckCircleIcon /> : <BlockIcon />}
                          />
                        </Box>
                      </Box>
                    </Box>

                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        <strong>Phone:</strong> {user.phone || 'Not provided'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        <strong>Joined:</strong> {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Last Login:</strong> {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {user.role === 'user' && (
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handlePromote(user._id)}
                          startIcon={<AdminPanelSettingsIcon />}
                          sx={{ 
                            borderRadius: 2,
                            borderColor: '#ff9800',
                            color: '#ff9800',
                            '&:hover': { 
                              borderColor: '#f57c00', 
                              bgcolor: '#ff980010' 
                            },
                          }}
                          disabled={loadingUserId === user._id}
                        >
                          Promote
                        </Button>
                      )}
                      {user.role === 'admin' && (
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleDemote(user._id)}
                          startIcon={<PersonIcon />}
                          sx={{ 
                            borderRadius: 2,
                            borderColor: '#2196f3',
                            color: '#2196f3',
                            '&:hover': { 
                              borderColor: '#1976d2', 
                              bgcolor: '#2196f310' 
                            },
                          }}
                          disabled={loadingUserId === user._id}
                        >
                          Demote
                        </Button>
                      )}
                      <Button
                        color={user.active ? 'error' : 'success'}
                        variant="outlined"
                        size="small"
                        onClick={() => {
                          setSelectedUser(user);
                          setIsBanning(user.active);
                          setDialogOpen(true);
                        }}
                        startIcon={user.active ? <BlockIcon /> : <CheckCircleIcon />}
                        sx={{ 
                          borderRadius: 2,
                          borderColor: user.active ? '#f44336' : '#4caf50',
                          color: user.active ? '#f44336' : '#4caf50',
                          '&:hover': { 
                            borderColor: user.active ? '#d32f2f' : '#45a049', 
                            bgcolor: user.active ? '#f4433610' : '#4caf5010' 
                          },
                        }}
                        disabled={loadingUserId === user._id}
                      >
                        {user.active ? 'Ban' : 'Unban'}
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Confirmation Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      >
        <DialogTitle>Confirm Action</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to {isBanning ? 'ban' : 'unban'} "{selectedUser?.name}"?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={() => {
              if (selectedUser) {
                handleToggleBan(selectedUser._id, selectedUser.active);
              }
              setDialogOpen(false);
              setSelectedUser(null);
            }} 
            color={isBanning ? 'error' : 'success'}
            autoFocus
          >
            {isBanning ? 'Ban' : 'Unban'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminUsers; 