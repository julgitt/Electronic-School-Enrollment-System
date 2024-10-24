import { useState, useEffect } from 'react';

const useAuthorize = (endpoint: string): boolean => {
    const [authorized, setAuthorized] = useState<boolean>(false);

    useEffect(() => {
        const checkAuthorize = async () => {
            try {
                const response = await fetch(endpoint, { method: 'GET', credentials: 'include' });
                if (!response.ok) {
                    window.location.href = '/login';
                } else {
                    setAuthorized(true);
                }
            } catch {
                window.location.href = '/login';
            }
        };

        checkAuthorize();
    }, []);

    return authorized;
};

export default useAuthorize;
