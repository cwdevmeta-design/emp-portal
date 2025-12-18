import React from 'react';
import Navbar from './Navbar';
import { Outlet } from 'react-router-dom';

const Layout = () => {
    return (
        <div className="min-h-screen bg-half-white">
            <Navbar />
            <main>
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
