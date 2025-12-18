
import React from 'react';
import { Link } from 'react-router-dom';
import { Users, FileText, Calendar, Settings, Check } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';

const AdminDashboard = () => {
    let userRole = '';
    try {
        const token = localStorage.getItem('token');
        if (token) {
            const decoded = jwtDecode(token);
            userRole = decoded.user?.role || decoded.role;
        }
    } catch (e) { }

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-primary mb-8">Admin Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {userRole === 'Admin' && (
                    <Link to="/admin/users" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-dark">User Management</h2>
                            <Users className="text-secondary w-8 h-8" />
                        </div>
                        <p className="text-dark-grey text-sm">Manage users, roles, and designations.</p>
                    </Link>
                )}

                {/* Attendance - visible for Admin and Manager */}
                {['Admin', 'Manager'].includes(userRole) && (
                    <Link to="/admin/attendance" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-dark">Attendance</h2>
                            <Calendar className="text-attendance-wfo w-8 h-8" />
                        </div>
                        <p className="text-dark-grey text-sm">View team attendance status.</p>
                    </Link>
                )}

                <Link to="/admin/eod" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-dark">EOD Reports</h2>
                        <FileText className="text-primary w-8 h-8" />
                    </div>
                    <p className="text-dark-grey text-sm">View team daily updates.</p>
                </Link>

                <Link to="/admin/approvals" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-dark">Approvals</h2>
                        <Check className="text-green-500 w-8 h-8" />
                    </div>
                    <p className="text-dark-grey text-sm">Approve leaves & requests.</p>
                </Link>

                <Link to="/admin/reports" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-dark">Reports</h2>
                        <FileText className="text-primary w-8 h-8" />
                    </div>
                    <p className="text-dark-grey text-sm">View Monthly Heatmap & Stats.</p>
                </Link>
            </div>
        </div>
    );
};

export default AdminDashboard;
