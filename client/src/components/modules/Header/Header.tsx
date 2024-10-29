import React from 'react'

import { Navigation } from '../Navigation'
import styles from './Header.module.scss'
import { useFetch } from "../../../hooks/useFetch.ts";
import useLogout from "../../../hooks/useLogout.ts";

interface User {
    username: string;
}

const Header: React.FC = () => {
    const { data: user, loading } = useFetch<User>('/api/user');
    const handleLogout = useLogout();

    if (loading) {
        return <div>Loading...</div>;
    }


    return (
        <header className={styles.header}>
            <Navigation user={user} onLogout={handleLogout} />
        </header>
    );
};

export default Header;
