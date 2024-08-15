import React, { useState } from 'react';
import {  InputField } from '../../../atoms/InputField';
import { Button } from '../../../atoms/Button';
import { ErrorMessage } from '../../../atoms/ErrorMessage';
import { TextLink } from '../../../atoms/TextLink';

import styles from '../Form.module.scss'

interface LoginFormProps {
    onLogin: (username: string, password: string) => Promise<void>;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (event: React.FormEvent) => {
        event.preventDefault();
        setError('');
        try {
            await onLogin(username, password);
        } catch (error: any) {
            setError(error.message);
        }
    };

    return (
        <form method="POST" onSubmit={handleLogin} className={styles.form}>
            <h1>Logowanie</h1>
            {error && <ErrorMessage message={error}/>}
            <div className={styles.formInputGroup}>
                <InputField
                    type="text"
                    placeholder="Email"
                    value={username}
                    onChange={setUsername}
                    required
                />
                <InputField
                    type="password"
                    placeholder="Hasło"
                    value={password}
                    onChange={setPassword}
                    required
                />
            </div>
            <Button type="submit">Zaloguj</Button>
            <TextLink to="#">Przypomnij hasło</TextLink>
            <TextLink to="/signup">Załóż konto</TextLink>
        </form>
    );
};

export default LoginForm;
