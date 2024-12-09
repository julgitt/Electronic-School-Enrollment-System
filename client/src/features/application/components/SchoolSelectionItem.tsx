import React from "react";

import {SuggestionBox} from '../../../components/composite/SuggestionBox';
import {School} from "../../../shared/types/school.ts";
import {SchoolSelection} from "../types/schoolSelection.ts";
import {Profile} from "../../../shared/types/profile.ts";
import ProfileSelection from "./ProfileSelectionItem.tsx";

const SchoolSelectionItem: React.FC<{
    selection: SchoolSelection;
    suggestions: School[];
    index: number;
    onSchoolChange: (school: School | null, index: number) => void;
    onProfileChange: (profile: Profile, index: number) => void;
    onPriorityChange: (profileId: number, index: number, priority: number) => void;
    selections: SchoolSelection[];
}> = ({selection, suggestions, index, onSchoolChange, onProfileChange, onPriorityChange, selections}) => {
    const availableSuggestions = suggestions.filter(
        (school) =>
            !selections.some(
                (sel) => sel.school && sel.school.id === school.id
            )
    );

    return (
        <div>
            <SuggestionBox
                placeholder="Szkoła"
                suggestions={availableSuggestions.map((s) => s.name)}
                defaultValue={selection.school?.name || ''}
                onSuggestionSelected={(selectedName) => {
                    const selectedSchool = suggestions.find((s) => s.name === selectedName) || null;
                    if (!selection.school || !selectedSchool || selectedSchool.name !== selection.school.name) {
                        onSchoolChange(selectedSchool, index);
                    }
                }}
            />
            {selection.school && selection.school.profiles?.length > 0 && (
                <ProfileSelection
                    profiles={selection.school.profiles}
                    selectedProfiles={selection.profiles}
                    onProfileChange={(profile) => onProfileChange(profile, index)}
                    onPriorityChange={(profileId, priority) =>
                        onPriorityChange(profileId, index, priority)
                    }
                />
            )}
        </div>
    );
};

export default SchoolSelectionItem;
