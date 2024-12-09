import React from 'react';

import {InputField} from '../../../components/atomic/InputField';
import {ErrorMessage} from '../../../components/atomic/ErrorMessage';
import {Button} from '../../../components/atomic/Button';
import {TextLink} from "../../../components/atomic/TextLink";
import {SignupFormData} from "../types/signUpFormData.ts";

import styles from '../../../assets/css/forms.module.scss';

interface SignupFormProps {
    formData: SignupFormData;
    onInputChange: (field: keyof SignupFormData) =>
        (event: React.ChangeEvent<HTMLInputElement>) => void;
    error?: string | null;
    loading?: boolean;
    onSubmit: (event: React.FormEvent) => void;
}

const SignupForm: React.FC<SignupFormProps> = ({
                                                   formData,
                                                   onInputChange,
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
                value={formData.username}
                onChange={onInputChange('username')}
                required
                pattern="[a-zA-Z0-9]+"
                minLength={5}
                title="Nazwa użytkownika może zawierać tylko litery oraz cyfry"
            />
            <InputField
                type="email"
                name="txtEmail"
                placeholder="Email"
                value={formData.email}
                onChange={onInputChange("email")}
                required
            />
            <InputField
                type="password"
                name="txtPwd"
                placeholder="Hasło"
                value={formData.password}
                onChange={onInputChange("password")}
                required
                pattern="[a-zA-Z0-9.*[@$!%*?&]]+"
                minLength={8}
                title="Hasło może zawierać jedynie litery, cyfry oraz znaki: .*[@$!%*?&]"
            />
            <InputField
                type="password"
                name="txtPwd_c"
                placeholder="Potwierdź hasło"
                value={formData.passwordConfirm}
                onChange={onInputChange("passwordConfirm")}
                required
            />
        </div>
        <Button type="submit" disabled={loading}>Zarejestruj się</Button>
        <TextLink to="/signin">Zaloguj się</TextLink>
    </form>
);

export default SignupForm;
