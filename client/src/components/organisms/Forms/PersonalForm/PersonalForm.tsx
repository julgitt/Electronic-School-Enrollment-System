import React from "react";

import { Button } from '../../../atoms/Button'
import { ErrorMessage } from "../../../atoms/ErrorMessage";
import { InputField } from "../../../atoms/InputField";

import styles from "../Form.module.scss";

interface PersonalFormProps {
    name: string;
    surname: string;
    pesel: string;
    error: string;
    onNameChange: (value: string) => void;
    onSurnameChange: (value: string) => void;
    onPeselChange: (value: string) => void;
    onSubmit: (event: React.FormEvent) => void;
}

const PersonalForm: React.FC<PersonalFormProps> = ({
    name,
    surname,
    pesel,
    error,
    onNameChange,
    onSurnameChange,
    onPeselChange,
    onSubmit,
}) => (
        <form method="POST" onSubmit={onSubmit}>
            <h1>Formularz osobowy</h1>
            {error && <ErrorMessage message={error}/>}
            <div className={styles.formInputGroup}>
                <InputField
                    type="text"
                    name="txtName"
                    autoFocus
                    placeholder="Imię"
                    required
                    value={name}
                    onChange={onNameChange}
                    />
                    <InputField
                        type="text"
                        name="txtSurname"
                        placeholder="Nazwisko"
                        required
                        value={surname}
                        onChange={onSurnameChange}
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
