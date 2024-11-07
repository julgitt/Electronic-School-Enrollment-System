import React, {useState} from 'react';
import { Navigation } from '../Navigation';
import { useFetch } from "../../../hooks/useFetch";
import LoadingPage from "../../../app/routes/LoadingPage.tsx";
import { User } from "../../../types/user.ts"

import styles from './Header.module.scss';
import ErrorPage from "../../../app/routes/ErrorPage.tsx";
import {logout} from "../../../features/auth/authService.ts";

const Header: React.FC = () => {
    const { data: user, loading: userLoading } = useFetch<User>('/api/user');
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
