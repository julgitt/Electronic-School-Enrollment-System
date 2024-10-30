import React from 'react';
import { Navigation } from '../Navigation';
import styles from './Header.module.scss';
import { useFetch } from "../../../hooks/useFetch";
import useLogout from "../../../hooks/useLogout";

interface User {
    username: string;
}

const Header: React.FC = () => {
    const { data: user, loading: userLoading } = useFetch<User>('/api/user');
    const { handleLogout, loading: logoutLoading, error: logoutError } = useLogout();

    if (userLoading) {
        return <div>Loading...</div>;
    }

    return (
        <header className={styles.header}>
            <Navigation user={user} onLogout={handleLogout} logoutLoading={logoutLoading} />
            {logoutError && <div className={styles.error}>Błąd wylogowywania: {logoutError}</div>}
        </header>
    );
};

export default Header;
