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
                pattern="[a-zA-Z0-9ąęćłńóśźżĄĘĆŁŃÓŚŹŻ]+"
                minLength={3}
                title="Nazwa użytkownika może zawierać tylko litery oraz cyfry."
                required
            />
            <InputField
                type="email"
                name="txtEmail"
                placeholder="Email"
                value={formData.email}
                onChange={onInputChange("email")}
                title="Podaj adres email"
                required
            />
            <InputField
                type="password"
                name="txtPwd"
                placeholder="Hasło"
                value={formData.password}
                onChange={onInputChange("password")}
                pattern="[a-zA-Z0-9ąęćłńóśźżĄĘĆŁŃÓŚŹŻ.*[@$!%*?&]]+"
                minLength={8}
                title="Hasło może zawierać jedynie litery, cyfry oraz znaki: .*[@$!%*?&]"
                required
            />
            <InputField
                type="password"
                name="txtPwd_c"
                placeholder="Potwierdź hasło"
                value={formData.passwordConfirm}
                onChange={onInputChange("passwordConfirm")}
                title="Powtórz hasło"
                required
            />
        </div>
        <Button type="submit" disabled={loading}>Zarejestruj się</Button>
        <TextLink to="/login">Zaloguj się</TextLink>
    </form>
);

export default SignupForm;
