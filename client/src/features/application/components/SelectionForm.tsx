import React from "react";

import {Button} from '../../../components/atomic/Button'
import {PlusButton} from '../../../components/atomic/QuantityButton'
import {ErrorMessage} from "../../../components/atomic/ErrorMessage";
import {School} from "../../../shared/types/school.ts"
import {SchoolSelection} from "../types/schoolSelection.ts"
import {Profile} from "../../../shared/types/profile.ts";


import styles from "../../../assets/css/forms.module.scss";
import SchoolSelectionItem from "./SchoolSelectionItem.tsx";

interface SchoolSelectionFormProps {
    selections: SchoolSelection[];
    suggestions: School[];
    error: string | null;
    loading: boolean;
    onSchoolChange: (school: School | null, index: number) => void;
    onProfileChange: (profile: Profile, index: number) => void;
    onPriorityChange: (profileId: number, index: number, priority: number) => void;
    onAddSchool: () => void;
    onPrev: (event: React.FormEvent) => void;
    onSubmit: (event: React.FormEvent) => void;
}

const SelectionForm: React.FC<SchoolSelectionFormProps> = ({
                                                               selections,
                                                               suggestions,
                                                               error,
                                                               loading,
                                                               onSchoolChange,
                                                               onProfileChange,
                                                               onPriorityChange,
                                                               onAddSchool,
                                                               onPrev,
                                                               onSubmit,
                                                           }) => (
    <form method="POST" onSubmit={onSubmit} className={styles.form}>
        <h2>Wybór szkół</h2>
        {error && <ErrorMessage message={error}/>}

        {selections.map((selection, index) => (
            <SchoolSelectionItem
                key={selection.school?.id || index}
                selection={selection}
                suggestions={suggestions}
                index={index}
                onSchoolChange={onSchoolChange}
                onProfileChange={onProfileChange}
                onPriorityChange={onPriorityChange}
                selections={selections}
            />
        ))}
        <PlusButton
            disabled={selections.length >= 5}
            onClick={onAddSchool}/>
        <div>
            <Button type="button" onClick={onPrev} disabled={loading}>Cofnij</Button>
            <Button type="submit" disabled={loading}>Zapisz</Button>
        </div>
    </form>
)

export default SelectionForm;
