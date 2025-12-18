import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Login from './pages/Login';
import AuthSuccess from './pages/AuthSuccess';
import AdminDashboard from './pages/AdminDashboard';
import UserManagement from './pages/UserManagement';
import EmployeeDashboard from './pages/EmployeeDashboard';
import AttendanceAdmin from './pages/AttendanceAdmin';
import EODAdmin from './pages/EODAdmin';
import LeaveApplication from './pages/LeaveApplication'; // New
import LeaveApprovals from './pages/LeaveApprovals'; // New
import Reports from './pages/Reports'; // New
import Layout from './components/Layout';

// Home Component: Redirects Admins to /admin, others to Employee Dashboard
const Home = () => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" />;

  try {
    const decoded = jwtDecode(token);
    const userRole = decoded.user?.role || decoded.role;

    if (userRole === 'Admin') {
      return <Navigate to="/admin" replace />;
    }
  } catch (e) {
    return <Navigate to="/login" />;
  }

  return <EmployeeDashboard />;
};

import PendingApproval from './pages/PendingApproval';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" />;

  try {
    const decoded = jwtDecode(token);
    const user = decoded.user || decoded; // Handle different payload structures

    // Check Status first
    // If status is NOT 'Active', redirect to pending.
    // This catches 'Pending', 'Inactive', and (importantly) NULL/undefined/empty string.
    if (user.status !== 'Active' && window.location.pathname !== '/pending') {
      return <Navigate to="/pending" />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      return <Navigate to="/" />;
    }
  } catch (e) {
    return <Navigate to="/login" />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/auth/success" element={<AuthSuccess />} />
        <Route path="/pending" element={<PendingApproval />} />

        {/* Protected Routes (Any Authenticated User) */}
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/" element={<Home />} />

          {/* Admin Routes (Admin & Manager Only) */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['Admin', 'Manager']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          <Route path="/admin/users" element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <UserManagement />
            </ProtectedRoute>
          } />

          <Route path="/admin/attendance" element={
            <ProtectedRoute allowedRoles={['Admin', 'Manager']}>
              <AttendanceAdmin />
            </ProtectedRoute>
          } />

          <Route path="/admin/eod" element={
            <ProtectedRoute allowedRoles={['Admin', 'Manager']}>
              <EODAdmin />
            </ProtectedRoute>
          } />

          <Route path="/admin/approvals" element={
            <ProtectedRoute allowedRoles={['Admin', 'Manager']}>
              <LeaveApprovals />
            </ProtectedRoute>
          } />

          <Route path="/admin/reports" element={
            <ProtectedRoute allowedRoles={['Admin', 'Manager']}>
              <Reports />
            </ProtectedRoute>
          } />

          {/* Employee Routes */}
          <Route path="/leaves" element={<LeaveApplication />} />

        </Route>
      </Routes>
    </Router>
  );
}

export default App;
