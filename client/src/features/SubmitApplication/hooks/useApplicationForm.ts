import React, {useEffect, useState} from 'react';
import {submitApplication, updateApplication} from "../applicationService.ts";
import {Application} from "../../../types/application.ts";
import {School} from "../../../types/school.ts";

export const useApplicationForm = (applications: Application[]) => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [pesel, setPesel] = useState('');
    const [schools, setSchools] = useState<School[]>([{ id: -1, name: '' }]);
    const [error, setError] = useState<string | null>(null);
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (applications && applications.length > 0) {
            const { firstName, lastName, pesel } = applications[0];
            setFirstName(firstName);
            setLastName(lastName);
            setPesel(pesel);
            const initialSchools = applications.map(app => ({
                id: app.schoolId,
                name: app.schoolName,
            }));
            setSchools(initialSchools);
        }
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
        const schoolIds = schools.map(school => school.id).filter(id => id != -1);

        try {
            const data = (applications && applications.length > 0)
                ? await updateApplication(schoolIds, pesel, firstName, lastName)
                : await submitApplication(schoolIds, pesel, firstName, lastName);
            window.location.href = data.redirect;
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSuggestionSelected = (suggestion: School, index: number) => {
        const newSchools = [...schools];
        newSchools[index] = suggestion;
        setSchools(newSchools);
    };

    const handleAddSchoolInput = () => {
        setSchools([...schools, {id: -1, name: ''}]);
    };

    return {
        firstName,
        lastName,
        pesel,
        schools,
        error,
        step,
        loading,
        setFirstName,
        setLastName,
        setPesel,
        setSchools,
        handleNext,
        handlePrev,
        handleSubmit,
        handleSuggestionSelected,
        handleAddSchoolInput
    };
};
