import React from "react";

import { Button } from '../../../atoms/Button'
import { PlusButton } from '../../../atoms/PlusButton'
import SuggestionBox from '../../../molecules/SuggestionBox/SuggestionBox';
import { ErrorMessage } from "../../../atoms/ErrorMessage";

import styles from "../Form.module.scss";

interface SchoolSelectionFormProps {
    schools: string[];
    error: string;
    suggestions: string[];
    onSchoolChange: (suggestion: string, index: number) => void;
    onAddSchool: () => void;
    onPrev: (event: React.FormEvent) => void;
    onSubmit: (event: React.FormEvent) => void;
}

const SchoolSelectionForm: React.FC<SchoolSelectionFormProps> = ({
     schools,
     error,
     suggestions,
     onSchoolChange,
     onAddSchool,
     onPrev,
     onSubmit,
 }) => (
    <form method="POST" onSubmit={onSubmit} className={styles.form}>
        <h1>Wybór szkół</h1>
        {error && <ErrorMessage message={error} />}
        {schools.map((_school, index) => (
            <div key={index} className={styles.suggestionBox}>
                <SuggestionBox
                    placeholder="Szkoła"
                    suggestions={suggestions}
                    onSuggestionSelected={(suggestion) => onSchoolChange(suggestion, index)}
                />
            </div>
        ))}
        <PlusButton disabled={schools.length >= 5} onClick={onAddSchool} />
        <div className={styles.buttonGroup}>
            <Button type="button" onClick={onPrev}>Cofnij</Button>
            <Button type="submit">Aplikuj</Button>
        </div>
    </form>
);

export default SchoolSelectionForm;
