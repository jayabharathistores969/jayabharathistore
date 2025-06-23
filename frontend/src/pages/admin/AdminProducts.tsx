import React, { useEffect, useState, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  TextField, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogTitle,
  Card,
  CardContent,
  Avatar,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Snackbar,
  Alert,
  Grid,
  InputAdornment,
  Tooltip,
  Fab,
  Divider,
  FormControl,
  InputLabel,
  Select,
  Switch,
  FormControlLabel,
  Container,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
  Inventory as InventoryIcon,
  AttachMoney as MoneyIcon,
  Visibility as ViewIcon,
  VisibilityOff as HideIcon,
  FilterList as FilterIcon,
  Image as ImageIcon,
  Category as CategoryIcon,
  Close as CloseIcon,
  Error as ErrorIcon,
  ArrowBack as BackIcon
} from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  category: string;
  isAvailable: boolean;
}

const AdminProducts: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' | 'warning' }>({ open: false, message: '', severity: 'success' });
  const { token, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    if (authLoading || !token) {
      if (!authLoading && !token) setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/products/all');
      setProducts(response.data);
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setError('Failed to fetch products. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [authLoading, token]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleClickOpen = (product?: Product) => {
    setIsEditing(!!product);
    setCurrentProduct(product || { 
      _id: '', 
      name: '', 
      description: '', 
      price: 0, 
      stock: 0, 
      image: '', 
      category: '',
      isAvailable: true 
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setCurrentProduct(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (currentProduct) {
      setCurrentProduct({ ...currentProduct, [e.target.name]: e.target.value });
    }
  };

  const handleSelectChange = (e: any) => {
    if (currentProduct) {
      setCurrentProduct({ ...currentProduct, [e.target.name]: e.target.value });
    }
  };

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (currentProduct) {
      setCurrentProduct({ ...currentProduct, [e.target.name]: e.target.checked });
    }
  };

  const handleSave = async () => {
    try {
      if (isEditing) {
        await api.put(`/products/${currentProduct?._id}`, currentProduct);
        setSnackbar({ open: true, message: 'Product updated successfully', severity: 'success' });
      } else {
        await api.post('/products', currentProduct);
        setSnackbar({ open: true, message: 'Product created successfully', severity: 'success' });
      }
      fetchProducts(); // Refresh the list
      handleClose();
    } catch (error) {
      console.error("Failed to save product:", error);
      setSnackbar({ open: true, message: 'Failed to save product', severity: 'error' });
    }
  };
  
  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
    try {
        await api.delete(`/products/${id}`);
        setSnackbar({ open: true, message: 'Product deleted successfully', severity: 'success' });
        fetchProducts(); // Refresh the list
    } catch (error) {
      console.error("Failed to delete product:", error);
        setSnackbar({ open: true, message: 'Failed to delete product', severity: 'error' });
      }
    }
  };

  const ActionCell = ({ row }: { row: Product }) => {
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
          <MenuItem onClick={() => handleAction(() => handleClickOpen(row))} sx={{ color: 'primary.main' }}>
            <EditIcon sx={{ mr: 2, fontSize: 20 }} />
            Edit Product
          </MenuItem>
          <MenuItem onClick={() => handleAction(() => window.open(row.image, '_blank'))} sx={{ color: 'info.main' }}>
            <ViewIcon sx={{ mr: 2, fontSize: 20 }} />
            View Image
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => handleAction(() => handleDelete(row._id))} sx={{ color: 'error.main' }}>
            <DeleteIcon sx={{ mr: 2, fontSize: 20 }} />
            Delete Product
          </MenuItem>
        </Menu>
      </>
    );
  };

  const columns: GridColDef[] = [
    { 
      field: 'name', 
      headerName: 'Product', 
      width: 300,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar 
            src={params.row.image} 
            sx={{ width: 48, height: 48, bgcolor: 'grey.300' }}
          >
            <ImageIcon />
          </Avatar>
          <Box>
            <Typography variant="subtitle2" fontWeight={600}>
              {params.value}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {params.row.description}
            </Typography>
          </Box>
        </Box>
      )
    },
    { 
      field: 'category', 
      headerName: 'Category', 
      width: 150,
      renderCell: (params) => (
        <Chip
          label={params.value || 'Uncategorized'}
          color="primary"
          variant="outlined"
          size="small"
          icon={<CategoryIcon />}
        />
      )
    },
    { 
      field: 'price', 
      headerName: 'Price', 
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={600}>
          ₹{params.value.toFixed(2)}
        </Typography>
      )
    },
    { 
      field: 'stock', 
      headerName: 'Stock', 
      type: 'number', 
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={params.value > 10 ? 'success' : params.value > 0 ? 'warning' : 'error'}
          variant="outlined"
          size="small"
          icon={<InventoryIcon />}
        />
      )
    },
    { 
      field: 'isAvailable', 
      headerName: 'Status', 
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Available' : 'Unavailable'}
          color={params.value ? 'success' : 'default'}
          variant="outlined"
          size="small"
          icon={params.value ? <ViewIcon /> : <HideIcon />}
        />
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      sortable: false,
      filterable: false,
      renderCell: (params) => <ActionCell row={params.row} />,
    },
  ];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const stats = {
    total: products.length,
    active: products.filter(p => p.isAvailable).length,
    lowStock: products.filter(p => p.stock <= 10 && p.stock > 0).length,
    outOfStock: products.filter(p => p.stock === 0).length
  };

  const categories = Array.from(new Set(products.map(p => p.category)));

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      pb: 4
    }}>
      {/* Header */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
        color: 'white',
        p: 4,
        mb: 4
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
              <Typography variant="h3" fontWeight={700} mb={1}>
                Product Management
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                Manage your product catalog, inventory, and pricing
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            onClick={() => handleClickOpen()}
            startIcon={<AddIcon />}
            sx={{ 
              bgcolor: 'rgba(255,255,255,0.2)', 
              color: 'white',
              px: 3,
              py: 1.5,
              fontSize: '1.1rem',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
            }}
          >
            Add Product
          </Button>
        </Box>
      </Box>

      <Container maxWidth="xl" sx={{ px: 4 }}>
        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
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
                    <InventoryIcon />
                  </Avatar>
                </Box>
                <Typography variant="h3" fontWeight={700} color="text.primary" mb={1}>
                  {stats.total}
                </Typography>
                <Typography variant="body1" color="text.secondary" fontWeight={500}>
                  Total Products
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
                    <ViewIcon />
                  </Avatar>
                </Box>
                <Typography variant="h3" fontWeight={700} color="text.primary" mb={1}>
                  {stats.active}
                </Typography>
                <Typography variant="body1" color="text.secondary" fontWeight={500}>
                  Active Products
                </Typography>
              </CardContent>
            </Card>
          </Grid>
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
                    <InventoryIcon />
                  </Avatar>
                </Box>
                <Typography variant="h3" fontWeight={700} color="text.primary" mb={1}>
                  {stats.lowStock}
                </Typography>
                <Typography variant="body1" color="text.secondary" fontWeight={500}>
                  Low Stock
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #f4433615 0%, #f4433605 100%)',
              border: '1px solid #f4433620',
              borderRadius: 4,
              transition: 'all 0.3s ease',
              '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 32px #f4433620' }
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Avatar sx={{ bgcolor: '#f44336', width: 56, height: 56, boxShadow: '0 4px 20px #f4433640' }}>
                    <InventoryIcon />
                  </Avatar>
                </Box>
                <Typography variant="h3" fontWeight={700} color="text.primary" mb={1}>
                  {stats.outOfStock}
                </Typography>
                <Typography variant="body1" color="text.secondary" fontWeight={500}>
                  Out of Stock
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Search and Filter */}
        <Card sx={{ mb: 4, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <CardContent sx={{ p: 3 }}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder="Search products by name or description..."
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
                      '&:hover fieldset': { borderColor: '#4caf50' },
                      '&.Mui-focused fieldset': { borderColor: '#4caf50' }
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Category Filter</InputLabel>
                  <Select
                    value={filterCategory}
                    label="Category Filter"
                    onChange={(e) => setFilterCategory(e.target.value)}
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="all">All Categories</MenuItem>
                    {categories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => {
                    setSearchTerm('');
                    setFilterCategory('all');
                  }}
                  sx={{ 
                    borderRadius: 2,
                    borderColor: '#4caf50',
                    color: '#4caf50',
                    '&:hover': { 
                      borderColor: '#45a049', 
                      bgcolor: '#4caf5010' 
                    }
                  }}
                >
                  Clear Filters
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <Card sx={{ borderRadius: 4, textAlign: 'center', py: 8 }}>
            <CardContent>
              <Avatar sx={{ bgcolor: 'grey.300', width: 80, height: 80, mx: 'auto', mb: 3 }}>
                <InventoryIcon sx={{ fontSize: 40 }} />
              </Avatar>
              <Typography variant="h5" color="text.secondary" mb={2}>
                No Products Found
              </Typography>
              <Typography variant="body1" color="text.secondary" mb={3}>
                {searchTerm || filterCategory !== 'all' 
                  ? 'Try adjusting your search criteria or filters.'
                  : 'Get started by adding your first product to the catalog.'
                }
              </Typography>
              {!searchTerm && filterCategory === 'all' && (
                <Button
                  variant="contained"
                  onClick={() => handleClickOpen()}
                  startIcon={<AddIcon />}
                  sx={{ 
                    bgcolor: '#4caf50',
                    '&:hover': { bgcolor: '#45a049' }
                  }}
                >
                  Add Your First Product
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {filteredProducts.map((product) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
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
                    borderColor: '#4caf50'
                  }
                }}>
                  <Box
                    component="img"
                    src={product.image || 'https://via.placeholder.com/300x200?text=Product'}
                    alt={product.name}
                    sx={{ 
                      height: 200, 
                      objectFit: 'cover',
                      borderTopLeftRadius: 16,
                      borderTopRightRadius: 16
                    }}
                  />
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6" fontWeight={600} sx={{ flex: 1, mr: 1 }}>
                        {product.name}
                      </Typography>
                      <ActionCell row={product} />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
                      {product.description}
                    </Typography>
                    <Chip 
                      label={product.category} 
                      size="small" 
                      sx={{ mb: 2, bgcolor: '#4caf5010', color: '#4caf50' }}
                      icon={<CategoryIcon />}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" color="primary" fontWeight={600}>
                        ₹{product.price}
                      </Typography>
                      <Chip
                        label={`${product.stock} in stock`}
                        color={product.stock > 10 ? 'success' : product.stock > 0 ? 'warning' : 'error'}
                        variant="outlined"
                        size="small"
                        icon={<InventoryIcon />}
                      />
                    </Box>
                    <Chip
                      label={product.isAvailable ? 'Available' : 'Unavailable'}
                      color={product.isAvailable ? 'success' : 'default'}
                      variant="outlined"
                      size="small"
                      icon={product.isAvailable ? <ViewIcon /> : <HideIcon />}
                      sx={{ width: '100%' }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      {/* Product Dialog */}
      <Dialog 
        open={open} 
        onClose={handleClose} 
        fullScreen={isMobile}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {isEditing ? 'Edit Product' : 'Add New Product'}
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {currentProduct && (
            <Grid container spacing={2} sx={{ pt: 2 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="name"
                  label="Product Name"
                  value={currentProduct.name}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="description"
                  label="Description"
                  value={currentProduct.description}
                  onChange={handleChange}
                  multiline
                  rows={3}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="price"
                  label="Price"
                  type="number"
                  value={currentProduct.price}
                  onChange={handleChange}
                  InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="stock"
                  label="Stock"
                  type="number"
                  value={currentProduct.stock}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    name="category"
                    value={currentProduct.category}
                    label="Category"
                    onChange={handleSelectChange}
                  >
                     {categories.filter(cat => cat !== 'all').map(cat => <MenuItem key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="image"
                  label="Image URL"
                  value={currentProduct.image}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={currentProduct.isAvailable}
                      onChange={handleSwitchChange}
                      name="isAvailable"
                    />
                  }
                  label="Product is available"
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">Save</Button>
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

export default AdminProducts; 