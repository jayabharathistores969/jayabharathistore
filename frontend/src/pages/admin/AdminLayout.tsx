import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AdminNavbar from './AdminNavbar';
import AdminFooter from './AdminFooter';
import { Box } from '@mui/material';

// Admin Pages
import AdminDashboard from './AdminDashboard';
import AdminProducts from './AdminProducts';
import AdminUsers from './AdminUsers';
import AdminOrders from './AdminOrders';

const AdminLayout: React.FC = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!user || user.role !== 'admin') {
        return <Navigate to="/admin/login" />;
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <AdminNavbar />
            <Box component="main" sx={{ flexGrow: 1, p: 3, pt: 10 }}>
                <Outlet />
            </Box>
            <AdminFooter />
        </Box>
    );
};

export default AdminLayout; 