import React from 'react';
import {NavLink as Link} from "react-router-dom";

import styles from '../Header.module.scss';

const AdminMenu: React.FC<{ renderLogoutLink: () => JSX.Element }> = ({ renderLogoutLink }) => (
    <nav className={styles.nav}>
        <div className={styles.navMenu}>
            <Link className={styles.navLink} to="/enroll">Włącz nabór</Link>
            <Link className={styles.navLink} to="/editSchools">Edytuj Szkoły</Link>
            <Link className={styles.navLink} to="/editDeadlines">Edytuj Terminy</Link>
        </div>
        <div className={styles.navMenu}>
            {renderLogoutLink()}
        </div>
    </nav>
);

export default AdminMenu;
