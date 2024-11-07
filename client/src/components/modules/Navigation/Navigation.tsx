import React from 'react';
import { NavLink as Link } from 'react-router-dom';

import styles from './Navigation.module.scss';
import { User } from "../../../types/user.ts";

interface NavigationProps {
    user: User | null;
    onLogout: (event: React.MouseEvent<HTMLAnchorElement>) => void;
    logoutLoading?: boolean;
}

const Navigation: React.FC<NavigationProps> = ({ user, onLogout, logoutLoading }) => {
    return (
        <nav className={styles.nav}>
            <div className={styles.navMenu}>
                <Link className={styles.navLink} to="/">System naboru do szkół</Link>
                <Link className={styles.navLink} to="/dates">Terminy</Link>
                {user && user.userToken && <Link className={styles.navLink} to="/submitApplication">Złóż kandydaturę</Link>}
            </div>
            {user && user.userToken ? (
                <div className={styles.navMenu}>
                    <Link className={styles.navLink} to="/">{user.username}</Link>
                    <Link className={styles.navLink} to="/applicationStatus">Status Aplikacji</Link>
                    <Link
                        className={styles.navLink}
                        to="#"
                        onClick={(e) => {
                            e.preventDefault();
                            if (!logoutLoading) onLogout(e);
                        }}
                    >
                        {logoutLoading ? 'Wylogowywanie...' : 'Wyloguj'}
                    </Link>
                </div>
            ) : (
                <div className={styles.navMenu}>
                    <Link className={styles.navLink} to="/login">Zaloguj się</Link>
                    <Link className={styles.navLink} to="/signup">Zarejestruj się</Link>
                </div>
            )}
        </nav>
    );
};

export default Navigation;
