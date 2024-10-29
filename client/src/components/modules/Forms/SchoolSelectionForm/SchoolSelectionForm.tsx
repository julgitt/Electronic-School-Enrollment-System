import React from "react";

import { Button } from '../../../atomic/Button'
import { PlusButton } from '../../../atomic/PlusButton'
import { SuggestionBox } from '../../../composite/SuggestionBox';
import { ErrorMessage } from "../../../atomic/ErrorMessage";

import styles from "../Form.module.scss";

//TODO: redundant interface
interface School {
    id: number;
    name: string;
}

interface SchoolSelectionFormProps {
    schools: (number | null)[];
    error: string | null;
    suggestions: School[];
    onSchoolChange: (schoolId: number, index: number) => void;
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
            <Button type="button" onClick={onPrev}>Cofnij</Button>
            <Button type="submit">Aplikuj</Button>
        </div>
    </form>
);

export default SchoolSelectionForm;
