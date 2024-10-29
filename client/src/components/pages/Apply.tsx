import React, { useState } from 'react';
import { PersonalForm } from '../modules/Forms/PersonalForm';
import { SchoolSelectionForm } from '../modules/Forms/SchoolSelectionForm';
import {useFetch} from "../../hooks/useFetch.ts";
import useAuthorize from "../../hooks/useAuthorize.ts";

interface School {
    id: number;
    name: string;
}

const Apply: React.FC = () => {
    const authorized = useAuthorize('/api/apply');
    const [error, setError] = useState<string | null>(null);
    const { data: suggestions, loading, error: fetchError } = useFetch<School[]>('/api/schools');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [pesel, setPesel] = useState('');
    const [step, setStep] = useState(1);
    const [schools, setSchools] = useState([-1]);

    if (loading || !authorized) {
        return <div>Loading...</div>;
    }

    if (fetchError) {
        return <div>{fetchError}</div>;
    }

    const handleNext = (event: React.FormEvent) => {
        event.preventDefault();
        if (!firstName || !lastName || !pesel) setError('Proszę wypełnić wszystkie dane osobowe.');
        else setStep(2);
    };

    const handlePrev = (event: React.FormEvent) => {
        event.preventDefault();
        setStep(1);
    }

    const handleApply = async (event: React.FormEvent) => {
        event.preventDefault();
        setError(null);

        if (schools.every(school => !school)) setError('Proszę wybrać przynajmniej jedną szkołę.');
        else {
            const response = await fetch('/api/apply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ txtFirstName: firstName, txtLastName: lastName, txtPesel: pesel, txtSchools: schools })
            });

            if (response.ok) window.location.href = (await response.json()).redirect;
            else setError((await response.json()).message);
        }
    };

    const handleSuggestionSelected = (suggestion: number, index: number) => {
        const newSchools = [...schools];
        newSchools[index] = suggestion;
        setSchools(newSchools);
    };

    const handleAddSchoolInput = () => setSchools([...schools, -1]);

    return (
        <div>
            {step === 1 ? (
                <PersonalForm
                    firstName={firstName}
                    lastName={lastName}
                    pesel={pesel}
                    error={error}
                    onFirstNameChange={setFirstName}
                    onLastNameChange={setLastName}
                    onPeselChange={setPesel}
                    onSubmit={handleNext}
                />
            ) : (
                <SchoolSelectionForm
                    schools={schools}
                    error={error}
                    suggestions={suggestions || []}
                    onSchoolChange={handleSuggestionSelected}
                    onAddSchool={handleAddSchoolInput}
                    onPrev={handlePrev}
                    onSubmit={handleApply}
                />
            )}
        </div>
    );
};

export default Apply;
