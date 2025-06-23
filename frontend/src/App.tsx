import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { CircularProgress, Box } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import theme from './theme';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Eagerly load authentication pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import AdminLogin from './pages/admin/AdminLogin';
import LandingPage from './pages/LandingPage';
import About from './pages/About';
import Contact from './pages/Contact';

// Lazy loaded components
const Products = lazy(() => import('./pages/Products'));
const Cart = lazy(() => import('./pages/Cart'));
const Profile = lazy(() => import('./pages/Profile'));
const Checkout = lazy(() => import('./pages/Checkout'));
const UserDashboard = lazy(() => import('./pages/UserDashboard'));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const Home = lazy(() => import('./pages/Home'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'));
const OrderSuccess = lazy(() => import('./pages/OrderSuccess'));

const LoadingFallback = () => (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
    </Box>
);

const AppRouter: React.FC = () => {
    return (
        <Router>
            <Suspense fallback={<LoadingFallback />}>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password/:token" element={<ResetPassword />} />
                    <Route path="/admin/login" element={<AdminLogin />} />

                    {/* Admin Routes */}
                    <Route path="/admin/*" element={<AdminRouteGuard />}>
                        <Route element={<AdminLayout />}>
                            <Route index element={<Navigate to="dashboard" />} />
                            <Route path="dashboard" element={<AdminDashboard />} />
                            <Route path="products" element={<AdminProducts />} />
                            <Route path="users" element={<AdminUsers />} />
                            <Route path="orders" element={<AdminOrders />} />
                        </Route>
                    </Route>

                    {/* User and Public Routes */}
                    <Route path="/" element={<UserLayout />}>
                        <Route index element={<LandingPage />} />
                        <Route path="products" element={<Products />} />
                        <Route path="home" element={<Home />} />
                        <Route path="about" element={<About />} />
                        <Route path="contact" element={<Contact />} />
                        <Route element={<UserRouteGuard />}>
                            <Route path="cart" element={<Cart />} />
                            <Route path="profile" element={<Profile />} />
                            <Route path="checkout" element={<Checkout />} />
                            <Route path="order-success/:orderId" element={<OrderSuccess />} />
                            <Route path="dashboard" element={<UserDashboard />} />
                        </Route>
                        <Route path="*" element={<Navigate to="/home" />} />
                    </Route>
                </Routes>
            </Suspense>
        </Router>
    );
};

const UserLayout: React.FC = () => (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <main style={{ flex: 1, paddingTop: '64px' }}>
            <Outlet />
        </main>
        <Footer />
    </div>
);

const UserRouteGuard: React.FC = () => {
    const { user, loading } = useAuth();
    if (loading) return <LoadingFallback />;
    return user ? <Outlet /> : <Navigate to="/login" replace />;
};

const AdminRouteGuard: React.FC = () => {
    const { user, loading } = useAuth();
    if (loading) return <LoadingFallback />;
    return user && user.role === 'admin' ? <Outlet /> : <Navigate to="/admin/login" replace />;
};

const queryClient = new QueryClient();

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <AuthProvider>
                    <AppRouter />
                </AuthProvider>
            </ThemeProvider>
        </QueryClientProvider>
    );
}

export default App;
