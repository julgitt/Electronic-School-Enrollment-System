import React, {useState} from 'react';

import styles from './Header.module.scss';
import {NavLink as Link} from "react-router-dom";
import {logout} from "../../../features/auth/services/authService.ts";
import {useError} from "../../../shared/providers/errorProvider.tsx";
import {useFetch} from "../../../shared/hooks/useFetch.ts";
import {User} from "../../../shared/types/user.ts";
import AdminNav from "../../composite/Navs/AdminNav.tsx";
import UserNav from "../../composite/Navs/UserNav.tsx";
import SchoolAdminNav from "../../composite/Navs/SchoolAdminNav.tsx";

const Header: React.FC = () => {
    const {setError} = useError();
    const {data, loading: userLoading} = useFetch<User>('api/user')
    const roles = data?.roles ?? [];
    const [logoutLoading, setLogoutLoading] = useState(false);

    if (userLoading) return <nav className={styles.nav}/>

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
