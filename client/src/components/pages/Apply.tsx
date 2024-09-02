import React, { useState, useEffect } from 'react';
import { PersonalForm } from '../modules/Forms/PersonalForm';
import { SchoolSelectionForm } from '../modules/Forms/SchoolSelectionForm';

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
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [step, setStep] = useState(1);
    const [schools, setSchools] = useState([-1]);

    useEffect(() => {
        const fetchSchools = async () => {
            try {
                const response = await fetch('/api/schools');
                if (response.ok) {
                    const data = await response.json();
                    setSuggestions(data);
                } else {
                    console.error('Błąd podczas pobierania szkół');
                }
            } catch (error) {
                console.error('Error fetching schools:', error);
            }
        };

        const checkAuth = async () => {
            try {
                const response = await fetch('/api/apply', { method: 'GET', credentials: 'include' });
                if (response.ok) setIsAuthenticated(true);
                else window.location.href = '/login';
            } catch {
                window.location.href = '/login';
            }
        };
        checkAuth();
        fetchSchools();
    }, []);

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

    if (!isAuthenticated) return <div>Loading...</div>;

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
