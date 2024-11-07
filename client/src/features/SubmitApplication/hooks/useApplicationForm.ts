import React, { useState } from 'react';
import {submitApplication} from "../applicationService.ts";

export const useApplicationForm = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [pesel, setPesel] = useState('');
    const [schools, setSchools] = useState([-1]);
    const [error, setError] = useState<string | null>(null);
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    const handleNext = () => {
        if (!firstName || !lastName || !pesel) {
            setError('Proszę wypełnić wszystkie dane osobowe.');
        } else {
            setStep(2);
            setError(null);
        }
    };

    const handlePrev = () => {
        setStep(1);
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const data = await submitApplication(schools, pesel, firstName, lastName)
            window.location.href = data.redirect;
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSuggestionSelected = (suggestion: number, index: number) => {
        const newSchools = [...schools];
        newSchools[index] = suggestion;
        setSchools(newSchools);
    };

    const handleAddSchoolInput = () => setSchools([...schools, -1]);

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
        handleNext,
        handlePrev,
        handleSubmit,
        handleSuggestionSelected,
        handleAddSchoolInput
    };
};
