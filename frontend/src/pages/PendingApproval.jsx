import React, { useEffect } from 'react';
import { ShieldAlert, LogOut } from 'lucide-react';
import api from '../services/api';

const PendingApproval = () => {

    const handleLogout = async () => {
        try {
            await api.post('/auth/logout');
            localStorage.removeItem('token');
            window.location.href = '/login';
        } catch (err) {
            console.error("Logout failed", err);
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
            <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
                <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-6">
                    <ShieldAlert className="w-8 h-8 text-yellow-600" />
                </div>

                <h1 className="text-2xl font-bold text-dark mb-2">Profile Verification Pending</h1>
                <p className="text-gray-600 mb-8">
                    Your account has been created successfully. The Admin needs to verify your profile and provide approval before you can access the dashboard.
                </p>

                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-800 mb-8">
                    An admin has been notified of your request. Please check back later or contact HR if this persists.
                </div>

                <button
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-2 w-full py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700 transition-colors"
                >
                    <LogOut className="w-4 h-4" /> Sign Out
                </button>
            </div>
        </div>
    );
};

export default PendingApproval;
