import React, { useState, useEffect } from 'react';
import { PersonalForm } from '../modules/Forms/PersonalForm';
import { SchoolSelectionForm } from '../modules/Forms/SchoolSelectionForm';
import {errorMessages} from "../../constants/errorMessages.ts";

interface School {
    id: number;
    name: string;
}

const Apply: React.FC = () => {
    const [suggestions, setSuggestions] = useState<School[]>([]);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [pesel, setPesel] = useState('');
    const [error, setError] = useState('');
    const [step, setStep] = useState(1);
    const [schools, setSchools] = useState([-1]);
    const [loading, setLoading] = useState<boolean>(true);
    const [authorized, setAuthorized] = useState<boolean>(false);

    useEffect(() => {
        const fetchSchools = async () => {
            try {
                const response = await fetch('/api/schools');

                if (response.ok) {
                    const data = await response.json();
                    if (Array.isArray(data)) {
                        setSuggestions(data);
                    } else {
                        console.error('Expected array, but received:', data);
                        setError(errorMessages.INTERNAL_SERVER_ERROR)
                        setSuggestions([]);
                    }
                } else {
                    console.error('Fetch returned the response with code:', response.status);
                    setError(errorMessages.INTERNAL_SERVER_ERROR)
                }
                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch schools:', error);
                setError(errorMessages.INTERNAL_SERVER_ERROR)
                setLoading(false);
            }
        };

        const checkAuth = async () => {
            try {
                const response = await fetch('/api/apply', { method: 'GET', credentials: 'include' });
                if (!response.ok) window.location.href = '/login';
                setAuthorized(true);
            } catch {
                window.location.href = '/login';
            }
        };
        checkAuth();
        fetchSchools();
    }, []);

    if (loading || !authorized) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
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
        setError('');

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
                    suggestions={suggestions}
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
