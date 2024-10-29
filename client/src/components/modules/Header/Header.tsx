import React from 'react'

import { Navigation } from '../Navigation'
import styles from './Header.module.scss'
import { useFetch } from "../../../hooks/useFetch.ts";

interface User {
    username: string;
}

const Header: React.FC = () => {
    const { data: user, loading, error: _fetchError } = useFetch<User>('/api/user');

    if (loading) {
        return <div>Loading...</div>;
    }

    const handleLogout = async (event: React.MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
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
    };

    return (
        <header className={styles.header}>
            <Navigation user={user} onLogout={handleLogout} />
        </header>
    );
};

export default Header;
