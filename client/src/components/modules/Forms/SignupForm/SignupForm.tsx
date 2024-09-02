import React, { useState } from 'react';

import { InputField } from '../../../atomic/InputField';
import { ErrorMessage } from '../../../atomic/ErrorMessage';
import { Button } from '../../../atomic/Button';
import { TextLink } from "../../../atomic/TextLink";

import styles from '../Form.module.scss';

const SignupForm: React.FC = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [error, setError] = useState('');

    const handleSignup = async (event: React.FormEvent) => {
        event.preventDefault();
        setError('');

        try {
            const response = await fetch('/api/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    txtUser: username,
                    txtEmail: email,
                    txtFirstName: firstName,
                    txtLastName: lastName,
                    txtPwd: password,
                    txtPwd_c: passwordConfirm,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Signup successful:', data);
                window.location.href = data.redirect;
            } else {
                const errorData = await response.json();
                console.log('Signup unsuccessful:', errorData);
                setError(errorData.message || 'An error occurred during signup.');
            }
        } catch (error) {
            console.error('Network error:', error);
            setError('A network error occurred. Please try again later.');
        }
    };

    return (
        <form onSubmit={handleSignup} className={styles.form}>
            <h1>Rejestracja</h1>
            {error && <ErrorMessage message={error}/>}
            <div className={styles.formInputGroup}>
                <InputField
                    type="text"
                    name="txtUser"
                    placeholder="Nazwa użytkownika"
                    value={username}
                    onChange={setUsername}
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
                    onChange={setEmail}
                    required
                />
                <InputField
                    type="text"
                    name="txtFirstName"
                    placeholder="Imię"
                    value={firstName}
                    onChange={setFirstName}
                    required
                />
                <InputField
                    type="text"
                    name="txtLastName"
                    placeholder="Nazwisko"
                    value={lastName}
                    onChange={setLastName}
                    required
                />
                <InputField
                    type="password"
                    name="txtPwd"
                    placeholder="Hasło"
                    value={password}
                    onChange={setPassword}
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
                    onChange={setPasswordConfirm}
                    required
                />
            </div>
                <Button type="submit">Zarejestruj się</Button>
                <TextLink to="/signin">Zaloguj się</TextLink>
        </form>
);
};

export default SignupForm;
