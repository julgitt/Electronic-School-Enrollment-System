import React from "react";
import styles from './QuantityButton.module.scss';

interface PlusButtonProps {
    onClick?: () => void;
    disabled?: boolean
}

export const PlusButton: React.FC<PlusButtonProps> = ({onClick}) => {
    return (
        <button type="button" onClick={onClick} className={styles.secondaryButton}>
            +
        </button>
    );
};


export const MinusButton: React.FC<PlusButtonProps> = ({onClick}) => {
    return (
        <button type="button" onClick={onClick} className={styles.secondaryButton}>
            -
        </button>
    );
};