import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User, LayoutDashboard, Settings, Menu, X } from 'lucide-react'; // Added Menu, X
import NotificationBell from './NotificationBell';
import { useState } from 'react'; // Added useState

import { jwtDecode } from 'jwt-decode';

const Navbar = () => {
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false); // Profile Dropdown State
    let userRole = '';
    let userName = 'U'; // Initial
    let userFullName = 'User'; // Full Name

    try {
        const token = localStorage.getItem('token');
        if (token) {
            const decoded = jwtDecode(token);
            userRole = decoded.user?.role || decoded.role;

            const fullName = decoded.user?.name || decoded.name;
            if (fullName) {
                userFullName = fullName;
                userName = fullName.charAt(0).toUpperCase();
            }
        }
    } catch (e) {
        console.error("Token decode failed", e);
    }

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <nav className="bg-white border-b border-gray-200 relative z-50">
            <div className="px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {/* Hamburger Button (Mobile Only) */}
                    <button
                        className="md:hidden p-1 text-gray-600 hover:bg-gray-100 rounded"
                        onClick={toggleMobileMenu}
                    >
                        {isMobileMenuOpen ? <X /> : <Menu />}
                    </button>

                    <Link to="/" className="text-xl font-bold text-primary">EmployeePortal</Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
                        {userRole !== 'Admin' && (
                            <Link to="/" className="hover:text-primary transition-colors flex items-center gap-2">
                                <LayoutDashboard className="w-4 h-4" /> Dashboard
                            </Link>
                        )}
                        {['Admin', 'Manager'].includes(userRole) && (
                            <Link to="/admin" className="hover:text-primary transition-colors flex items-center gap-2">
                                <Settings className="w-4 h-4" /> Admin
                            </Link>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <NotificationBell />

                    {/* Profile Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center font-bold text-xs hover:bg-secondary-dark focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-secondary transition-colors"
                        >
                            {userName}
                        </button>

                        {isProfileOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setIsProfileOpen(false)}
                                ></div>
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-20 animate-in fade-in zoom-in-95 duration-200">
                                    <div className="px-4 py-2 border-b border-gray-100">
                                        <p className="text-sm font-medium text-dark">Account</p>
                                        <p className="text-sm font-bold text-primary truncate max-w-[150px]">{userFullName}</p>
                                        <p className="text-xs text-gray-500 capitalize">{userRole}</p>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                                    >
                                        <LogOut className="w-4 h-4" /> Logout
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMobileMenuOpen && (
                <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-gray-200 shadow-lg flex flex-col p-4 gap-4 animate-in slide-in-from-top-2">
                    {userRole !== 'Admin' && (
                        <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded text-gray-700 font-medium">
                            <LayoutDashboard className="w-5 h-5" /> Dashboard
                        </Link>
                    )}
                    {['Admin', 'Manager'].includes(userRole) && (
                        <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded text-gray-700 font-medium">
                            <Settings className="w-5 h-5" /> Admin Dashboard
                        </Link>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;
