import React from "react";
import styles from './PlusButton.module.scss';

interface PlusButtonProps {
    onClick?: () => void;
    disabled?: boolean
}

const PlusButton: React.FC<PlusButtonProps> = ({onClick}) => {
    return (
        <button type="button" onClick={onClick} className={styles.secondaryButton}>
            +
        </button>
    );
};

export default PlusButton;