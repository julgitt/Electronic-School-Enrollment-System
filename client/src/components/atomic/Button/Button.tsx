import React from 'react';
import styles from './Button.module.scss';

interface ButtonProps {
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
    onClick?: (event: React.FormEvent) => void;
    children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ type = 'button', onClick, children, disabled = false }) => {
    return (
        <button type={type} onClick={onClick} className={styles.button} disabled={disabled}>
            {children}
        </button>
    );
};

export default Button;