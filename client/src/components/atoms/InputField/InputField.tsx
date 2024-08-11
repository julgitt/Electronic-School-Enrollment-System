import React from 'react';
import styles from './InputField.module.scss';

interface InputFieldProps {
    type: string;
    name?: string;
    placeholder: string;
    value: string;
    onChange: (value: string) => void;
    required?: boolean;
    pattern?: string;
    minLength?: number;
    title?: string;
}

const InputField: React.FC<InputFieldProps> = ({
    type,
    name,
    placeholder,
    value,
    onChange,
    required,
    pattern,
    minLength,
    title,
}) => {
    return (
        <div className={styles.inputGroup}>
            <input
                type={type}
                name={name}
                className={styles.input}
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                required={required}
                pattern={pattern}
                minLength={minLength}
                title={title}
            />
        </div>
    );
};

export default InputField;
