import React from "react";

import styles from "./Checkbox.module.scss";

interface CheckboxProps {
    checked: boolean;
    onChange: () => void;
    itemName?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({
    checked,
    onChange,
    itemName,
}) => (
    <label className={styles.label}>
        <input
            type="checkbox"
            checked={checked}
            onChange={onChange}
            className={styles.checkbox}
        />
        {itemName && <h5 className={styles.checkboxItem}>{itemName}</h5>}
    </label>
);

export default Checkbox;
