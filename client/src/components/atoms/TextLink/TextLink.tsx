import React from 'react';
import styles from './TextLink.module.scss';

interface TextLinkProps {
    to: string;
    children: React.ReactNode;
}

const TextLink: React.FC<TextLinkProps> = ({ to, children }) => {
    return (
        <p className={styles.text}>
            <a href={to} className={styles.link}>{children}</a>
        </p>
    );
};

export default TextLink;
