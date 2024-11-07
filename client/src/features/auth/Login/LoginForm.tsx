import React from "react";

import { InputField } from "../../../components/atomic/InputField";
import { Button } from "../../../components/atomic/Button";
import { ErrorMessage } from "../../../components/atomic/ErrorMessage";
import { TextLink } from "../../../components/atomic/TextLink";

import styles from "../../../assets/css/forms.module.scss";

interface LoginFormProps {
    username: string;
    password: string;
    error?: string | null;
    loading?: boolean;
    onUsernameChange: (value: string) => void;
    onPasswordChange: (value: string) => void;
    onSubmit: (event: React.FormEvent) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({
     username,
     password,
     error,
     loading,
     onUsernameChange,
     onPasswordChange,
     onSubmit,
}) => (
    <form method="POST" onSubmit={onSubmit} className={styles.form}>
        <h1>Logowanie</h1>
        {error && <ErrorMessage message={error} />}
        <div className={styles.formInputGroup}>
            <InputField
                type="text"
                placeholder="Email"
                value={username}
                onChange={onUsernameChange}
                required
            />
            <InputField
                type="password"
                placeholder="Hasło"
                value={password}
                onChange={onPasswordChange}
                required
            />
        </div>
        <Button type="submit" disabled={loading}>
            {loading ? "Logowanie..." : "Zaloguj"}
        </Button>
        <TextLink to="#">Przypomnij hasło</TextLink>
        <TextLink to="/signup">Załóż konto</TextLink>
    </form>
);

export default LoginForm;
