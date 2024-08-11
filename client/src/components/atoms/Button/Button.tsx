import React from 'react';
import styles from './Button.module.scss';

interface ButtonProps {
    type?: 'button' | 'submit' | 'reset';
    onClick?: (event: React.FormEvent) => void;
    children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ type = 'button', onClick, children }) => {
    return (
        <button type={type} onClick={onClick} className={styles.button}>
            {children}
        </button>
    );
};

export default Button;