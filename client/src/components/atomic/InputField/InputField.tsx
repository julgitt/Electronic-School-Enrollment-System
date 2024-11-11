import React from 'react';
import styles from './InputField.module.scss';

interface InputFieldProps {
    type: string;
    name?: string;
    placeholder: string;
    value: string;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    autoFocus?: boolean;
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
    autoFocus,
    required,
    pattern,
    minLength,
    title,
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
            title={title}
        />
    );
};

export default InputField;
