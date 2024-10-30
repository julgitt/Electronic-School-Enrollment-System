import { useState } from 'react';

interface UseLoginReturn {
    handleLogin: (username: string, password: string) => Promise<void>;
    isLoading: boolean;
    error: string | null;
}

export const useLogin = (): UseLoginReturn => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (username: string, password: string) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ txtUser: username, txtPwd: password })
            });

            if (response.ok) {
                const data = await response.json();
                window.location.href = data.redirect;
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Nie udało się zalogować.');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return { handleLogin, isLoading, error };
};
