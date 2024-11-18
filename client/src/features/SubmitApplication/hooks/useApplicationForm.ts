import React, {useEffect, useState} from 'react';
import {submitApplication, updateApplication} from "../applicationService.ts";
import {Application} from "../../../shared/types/application.ts";
import {School} from "../../../shared/types/school.ts";
import {Selection} from "../types/selection.ts"
import {Profile} from "../../../shared/types/profile.ts";

export const useApplicationForm = (applications: Application[]) => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [pesel, setPesel] = useState('');
    const [selections, setSelections] = useState<Selection[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const initialSelections = applications.reduce<Selection[]>((acc, application) => {
            const existingSelection = acc.find(s => s.school && s.school.id === application.school.id);

            if (existingSelection) {
                existingSelection.profiles = [
                    ...existingSelection.profiles, application.profile,
                ].filter(
                    (profile, index, self) =>
                        index === self.findIndex(p => p.id === profile.id)
                );
            } else {
                acc.push({
                    school: application.school,
                    profiles: [ application.profile ],
                });
            }
            return acc;
        }, []);

        setSelections(initialSelections);
    }, [applications]);


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
        const profiles: {id: number, priority: number}[] = selections.flatMap(s =>
            s.profiles).map(p => ({ id: p.id, priority: p.priority }));

        try {
            const data = (applications && applications.length > 0)
                ? await updateApplication(profiles)
                : await submitApplication(profiles);
            window.location.href = data.redirect;
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSchoolChange = (suggestion: School, index: number) => {
        const newSelection = [...selections];
        newSelection[index] = {school: suggestion, profiles: []};
        setSelections(newSelection);
    };

    const handleProfileChange = (profile: Profile, index: number) => {
        const newSelection = [...selections];
        const schoolSelection = newSelection[index];
        const profileIndex = schoolSelection.profiles.findIndex(p => p.id === profile.id);

        if (profileIndex === -1) {
            schoolSelection.profiles = [...schoolSelection.profiles, profile];
        } else {
            schoolSelection.profiles.splice(profileIndex, 1)
        }

        setSelections(newSelection);
    }

    const handlePriorityChange = (profileId: number, index: number, priority: number) => {
        const newSelection = [...selections];
        const schoolSelection = newSelection[index];
        const profileIndex = schoolSelection.profiles.findIndex(profile => profile.id === profileId);

        schoolSelection.profiles[profileIndex] = {
            id: schoolSelection.profiles[profileIndex].id,
            name: schoolSelection.profiles[profileIndex].name,
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
