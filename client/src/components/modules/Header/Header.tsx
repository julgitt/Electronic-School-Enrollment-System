import React, {useState} from 'react';

import styles from './Header.module.scss';
import {NavLink as Link} from "react-router-dom";
import {logout} from "../../../shared/services/authService.ts";
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

    const toggleTheme= () => {
        const currentTheme = document.documentElement.getAttribute("data-bs-theme");
        let newTheme;
        switch(currentTheme) {
            case "light":
                newTheme =  "dark";
                break;
            case "dark":
                newTheme = "high-contrast";
                break;
            default:
                newTheme = "light"
        }
        document.documentElement.setAttribute("data-bs-theme", newTheme);
    }

    const renderNav = () => {
        if (roles.includes('admin')) return <AdminNav renderLogoutLink={renderLogoutLink}/>;
        if (roles.includes('user')) return <UserNav renderLogoutLink={renderLogoutLink}/>;
        if (roles.includes('schoolAdmin')) return <SchoolAdminNav renderLogoutLink={renderLogoutLink}/>;

        return (
            <nav className="navbar navbar-expand-lg">
                <div className="container-fluid">
                    <a className="navbar-brand" href="/">System naboru do szkół</a>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse"
                            data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false"
                            aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarNav">
                        <ul className="navbar-nav ms-auto">
                            <li className="nav-item">
                                <Link className="nav-link" to="/dates">Terminy</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/educationalOffer">Oferta</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/login">Zaloguj się</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/signup">Zarejestruj się</Link>
                            </li>
                        </ul>
                        <button onClick={toggleTheme}>Motyw</button>
                    </div>
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
