import React from "react";

import { Button } from '../../../components/atomic/Button'
import { PlusButton } from '../../../components/atomic/PlusButton'
import { SuggestionBox } from '../../../components/composite/SuggestionBox';
import { ErrorMessage } from "../../../components/atomic/ErrorMessage";
import { School } from "../../../shared/types/school.ts"
import { Selection } from "../types/selection.ts"
import { Profile } from "../../../shared/types/profile.ts";


import styles from "../../../assets/css/forms.module.scss";
import {InputField} from "../../../components/atomic/InputField";

interface SchoolSelectionFormProps {
    selections: Selection[];
    suggestions: School[];
    error: string | null;
    loading: boolean;
    onSchoolChange: (school: School, index: number) => void;
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
                    suggestions={suggestions.map(s => s.name)}
                    defaultValue={selection.school ? selection.school.name : ''}
                    onSuggestionSelected={(selectedName) => {
                        const selectedSchool = suggestions.find(s => s.name === selectedName);
                        if (selectedSchool && (!selection.school || selectedSchool.name !== selection.school.name)) {
                            onSchoolChange(
                                selectedSchool,
                                index
                            )
                        }
                    }}
                />
                {selection.school && selection.school.profiles && selection.school.profiles.length > 0 && (
                    <div className={styles.profilesSection}>
                        <h3>Wybór profili</h3>
                        {selection.school.profiles.map((profile) => {
                            const selectedProfile = selection.profiles.find(
                                (p) => p.id === profile.id
                            )

                            return (
                                <div key={profile.id} className={styles.checkBoxOption}>
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={!!selectedProfile}
                                            onChange={() => onProfileChange(profile, index)}
                                        />
                                        {profile.name}
                                    </label>
                                    {selectedProfile && (
                                        <InputField
                                            type="number"
                                            min={1}
                                            value={selectedProfile.priority}
                                            onChange={(e) =>
                                                onPriorityChange(profile.id, index, Number(e.target.value))
                                            }
                                            placeholder="Priorytet"
                                            width="10px"
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
