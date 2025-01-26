import React, {useState} from 'react';

import styles from './Header.module.scss';
import {NavLink as Link} from "react-router-dom";
import {logout} from "../../../shared/services/authService.ts";
import {useError} from "../../../shared/providers/errorProvider.tsx";
import AdminNav from "../../composite/Navs/AdminNav.tsx";
import UserNav from "../../composite/Navs/UserNav.tsx";
import SchoolAdminNav from "../../composite/Navs/SchoolAdminNav.tsx";
import {useUser} from "../../../shared/providers/userProvider.tsx";

const Header: React.FC = () => {
    const {setError} = useError();
    const {roles, loading} = useUser()
    const [logoutLoading, setLogoutLoading] = useState(false);

    if (loading) return <nav className={styles.nav}/>

    const handleLogout = async (event: React.MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        setLogoutLoading(true);
        try {
            await logout();
            window.location.href = '/';
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLogoutLoading(false);
        }
    };

    const renderLogoutLink = () => (
        <Link
            className={styles.navLink}
            to="#"
            onClick={(e) => {
                e.preventDefault();
                if (!logoutLoading) handleLogout(e);
            }}
        >
            {logoutLoading ? 'Wylogowywanie...' : 'Wyloguj'}
        </Link>
    );

    const renderNav = () => {
        if (roles.includes('admin')) return <AdminNav renderLogoutLink={renderLogoutLink}/>;
        if (roles.includes('user')) return <UserNav renderLogoutLink={renderLogoutLink}/>;
        if (roles.includes('schoolAdmin')) return <SchoolAdminNav renderLogoutLink={renderLogoutLink}/>;

        return (
            <nav className={styles.nav}>
                <div className={styles.navMenu}>
                    <Link className={styles.navLink} to="/">System naboru do szkół</Link>
                    <Link className={styles.navLink} to="/dates">Terminy</Link>
                    <Link className={styles.navLink} to="/educationalOffer">Oferta</Link>
                </div>
                <div className={styles.navMenu}>
                    <Link className={styles.navLink} to="/login">Zaloguj się</Link>
                    <Link className={styles.navLink} to="/signup">Zarejestruj się</Link>
                </div>
            </nav>
        );
    };

    return (
        <header className={styles.header}>
            {renderNav()}
        </header>
    );
};

export default Header;
