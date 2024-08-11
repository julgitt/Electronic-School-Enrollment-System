import { useEffect, useState } from 'react';

interface User {
    username: string;
}

const useFetchUser = () => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch('/api/user', { credentials: 'include' });
                if (response.ok) {
                    const userData = await response.json();
                    setUser(userData);
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error('Error fetching user:', error);
            }
        };

        fetchUser();
    }, []);

    return user;
};

export default useFetchUser;
