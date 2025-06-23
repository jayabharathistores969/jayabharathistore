import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Button, 
  Stack,
  Avatar,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Alert,
  CircularProgress,
  Chip,
  IconButton,
  Tooltip,
  LinearProgress,
  Container,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Inventory as InventoryIcon,
  ShoppingCart as OrdersIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon,
  Visibility as ViewIcon,
  LocalShipping as ShippingIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
  ArrowBack as BackIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api';

type DashboardStats = {
  users: number;
  products: number;
  orders: number;
  revenue: number;
  userGrowth: number;
  productGrowth: number;
  orderGrowth: number;
  revenueGrowth: number;
  recentOrders: any[];
  lowStockProducts: any[];
};

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user, token, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    users: 0,
    products: 0,
    orders: 0,
    revenue: 0,
    userGrowth: 0,
    productGrowth: 0,
    orderGrowth: 0,
    revenueGrowth: 0,
    recentOrders: [],
    lowStockProducts: []
  });

  useEffect(() => {
    if (authLoading) {
      setLoading(true);
      return;
    }

    if (token) {
      loadDashboardData();
    } else {
      setLoading(false);
    }
  }, [token, authLoading]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/dashboard-stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const response = await api.get('/admin/dashboard-stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error refreshing dashboard data:', error);
    }
    setRefreshing(false);
  };

  const StatCard = ({ title, value, icon, color, growth, onClick }: any) => (
    <Card 
      sx={{ 
        height: '100%',
        background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
        borderRadius: 4,
        transition: 'all 0.3s ease',
        cursor: onClick ? 'pointer' : 'default',
        border: `1px solid ${color}20`,
        position: 'relative',
        overflow: 'hidden',
        '&:hover': onClick ? {
          transform: 'translateY(-8px)',
          boxShadow: `0 12px 40px ${color}20`,
          borderColor: color,
        } : {}
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: 3, position: 'relative', zIndex: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Avatar sx={{ bgcolor: color, width: 60, height: 60, boxShadow: `0 4px 20px ${color}40` }}>
            {icon}
          </Avatar>
          {growth !== undefined && (
            <Chip
              icon={growth >= 0 ? <ArrowUpIcon /> : <ArrowDownIcon />}
              label={`${Math.abs(growth)}%`}
              color={growth >= 0 ? 'success' : 'error'}
              variant="outlined"
              size="small"
            />
          )}
        </Box>
        <Typography variant="h3" fontWeight={700} color="text.primary" mb={1}>
          {title === 'Total Revenue'
            ? `₹${(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
            : (value || 0).toLocaleString('en-IN')}
        </Typography>
        <Typography variant="body1" color="text.secondary" fontWeight={500} sx={{ mb: 1 }}>
          {title}
        </Typography>
        <LinearProgress 
          variant="determinate" 
          value={Math.min((value / 100) * 100, 100)} 
          sx={{ 
            height: 4, 
            borderRadius: 2, 
            bgcolor: `${color}20`,
            '& .MuiLinearProgress-bar': { bgcolor: color }
          }} 
        />
      </CardContent>
    </Card>
  );

  const QuickActionCard = ({ title, description, icon, color, onClick }: any) => (
    <Card 
      sx={{ 
        height: '100%',
        background: 'white',
        borderRadius: 4,
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        border: '1px solid #e0e0e0',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 8px 32px ${color}20`,
          borderColor: color,
        }
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: 3, textAlign: 'center', position: 'relative', zIndex: 2 }}>
        <Avatar sx={{ bgcolor: color, width: 72, height: 72, mx: 'auto', mb: 3, boxShadow: `0 4px 20px ${color}40` }}>
          {icon}
        </Avatar>
        <Typography variant="h6" fontWeight={600} mb={2} color="text.primary">
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {description}
        </Typography>
        <Button 
          variant="outlined" 
          size="small" 
          sx={{ 
            borderColor: color, 
            color: color,
            '&:hover': { 
              borderColor: color, 
              bgcolor: `${color}10` 
            } 
          }}
        >
          Manage
        </Button>
      </CardContent>
    </Card>
  );

  const RecentOrderCard = ({ order }: any) => (
    <Card sx={{ mb: 2, borderRadius: 3, border: '1px solid #e0e0e0' }}>
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="subtitle2" fontWeight={600}>
            Order #{order._id?.slice(-6) || 'N/A'}
          </Typography>
          <Chip
            label={order.status?.replace('_', ' ').toUpperCase() || 'PENDING'}
            color={
              order.status === 'delivered' ? 'success' :
              order.status === 'out_for_delivery' ? 'primary' :
              order.status === 'processing' ? 'warning' : 'default'
            }
            size="small"
            icon={
              order.status === 'delivered' ? <CheckCircleIcon /> :
              order.status === 'out_for_delivery' ? <ShippingIcon /> :
              order.status === 'processing' ? <WarningIcon /> : <InfoIcon />
            }
          />
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {order.user?.name || 'Unknown User'} • ₹{order.totalAmount || 0}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
        </Typography>
      </CardContent>
    </Card>
  );

  const LowStockCard = ({ product }: any) => (
    <Card sx={{ mb: 2, borderRadius: 3, border: '1px solid #ff980020' }}>
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="subtitle2" fontWeight={600}>
            {product.name}
          </Typography>
          <Chip
            label={`${product.stock} left`}
            color="warning"
            size="small"
            icon={<WarningIcon />}
          />
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {product.category} • ₹{product.price}
        </Typography>
        <LinearProgress 
          variant="determinate" 
          value={Math.min((product.stock / 10) * 100, 100)} 
          sx={{ 
            height: 3, 
            borderRadius: 2,
            bgcolor: '#ff980020',
            '& .MuiLinearProgress-bar': { bgcolor: '#ff9800' }
          }} 
        />
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={80} sx={{ color: 'white', mb: 2 }} />
          <Typography variant="h6" color="white">
            Loading Dashboard...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      pb: 4
    }}>
      {/* Header */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        p: { xs: 2, md: 4 },
        mb: 4
      }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: { xs: 'flex-start', sm: 'center' },
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              onClick={() => navigate('/')}
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
              <Typography variant={isMobile ? 'h5' : 'h4'} fontWeight={700} mb={1}>
                Admin Dashboard
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Welcome back, {user?.name}!
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            onClick={handleRefresh}
            disabled={refreshing}
            startIcon={<RefreshIcon />}
            sx={{ 
              bgcolor: 'rgba(255,255,255,0.2)', 
              color: 'white',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
            }}
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </Box>
      </Box>

      <Container maxWidth="xl" sx={{ px: { xs: 2, md: 4 } }}>
        {/* Stats Cards */}
        <Grid container spacing={isMobile ? 2 : 3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Users"
              value={stats.users}
              icon={<PeopleIcon />}
              color="#2196f3"
              growth={stats.userGrowth}
              onClick={() => navigate('/admin/users')}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Products"
              value={stats.products}
              icon={<InventoryIcon />}
              color="#4caf50"
              growth={stats.productGrowth}
              onClick={() => navigate('/admin/products')}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Orders"
              value={stats.orders}
              icon={<OrdersIcon />}
              color="#ff9800"
              growth={stats.orderGrowth}
              onClick={() => navigate('/admin/orders')}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Revenue"
              value={stats.revenue}
              icon={<MoneyIcon />}
              color="#9c27b0"
              growth={stats.revenueGrowth}
            />
          </Grid>
        </Grid>

        <Grid container spacing={isMobile ? 2 : 4}>
          {/* Quick Actions */}
          <Grid item xs={12} lg={4}>
            <Card sx={{ borderRadius: 4, mb: { xs: 2, lg: 4 } }}>
              <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                <Typography variant="h5" fontWeight={600} mb={3} color="text.primary">
                  Quick Actions
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <QuickActionCard
                      title="Products"
                      description="Manage your product catalog"
                      icon={<InventoryIcon />}
                      color="#4caf50"
                      onClick={() => navigate('/admin/products')}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <QuickActionCard
                      title="Orders"
                      description="Process and track orders"
                      icon={<OrdersIcon />}
                      color="#ff9800"
                      onClick={() => navigate('/admin/orders')}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <QuickActionCard
                      title="Users"
                      description="Manage user accounts"
                      icon={<PeopleIcon />}
                      color="#2196f3"
                      onClick={() => navigate('/admin/users')}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <QuickActionCard
                      title="Analytics"
                      description="View detailed reports"
                      icon={<TrendingUpIcon />}
                      color="#9c27b0"
                      onClick={() => navigate('/admin/dashboard')}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Orders */}
          <Grid item xs={12} lg={4}>
            <Card sx={{ borderRadius: 4, mb: { xs: 2, lg: 4 } }}>
              <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h5" fontWeight={600} color="text.primary">
                    Recent Orders
                  </Typography>
                  <IconButton size="small" onClick={() => navigate('/admin/orders')}>
                    <ViewIcon />
                  </IconButton>
                </Box>
                {stats.recentOrders.length === 0 ? (
                  <Alert severity="info" sx={{ borderRadius: 2 }}>
                    No recent orders
                  </Alert>
                ) : (
                  stats.recentOrders.map((order, index) => (
                    <RecentOrderCard key={order._id || index} order={order} />
                  ))
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Low Stock Alert */}
          <Grid item xs={12} lg={4}>
            <Card sx={{ borderRadius: 4, mb: { xs: 2, lg: 4 } }}>
              <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h5" fontWeight={600} color="text.primary">
                    Low Stock Alert
                  </Typography>
                  <Chip label={stats.lowStockProducts.length} color="warning" size="small" />
                </Box>
                {stats.lowStockProducts.length === 0 ? (
                  <Alert severity="success" sx={{ borderRadius: 2 }}>
                    All products are well stocked!
                  </Alert>
                ) : (
                  stats.lowStockProducts.map((product, index) => (
                    <LowStockCard key={product._id || index} product={product} />
                  ))
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default AdminDashboard; 