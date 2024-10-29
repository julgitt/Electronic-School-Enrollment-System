import { useCallback } from 'react';

const useLogout = () => {
    return useCallback(async () => {
        try {
            const response = await fetch('/api/logout', { method: 'GET', credentials: 'include' });
            if (response.ok) {
                window.location.href = '/';
            } else {
                console.error('Logout failed');
            }
        } catch (error) {
            console.error('Error during logout:', error);
        }
    }, []);
};

export default useLogout;
