import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LandingPage from '../features/landing/LandingPage';
import Login from '../features/auth/Login';
import Register from '../features/auth/Register';
import FanDashboard from '../features/fan/FanDashboard';
import AdminDashboard from '../features/admin/AdminDashboard';
const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',color:'#FF7A30',fontSize:18,fontWeight:700}}>Loading SoccerSphere...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
};
const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/fan/*" element={<ProtectedRoute role="FAN"><FanDashboard /></ProtectedRoute>} />
    <Route path="/admin/*" element={<ProtectedRoute role="ADMIN"><AdminDashboard /></ProtectedRoute>} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);
export default AppRoutes;
