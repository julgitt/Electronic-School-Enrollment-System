import React from 'react';

import { InputField } from '../../../components/atomic/InputField';
import { ErrorMessage } from '../../../components/atomic/ErrorMessage';
import { Button } from '../../../components/atomic/Button';
import { TextLink } from "../../../components/atomic/TextLink";

import styles from '../../../assets/css/forms.module.scss';

interface SignupFormProps {
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    passwordConfirm: string;
    onUsernameChange: (value: string) => void;
    onEmailChange: (value: string) => void;
    onFirstNameChange: (value: string) => void;
    onLastNameChange: (value: string) => void;
    onPasswordChange: (value: string) => void;
    onPasswordConfirmChange: (value: string) => void;
    error?: string | null;
    loading?: boolean;
    onSubmit: (event: React.FormEvent) => void;
}

const SignupForm: React.FC<SignupFormProps> = ({
    username,
    email,
    firstName,
    lastName,
    password,
    passwordConfirm,
    onUsernameChange,
    onEmailChange,
    onFirstNameChange,
    onLastNameChange,
    onPasswordChange,
    onPasswordConfirmChange,
    error,
    loading,
    onSubmit,
}) => (
    <form method="POST" onSubmit={onSubmit} className={styles.form}>
        <h1>Rejestracja</h1>
        {error && <ErrorMessage message={error}/>}
        <div className={styles.formInputGroup}>
            <InputField
                type="text"
                name="txtUser"
                placeholder="Nazwa użytkownika"
                value={username}
                onChange={onUsernameChange}
                required
                pattern="[a-zA-Z0-9]+"
                minLength={5}
                title="Nazwa użytkownika może zawierać tylko litery oraz cyfry"
            />
            <InputField
                type="email"
                name="txtEmail"
                placeholder="Email"
                value={email}
                onChange={onEmailChange}
                required
            />
            <InputField
                type="text"
                name="txtFirstName"
                placeholder="Imię"
                value={firstName}
                onChange={onFirstNameChange}
                required
            />
            <InputField
                type="text"
                name="txtLastName"
                placeholder="Nazwisko"
                value={lastName}
                onChange={onLastNameChange}
                required
            />
            <InputField
                type="password"
                name="txtPwd"
                placeholder="Hasło"
                value={password}
                onChange={onPasswordChange}
                required
                pattern="[a-zA-Z0-9!@#$%^&*_=+-]+"
                minLength={8}
                title="Hasło może zawierać jedynie litery, cyfry oraz znaki: !@#$%^&*_=+-"
            />
            <InputField
                type="password"
                name="txtPwd_c"
                placeholder="Potwierdź hasło"
                value={passwordConfirm}
                onChange={onPasswordConfirmChange}
                required
            />
        </div>
        <Button type="submit" disabled={loading}>Zarejestruj się</Button>
        <TextLink to="/signin">Zaloguj się</TextLink>
    </form>
);

export default SignupForm;
