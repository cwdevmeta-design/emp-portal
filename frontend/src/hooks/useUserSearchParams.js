import { useState } from 'react';

export const useUserSearchParams = () => {
    const [searchParams, setSearchParams] = useState({
        role: '',
        department: '',
        designation: '',
        search: ''
    });

    const updateSearchParams = (key, value) => {
        setSearchParams(prev => ({ ...prev, [key]: value }));
    };

    return { searchParams, updateSearchParams };
};
