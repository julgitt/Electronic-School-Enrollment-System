import React, {useEffect, useState} from 'react';
import {submitApplication, updateApplication} from "../applicationService.ts";
import {School} from "../../../shared/types/school.ts";
import {SchoolSelection} from "../types/schoolSelection.ts"
import {Profile} from "../../../shared/types/profile.ts";
import {UserSelectedProfile} from "../types/userSelectedProfile.ts";

export const useApplicationForm = (submission: SchoolSelection[]) => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [pesel, setPesel] = useState('');
    const [selections, setSelections] = useState<SchoolSelection[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setSelections(submission);
    }, [submission]);


    const handleNext = () => {
        if (!firstName || !lastName || !pesel) {
            setError('Proszę wypełnić wszystkie dane osobowe.');
        } else {
            setStep(2);
            setError(null);
        }
    };

    const handlePrev = () => setStep(1);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError(null);
        setLoading(true);
        const profiles: UserSelectedProfile[] = selections.flatMap(s =>
            s.profiles);

        try {
            const data = (submission && submission.length > 0)
                ? await updateApplication(profiles)
                : await submitApplication(profiles);
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
            priority: priority};

        setSelections(newSelection);
    }

    const handleAddSchoolSelection = () => {
        setSelections([...selections, {school: null, profiles: []}]);
    };


    return {
        firstName,
        lastName,
        pesel,
        selections,
        error,
        step,
        loading,
        setFirstName,
        setLastName,
        setPesel,
        setSelections,
        handleNext,
        handlePrev,
        handleSubmit,
        handleSchoolChange,
        handleAddSchoolSelection,
        handleProfileChange,
        handlePriorityChange
    };
};
