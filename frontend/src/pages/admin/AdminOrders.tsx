import React, { useEffect, useState, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Select, 
  MenuItem, 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  Avatar, 
  Chip, 
  TextField, 
  FormControl, 
  InputLabel, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Snackbar, 
  Alert,
  InputAdornment,
  IconButton,
  Menu,
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import {
  ShoppingCart as ShoppingCartIcon,
  Pending as PendingIcon,
  CheckCircle as CheckCircleIcon,
  AttachMoney as AttachMoneyIcon,
  LocalShipping as LocalShippingIcon,
  Cancel as CancelIcon,
  Info as InfoIcon,
  Inventory as InventoryIcon,
  Visibility as VisibilityIcon,
  Close as CloseIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  ArrowBack as BackIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api';

interface Order {
  _id: string;
  user: { name: string; email: string };
  totalAmount: number;
  status: string;
  createdAt: string;
  items: { product: { name: string }; quantity: number; price: number }[];
  deliveryAddress: { street: string; city: string; state: string; zipCode: string; phone: string };
}

const AdminOrders: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { token, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    delivered: 0,
    revenue: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' | 'warning' }>({ open: false, message: '', severity: 'success' });
  const [error, setError] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);

  const fetchOrders = useCallback(async () => {
    if (authLoading || !token) {
      if (!authLoading && !token) setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/admin/orders?page=${page}&limit=${pageSize}`);
      setOrders(response.data.orders);
      setTotalPages(response.data.pages);
      setStats({
        total: response.data.total,
        pending: response.data.orders.filter((o: any) => o.status === 'pending').length,
        delivered: response.data.orders.filter((o: any) => o.status === 'delivered').length,
        revenue: response.data.orders.reduce((total: number, order: any) => total + order.totalAmount, 0)
      });
      setFilteredOrders(response.data.orders);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setError('Failed to fetch orders. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [authLoading, token, page, pageSize]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await api.put(`/orders/${id}/status`, { status });
      fetchOrders();
    } catch (error) {
      console.error("Failed to update order status:", error);
    }
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setDetailsOpen(true);
  };

  const handleUpdateStatus = async (orderId: string, status: string) => {
    handleMenuClose();
    try {
      await api.put(`/orders/${orderId}/status`, { status });
      fetchOrders(); // Refresh orders
    } catch (err) {
      console.error('Failed to update order status:', err);
      alert('Failed to update order status.');
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    handleMenuClose();
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await api.delete(`/orders/${orderId}`);
        fetchOrders(); // Refresh orders
      } catch (err) {
        console.error('Failed to delete order:', err);
        alert('Failed to delete order.');
      }
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, order: Order) => {
    setAnchorEl(event.currentTarget);
    setSelectedOrder(order);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedOrder(null);
  };

  const handleRefresh = async () => {
    fetchOrders();
  };

  const columns: GridColDef[] = [
    { field: '_id', headerName: 'Order ID', width: 220 },
    { 
      field: 'user', 
      headerName: 'User', 
      width: 200, 
      valueGetter: (params: any) => params.row.user?.name || 'N/A' 
    },
    { 
      field: 'totalAmount', 
      headerName: 'Total', 
      type: 'number', 
      width: 130, 
      valueGetter: (params: any) => params.row.totalAmount,
      renderCell: (params) => `₹${params.value.toFixed(2)}`
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 180,
      renderCell: (params) => (
        <FormControl fullWidth size="small" variant="outlined">
          <InputLabel>Status</InputLabel>
          <Select
            value={params.value}
            label="Status"
            onChange={(e) => handleStatusChange(params.row._id, e.target.value)}
            disabled={loading}
          >
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="shipped">Shipped</MenuItem>
            <MenuItem value="delivered">Delivered</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
          </Select>
        </FormControl>
      ),
    },
    { 
      field: 'createdAt', 
      headerName: 'Date', 
      type: 'dateTime', 
      width: 200, 
      valueGetter: ({ value }) => value && new Date(value) 
    },
    {
      field: 'actions',
      headerName: 'Actions',
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      width: 100,
      renderCell: (params) => <ActionCell row={params.row} />,
    }
  ];

  // Action Menu for each row
  const ActionCell = ({ row }: { row: Order }) => (
    <Box>
      <IconButton onClick={(e) => handleMenuOpen(e, row)}>
        <MoreVertIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl) && selectedOrder?._id === row._id}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleViewDetails(row)}>View Details</MenuItem>
        <MenuItem onClick={() => handleUpdateStatus(row._id, 'processing')}>Set as Processing</MenuItem>
        <MenuItem onClick={() => handleUpdateStatus(row._id, 'out_for_delivery')}>Set as Out for Delivery</MenuItem>
        <MenuItem onClick={() => handleUpdateStatus(row._id, 'delivered')}>Set as Delivered</MenuItem>
        <MenuItem onClick={() => handleUpdateStatus(row._id, 'cancelled')}>Set as Cancelled</MenuItem>
        <Divider />
        <MenuItem onClick={() => handleDeleteOrder(row._id)} sx={{ color: 'error.main' }}>
          Delete Order
        </MenuItem>
      </Menu>
    </Box>
  );

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      pb: 4
    }}>
      {/* Header */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
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
                Order Management
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9, display: isMobile ? 'none' : 'block' }}>
                Process orders, track deliveries, and manage customer satisfaction
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            onClick={handleRefresh}
            disabled={loading}
            startIcon={<RefreshIcon />}
            sx={{ 
              bgcolor: 'rgba(255,255,255,0.2)', 
              color: 'white',
              px: 3,
              py: 1.5,
              fontSize: '1.1rem',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
            }}
          >
            {loading ? 'Refreshing...' : 'Refresh Orders'}
          </Button>
        </Box>
      </Box>

      <Container maxWidth="xl" sx={{ px: 4 }}>
        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #ff980015 0%, #ff980005 100%)',
              border: '1px solid #ff980020',
              borderRadius: 4,
              transition: 'all 0.3s ease',
              '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 32px #ff980020' }
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Avatar sx={{ bgcolor: '#ff9800', width: 56, height: 56, boxShadow: '0 4px 20px #ff980040' }}>
                    <ShoppingCartIcon />
                  </Avatar>
                </Box>
                <Typography variant="h3" fontWeight={700} color="text.primary" mb={1}>
                  {stats.total}
                </Typography>
                <Typography variant="body1" color="text.secondary" fontWeight={500}>
                  Total Orders
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #2196f315 0%, #2196f305 100%)',
              border: '1px solid #2196f320',
              borderRadius: 4,
              transition: 'all 0.3s ease',
              '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 32px #2196f320' }
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Avatar sx={{ bgcolor: '#2196f3', width: 56, height: 56, boxShadow: '0 4px 20px #2196f340' }}>
                    <PendingIcon />
                  </Avatar>
                </Box>
                <Typography variant="h3" fontWeight={700} color="text.primary" mb={1}>
                  {stats.pending}
                </Typography>
                <Typography variant="body1" color="text.secondary" fontWeight={500}>
                  Pending Orders
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #4caf5015 0%, #4caf5005 100%)',
              border: '1px solid #4caf5020',
              borderRadius: 4,
              transition: 'all 0.3s ease',
              '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 32px #4caf5020' }
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Avatar sx={{ bgcolor: '#4caf50', width: 56, height: 56, boxShadow: '0 4px 20px #4caf5040' }}>
                    <CheckCircleIcon />
                  </Avatar>
                </Box>
                <Typography variant="h3" fontWeight={700} color="text.primary" mb={1}>
                  {stats.delivered}
                </Typography>
                <Typography variant="body1" color="text.secondary" fontWeight={500}>
                  Delivered Orders
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #9c27b015 0%, #9c27b005 100%)',
              border: '1px solid #9c27b020',
              borderRadius: 4,
              transition: 'all 0.3s ease',
              '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 32px #9c27b020' }
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Avatar sx={{ bgcolor: '#9c27b0', width: 56, height: 56, boxShadow: '0 4px 20px #9c27b040' }}>
                    <AttachMoneyIcon />
                  </Avatar>
                </Box>
                <Typography variant="h3" fontWeight={700} color="text.primary" mb={1}>
                  ₹{stats.revenue.toLocaleString()}
                </Typography>
                <Typography variant="body1" color="text.secondary" fontWeight={500}>
                  Total Revenue
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Search and Filter */}
        <Card sx={{ mb: 4, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <CardContent sx={{ p: 3 }}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={5}>
                <TextField
                  fullWidth
                  placeholder="Search by Order ID or User..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>
                  }}
                />
              </Grid>
              <Grid item xs={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filterStatus}
                    label="Status"
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="shipped">Shipped</MenuItem>
                    <MenuItem value="delivered">Delivered</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6} md={4}>
                <TextField
                  fullWidth
                  type="date"
                  label="Order Date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Orders Table/List */}
        <Container maxWidth="xl">
          <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
            <CardContent>
              {isMobile ? (
                <Box>
                  {filteredOrders.map(order => (
                    <Card key={order._id} sx={{ m: 2, borderRadius: 2, boxShadow: 1 }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                          <Typography variant="subtitle2" color="text.secondary">
                            ID: {order._id.slice(-8)}
                          </Typography>
                          <ActionCell row={order} />
                        </Box>
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                          {order.user?.name || 'Unknown User'}
                        </Typography>
                        <Chip 
                          label={`₹${order.totalAmount.toFixed(2)}`} 
                          color="primary" 
                          size="small" 
                          icon={<AttachMoneyIcon />} 
                          sx={{ mb: 2 }}
                        />
                        <FormControl fullWidth size="small">
                          <InputLabel>Status</InputLabel>
                          <Select
                            value={order.status}
                            label="Status"
                            onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          >
                            <MenuItem value="pending">Pending</MenuItem>
                            <MenuItem value="shipped">Shipped</MenuItem>
                            <MenuItem value="delivered">Delivered</MenuItem>
                            <MenuItem value="cancelled">Cancelled</MenuItem>
                          </Select>
                        </FormControl>
                        <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1.5, textAlign: 'right' }}>
                          {new Date(order.createdAt).toLocaleString()}
                        </Typography>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              ) : (
                <Box sx={{ height: 600, width: '100%' }}>
                  <DataGrid
                    rows={filteredOrders}
                    columns={columns}
                    getRowId={(row) => row._id}
                    loading={loading}
                    initialState={{
                      pagination: { paginationModel: { pageSize: 10 } },
                    }}
                    pageSizeOptions={[10, 25, 50]}
                    checkboxSelection
                    disableRowSelectionOnClick
                  />
                </Box>
              )}
            </CardContent>
          </Card>
        </Container>

        {/* Pagination controls */}
        <Box display="flex" justifyContent="center" alignItems="center" mt={2}>
          <Button disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</Button>
          <Typography mx={2}>Page {page} of {totalPages}</Typography>
          <Button disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</Button>
        </Box>
      </Container>

      {/* Order Details Dialog */}
      <Dialog 
        open={detailsOpen} 
        onClose={() => setDetailsOpen(false)} 
        fullScreen={isMobile} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Order Details
          <IconButton onClick={() => setDetailsOpen(false)}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedOrder && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" mb={2}>
                  Order #{selectedOrder._id?.slice(-6)}
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  Placed on {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString() : 'N/A'}
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" fontWeight={600} mb={1}>
                      Customer Information
                    </Typography>
                    <Card sx={{ p: 2, background: '#f8f9fa' }}>
                      <Typography variant="body2">Name: {selectedOrder.user?.name}</Typography>
                      <Typography variant="body2">Email: {selectedOrder.user?.email}</Typography>
                      <Typography variant="body2">Phone: {selectedOrder.deliveryAddress?.phone}</Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" fontWeight={600} mb={1}>
                      Order Summary
                    </Typography>
                    <Card sx={{ p: 2, background: '#f8f9fa' }}>
                      <Typography variant="body2">Status: {selectedOrder.status}</Typography>
                      <Typography variant="body2">Total Amount: ₹{selectedOrder.totalAmount}</Typography>
                      <Typography variant="body2">Items: {selectedOrder.items?.length}</Typography>
                    </Card>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} md={6}>
                {/* Order Items */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" fontWeight={600} mb={2}>
                    Order Items ({selectedOrder.items?.length || 0} items)
                  </Typography>
                  <Grid container spacing={2}>
                    {selectedOrder.items?.map((item: any, index: number) => (
                      <Grid item xs={12} sm={6} md={4} key={index}>
                        <Card sx={{ 
                          p: 2, 
                          border: '1px solid #f0f0f0',
                          borderRadius: 2,
                          background: '#fafafa'
                        }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Avatar sx={{ width: 40, height: 40, mr: 2 }}>
                              <InventoryIcon />
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body2" fontWeight={500}>
                                {item.product?.name || 'Unknown Product'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Qty: {item.quantity} • ₹{item.price} each
                              </Typography>
                            </Box>
                          </Box>
                          <Typography variant="body2" color="primary" fontWeight={600}>
                            ₹{item.quantity * item.price}
                          </Typography>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>

                {/* Delivery Address */}
                {selectedOrder.deliveryAddress && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" fontWeight={600} mb={1}>
                      Delivery Address
                    </Typography>
                    <Card sx={{ p: 2, background: '#f8f9fa', borderRadius: 2 }}>
                      <Typography variant="body2">
                        {selectedOrder.deliveryAddress.street}, {selectedOrder.deliveryAddress.city}, {selectedOrder.deliveryAddress.state} {selectedOrder.deliveryAddress.zipCode}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Phone: {selectedOrder.deliveryAddress.phone}
                      </Typography>
                    </Card>
                  </Box>
                )}
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button 
            onClick={() => setDetailsOpen(false)}
            sx={{ color: 'text.secondary' }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

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
    </Box>
  );
};

export default AdminOrders; 