import React from "react";

import { Button } from '../../../components/atomic/Button'
import { ErrorMessage } from "../../../components/atomic/ErrorMessage";
import { InputField } from "../../../components/atomic/InputField";

import styles from "../../../assets/css/forms.module.scss";

interface PersonalFormProps {
    firstName: string;
    lastName: string;
    pesel: string;
    error?: string | null;
    loading?: boolean,
    onFirstNameChange: (value: string) => void;
    onLastNameChange: (value: string) => void;
    onPeselChange: (value: string) => void;
    onSubmit: (event: React.FormEvent) => void;
}

const PersonalForm: React.FC<PersonalFormProps> = ({
    firstName,
    lastName,
    pesel,
    error,
    loading,
    onFirstNameChange,
    onLastNameChange,
    onPeselChange,
    onSubmit,
}) => (
    <form method="POST" onSubmit={onSubmit}>
        <h1>Formularz osobowy</h1>
        {error && <ErrorMessage message={error}/>}
        <div className={styles.formInputGroup}>
            <InputField
                type="text"
                autoFocus
                placeholder="Imię"
                value={firstName}
                onChange={onFirstNameChange}
                required
            />
            <InputField
                type="text"
                placeholder="Nazwisko"
                value={lastName}
                onChange={onLastNameChange}
                required
            />
            <InputField
                type="text"
                placeholder="Pesel"
                value={pesel}
                onChange={onPeselChange}
                required
            />
        </div>
        <Button type="submit" disabled={loading}>Dalej</Button>
    </form>
);

export default PersonalForm;
