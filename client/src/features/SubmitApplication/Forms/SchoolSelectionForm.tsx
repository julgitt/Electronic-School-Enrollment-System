import React from "react";

import { Button } from '../../../components/atomic/Button'
import { PlusButton } from '../../../components/atomic/PlusButton'
import { SuggestionBox } from '../../../components/composite/SuggestionBox';
import { ErrorMessage } from "../../../components/atomic/ErrorMessage";
import { School } from "../../../types/school.ts"

import styles from "../../../assets/css/forms.module.scss";

interface SchoolSelectionFormProps {
    schools: (number | null)[];
    error: string | null;
    loading: boolean;
    suggestions: School[];
    onSchoolChange: (schoolId: number, index: number) => void;
    onAddSchool: () => void;
    onPrev: (event: React.FormEvent) => void;
    onSubmit: (event: React.FormEvent) => void;
}

const SchoolSelectionForm: React.FC<SchoolSelectionFormProps> = ({
    schools,
    error,
    loading,
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
                    suggestions={suggestions.map(s => s.name)}
                    onSuggestionSelected={(selectedName) => {
                        const selectedSchool = suggestions.find(s => s.name === selectedName);
                        onSchoolChange(selectedSchool ? selectedSchool.id : -1, index);
                    }}
                />
            </div>
        ))}
        <PlusButton disabled={schools.length >= 5} onClick={onAddSchool} />
        <div className={styles.buttonGroup}>
            <Button type="button" onClick={onPrev} disabled={loading}>Cofnij</Button>
            <Button type="submit" disabled={loading}>Aplikuj</Button>
        </div>
    </form>
);

export default SchoolSelectionForm;
