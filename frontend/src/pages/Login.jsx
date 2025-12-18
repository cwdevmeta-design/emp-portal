import React from 'react';
import googleIcon from '../assets/google.png';
import microsoftIcon from '../assets/microsoft.png';

const Login = () => {
    const handleGoogleLogin = () => {
        window.location.href = 'http://localhost:5000/api/auth/google';
    };

    const handleMicrosoftLogin = () => {
        window.location.href = 'http://localhost:5000/api/auth/microsoft';
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-half-white">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-primary mb-2">Employee Portal</h1>
                    <p className="text-dark-grey">Sign in to access your dashboard</p>
                </div>

                <div className="space-y-4">
                    <button
                        onClick={handleGoogleLogin}
                        className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors bg-white text-dark font-medium"
                    >
                        <img src={googleIcon} alt="Google" className="w-5 h-5" />
                        Sign in with Google
                    </button>

                    <button
                        onClick={handleMicrosoftLogin}
                        className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors bg-white text-dark font-medium"
                    >
                        <img src={microsoftIcon} alt="Microsoft" className="w-5 h-5" />
                        Sign in with Microsoft
                    </button>
                </div>

                <div className="mt-8 text-center text-sm text-dark-grey">
                    <p>Contact your administrator if you have trouble logging in.</p>
                </div>
            </div>
        </div>
    );
};

export default Login;
