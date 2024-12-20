import React, {useEffect, useState} from 'react';
import {submitApplication, updateApplication} from "../services/applicationService.ts";
import {School} from "../../../shared/types/school.ts";
import {SchoolSelection} from "../types/schoolSelection.ts"
import {Profile} from "../../../shared/types/profile.ts";
import {UserSelectedProfile} from "../types/userSelectedProfile.ts";
import {AdditionalCriteria} from "../types/additionalCriteria.ts";
import {SCHOOL_MAX} from "../../../../../adminConstants.ts";

export const useApplicationForm = (submission: SchoolSelection[]) => {
    const [selections, setSelections] = useState<SchoolSelection[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (submission && submission.length > 0) {
            setSelections(submission);
        }
    }, [submission]);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError(null);
        setLoading(true);
        const profiles: UserSelectedProfile[] = selections.flatMap(s =>
            s.profiles);

        const additionalCriteria: AdditionalCriteria = {
            isDisabled: disabled,
            isVolunteering: volunteering,
            isOlympiadLaureate: olympiadLaureate,
        }

        try {
            const data = (submission && submission.length > 0)
                ? await updateApplication(profiles, additionalCriteria)
                : await submitApplication(profiles, additionalCriteria);
            setSuccessMessage("Zapisano aplikację.");
            setTimeout(() => setSuccessMessage(null), 3000);
            window.location.href = data.redirect;
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSchoolChange = (suggestion: School | null, index: number) => {
        if (suggestion === null) {
            const newSelection = selections.filter((_, i) => i !== index);
            setSelections(newSelection);
        } else {
            const newSelection = [...selections];
            newSelection[index] = {school: suggestion, profiles: []};
            setSelections(newSelection);
        }
    };

    const handleProfileChange = (profile: Profile, index: number) => {
        const newSelection = [...selections];
        const schoolSelection = newSelection[index];
        const profileIndex = schoolSelection.profiles.findIndex(p => p.profileId === profile.id);

        if (profileIndex === -1) {
            schoolSelection.profiles = [...schoolSelection.profiles, {profileId: profile.id, priority: 1}];
        } else {
            schoolSelection.profiles.splice(profileIndex, 1)
        }

        setSelections(newSelection);
    }

    const handlePriorityChange = (profileId: number, index: number, priority: number) => {
        const newSelection = [...selections];
        const schoolSelection = newSelection[index];
        const profileIndex = schoolSelection.profiles.findIndex(profile => profile.profileId === profileId);

        schoolSelection.profiles[profileIndex] = {
            profileId: schoolSelection.profiles[profileIndex].profileId,
            priority: priority
        };

        setSelections(newSelection);
    }

    const handleAddSchoolSelection = () => {
        if (selections.length >= SCHOOL_MAX) return;
        setSelections([...selections, {school: null, profiles: []}]);
    };


    return {
        successMessage,
        selections,
        error,
        loading,
        setSelections,
        handleSubmit,
        handleSchoolChange,
        handleAddSchoolSelection,
        handleProfileChange,
        handlePriorityChange
    };
};
