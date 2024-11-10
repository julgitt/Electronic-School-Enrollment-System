import React, { useState } from 'react';

import { useFetch } from "../../../hooks/useFetch";
import { UserCookie } from "../../../types/userCookie.ts"

import LoadingPage from "../../../app/routes/LoadingPage.tsx";
import ErrorPage from "../../../app/routes/ErrorPage.tsx";

import { logout } from "../../../features/auth/authService.ts";

import { Navigation } from '../Navigation';
import styles from './Header.module.scss';

const Header: React.FC = () => {
    const { data: user, loading: userLoading } = useFetch<UserCookie>('/api/user');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogout = async () => {
        setLoading(true);
        setError(null);

        try {
            await logout();
            window.location.href = '/';
            window.location.reload();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (userLoading) {
        return <LoadingPage/>;
    }
    if (error) {
       return <ErrorPage errorMessage={error}/>;
    }

    return (
        <header className={styles.header}>
            <Navigation user={user} onLogout={handleLogout} logoutLoading={loading}/>
        </header>
    );
};

export default Header;
