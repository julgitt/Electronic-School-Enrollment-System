import React from 'react';
import styles from './Footer.module.scss';

const Footer: React.FC = () => {
    return (
        <footer className={styles.footer}>
            <div className={styles.footerContainer}>
                <p>Kontakt: info@nabor.pl</p>
                <p>Telefon: 123-456-789</p>
            </div>
        </footer>
    );
}

export default Footer;
