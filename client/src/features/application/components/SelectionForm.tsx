import React from "react";

import {Button} from '../../../components/atomic/Button'
import {PlusButton} from '../../../components/atomic/QuantityButton'
import {ErrorMessage} from "../../../components/atomic/ErrorMessage";
import {SchoolWithProfiles} from "../../../shared/types/schoolWithProfiles.ts"
import {ProfilesSelection} from "../types/profilesSelection.ts"
import {Profile} from "../../../shared/types/profile.ts";
import {SCHOOL_MAX} from "../../../../../adminConstants.ts";

import styles from "../../../assets/css/forms.module.scss";
import SchoolSelectionItem from "./SchoolSelectionItem.tsx";
import {SuccessMessage} from "../../../components/atomic/SuccessMessage";

interface SchoolSelectionFormProps {
    selections: ProfilesSelection[];
    suggestions: SchoolWithProfiles[];
    error: string | null;
    loading: boolean;
    onSchoolChange: (school: SchoolWithProfiles | null, index: number) => void;
    onProfileChange: (profile: Profile, index: number) => void;
    onPriorityChange: (profileId: number, index: number, priority: number) => void;
    onAddSchool: () => void;
    onSubmit: (event: React.FormEvent) => void;
    successMessage: string | null;
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
                                                               onSubmit,
                                                               successMessage
                                                           }) => (
    <form method="POST" onSubmit={onSubmit} className={styles.form}>
        <h2>Wybór szkół</h2>
        {error && <ErrorMessage message={error}/>}

        <div className={styles.mainFormInputGroup}>
            {selections.map((selection, index) => (
                <div key={index}>
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
                </div>
            ))}
        </div>
        <div>
            <PlusButton
                disabled={selections.length >= SCHOOL_MAX}
                onClick={onAddSchool}
            />
            <Button type="submit" disabled={loading}>Zapisz</Button>
            {successMessage && (<SuccessMessage message={successMessage}/>)}
        </div>
    </form>
)

export default SelectionForm;
