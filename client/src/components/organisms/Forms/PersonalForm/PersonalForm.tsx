import React from "react";

import { Button } from '../../../atoms/Button'
import { ErrorMessage } from "../../../atoms/ErrorMessage";
import { InputField } from "../../../atoms/InputField";

import styles from "../Form.module.scss";

interface PersonalFormProps {
    firstName: string;
    lastName: string;
    pesel: string;
    error: string;
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
                    name="txtFirstName"
                    autoFocus
                    placeholder="Imię"
                    required
                    value={firstName}
                    onChange={onFirstNameChange}
                    />
                    <InputField
                        type="text"
                        name="txtLastName"
                        placeholder="Nazwisko"
                        required
                        value={lastName}
                        onChange={onLastNameChange}
                    />
                    <InputField
                        type="text"
                        name="txtPesel"
                        placeholder="Pesel"
                        required
                        value={pesel}
                        onChange={onPeselChange}
                    />
                </div>
                <Button type="submit">Dalej</Button>
            </form>
);

export default PersonalForm;
