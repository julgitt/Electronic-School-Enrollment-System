import { useState } from 'react';

const useLogout = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogout = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/logout', { method: 'POST', credentials: 'include' });
            if (response.ok) {
                window.location.href = '/';
                window.location.reload();
            } else {
                setError('Nie udało się wylogować.');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return { handleLogout, loading, error };
};

export default useLogout;
