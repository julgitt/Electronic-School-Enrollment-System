import React from "react";

import {InputField} from "../../../components/atomic/InputField";
import {Button} from "../../../components/atomic/Button";
import {ErrorMessage} from "../../../components/atomic/ErrorMessage";
import {TextLink} from "../../../components/atomic/TextLink";
import {LoginFormData} from "../types/loginFormData.ts";

import styles from "../../../assets/css/forms.module.scss";

interface LoginFormProps {
    formData: LoginFormData;
    onInputChange: (field: keyof LoginFormData) =>
        (event: React.ChangeEvent<HTMLInputElement>) => void;
    error?: string | null;
    loading?: boolean;
    onSubmit: (event: React.FormEvent) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({
                                                 formData,
                                                 onInputChange,
                                                 error,
                                                 loading,
                                                 onSubmit,
                                             }) => (
    <form method="POST" onSubmit={onSubmit} className={styles.form}>
        <h1>Logowanie</h1>
        {error && <ErrorMessage message={error}/>}
        <div className={styles.formInputGroup}>
            <InputField
                type="text"
                placeholder="Email"
                value={formData.username}
                onChange={onInputChange("username")}
                required
            />
            <InputField
                type="password"
                placeholder="Hasło"
                value={formData.password}
                onChange={onInputChange("password")}
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
