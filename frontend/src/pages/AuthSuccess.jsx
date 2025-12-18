import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const AuthSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const token = searchParams.get('token');
        if (token) {
            localStorage.setItem('token', token);
            // Ideally fetch user details here and store in Redux
            navigate('/');
        } else {
            navigate('/login?error=no_token');
        }
    }, [searchParams, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <p className="text-lg">Authenticating...</p>
        </div>
    );
};

export default AuthSuccess;
