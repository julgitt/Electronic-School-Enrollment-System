import React from 'react';
import { NavLink as Link } from 'react-router-dom';

import styles from './Navigation.module.scss';

interface NavigationProps {
    user: { username: string } | null;
    onLogout: (event: React.MouseEvent<HTMLAnchorElement>) => void;
}

const Navigation: React.FC<NavigationProps> = ({ user, onLogout }) => {
    return (
        <nav className={styles.nav}>
            <div className={styles.navMenu}>
                <Link className={styles.navLink} to="/">System naboru do szkół</Link>
                <Link className={styles.navLink} to="/dates">Terminy</Link>
                {user && <Link className={styles.navLink} to="/apply">Złóż kandydaturę</Link>}
            </div>
            {user ? (
                <div className={styles.navMenu}>
                    <Link className={styles.navLink} to="/">{user.username}</Link>
                    <Link className={styles.navLink} to="/applicationStatus">Status Aplikacji</Link>
                    <Link className={styles.navLink} to="/logout" onClick={onLogout}>Wyloguj</Link>
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
