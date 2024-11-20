import React from "react";

import { Button } from '../../../components/atomic/Button'
import { PlusButton } from '../../../components/atomic/PlusButton'
import { SuggestionBox } from '../../../components/composite/SuggestionBox';
import { ErrorMessage } from "../../../components/atomic/ErrorMessage";
import { School } from "../../../shared/types/school.ts"
import { SchoolSelection } from "../types/schoolSelection.ts"
import { Profile } from "../../../shared/types/profile.ts";


import styles from "../../../assets/css/forms.module.scss";
import {InputField} from "../../../components/atomic/InputField";

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
        {error && <ErrorMessage message={error} />}

        {selections.map((selection, index) => (
            <div key={index}>
                <SuggestionBox
                    placeholder="Szkoła"
                    suggestions={suggestions
                        .filter((school) =>
                            !selections.some((selection) =>
                                selection.school && selection.school.id === school.id))
                        .map(s => s.name)}
                    defaultValue={selection.school ? selection.school.name : ''}
                    onSuggestionSelected={(selectedName) => {
                        const selectedSchool = suggestions.find(s => s.name === selectedName) || null;
                        if (!selection.school || !selectedSchool || selectedSchool.name !== selection.school.name) {
                            onSchoolChange(
                                selectedSchool,
                                index
                            )
                        }
                    }}
                />
                {selection.school && selection.school.profiles && selection.school.profiles.length > 0 && (
                    <div className={styles.profilesSection}>
                        {selection.school.profiles.map((profile) => {
                            const selectedProfile = selection.profiles.find(
                                (p) => p.profileId === profile.id
                            )

                            return (
                                <div key={profile.id} className={styles.profilesSectionElement}>
                                    <label className={styles.profileLabel}>
                                        {/*TODO: Zrób osobny komponent z tego*/}
                                        <input
                                            type="checkbox"
                                            checked={!!selectedProfile}
                                            onChange={() => onProfileChange(profile, index)}
                                            className={styles.checkbox}
                                        />
                                        <h5 className={styles.profileName}>{profile.name}</h5>
                                    </label>
                                    {selectedProfile && (
                                        <InputField
                                            type="number"
                                            min={1}
                                            value={selectedProfile.priority}
                                            onChange={(e) =>
                                                onPriorityChange(profile.id, index, Number(e.target.value))
                                            }
                                            placeholder="0"
                                            width="75px"
                                            height="20px"
                                        />
                                    )}
                                </div>
                            )
                        })}

                    </div>
                )}
            </div>
        ))}
        <PlusButton disabled={selections.length >= 5} onClick={onAddSchool}/>
        <div className={styles.buttonGroup}>
            <Button type="button" onClick={onPrev} disabled={loading}>Cofnij</Button>
            <Button type="submit" disabled={loading}>Zapisz</Button>
        </div>
    </form>
)

export default SelectionForm;
