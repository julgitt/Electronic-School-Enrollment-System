import React from 'react';
import styles from './InputField.module.scss';

interface InputFieldProps {
    type: string;
    name?: string;
    placeholder: string;
    value: string | number;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    autoFocus?: boolean;
    required?: boolean;
    pattern?: string;
    minLength?: number;
    min?: number;
    title?: string;
    width?: string
}

const InputField: React.FC<InputFieldProps> = ({
    type,
    name,
    placeholder,
    value,
    onChange,
    autoFocus,
    required,
    pattern,
    minLength,
    min,
    title,
    width = "100%",
}) => {
    return (
        <input
            type={type}
            name={name}
            className={styles.input}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            required={required}
            autoFocus={autoFocus}
            pattern={pattern}
            minLength={minLength}
            min={min}
            title={title}
            style={{ width }}
        />
    );
};

export default InputField;
