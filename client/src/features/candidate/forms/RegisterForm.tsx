import React from "react";

import {InputField} from "../../../components/atomic/InputField";
import {Button} from "../../../components/atomic/Button";
import {ErrorMessage} from "../../../components/atomic/ErrorMessage";
import {Candidate} from "../../../shared/types/candidate.ts";

import styles from "../../../assets/css/forms.module.scss";

interface RegisterFormProps {
    formData: Candidate;
    onInputChange: (field: keyof Candidate) =>
        (event: React.ChangeEvent<HTMLInputElement>) => void;
    error?: string | null;
    loading?: boolean;
    onSubmit: (event: React.FormEvent) => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({
                                                       formData,
                                                       onInputChange,
                                                       error,
                                                       loading,
                                                       onSubmit,
                                                   }) => (
    <form method="POST" onSubmit={onSubmit} className={styles.form}>
        <h2>Rejestracja kandydata</h2>
        {error && <ErrorMessage message={error}/>}
        <div className={styles.formInputGroup}>
            <InputField
                type="text"
                placeholder="Imię"
                value={formData.firstName}
                onChange={onInputChange("firstName")}
                pattern="[a-zA-Z]+"
                title="Podaj imię."
                required
            />
            <InputField
                type="text"
                placeholder="Nazwisko"
                value={formData.lastName}
                onChange={onInputChange("lastName")}
                pattern="[a-zA-Z]+"
                title="Podaj nazwisko."
                required
            />
            <InputField
                type="text"
                placeholder="Pesel"
                pattern="[0-9]{11}"
                value={formData.pesel}
                onChange={onInputChange("pesel")}
                required
            />
        </div>
        <Button type="submit" disabled={loading}>
            {loading ? "Rejestracja..." : "Zarejestruj kandydata"}
        </Button>
    </form>
);

export default RegisterForm;
