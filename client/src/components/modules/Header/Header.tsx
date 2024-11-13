import React from 'react';

import { Navigation } from '../Navigation';
import styles from './Header.module.scss';

const Header: React.FC = () => {

    return (
        <header className={styles.header}>
            <Navigation/>
        </header>
    );
};

export default Header;
