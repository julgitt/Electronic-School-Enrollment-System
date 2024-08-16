import React, { useState, useEffect } from 'react';
import { PersonalForm } from '../organisms/Forms/PersonalForm';
import { SchoolSelectionForm } from '../organisms/Forms/SchoolSelectionForm';

const Apply: React.FC = () => {
    const suggestions = ['Apple', 'Banana', 'Cherry'];
    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [pesel, setPesel] = useState('');
    const [error, setError] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [step, setStep] = useState(1);
    const [schools, setSchools] = useState(['']);

    useEffect(() => {
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
    }, []);

    const handleNext = (event: React.FormEvent) => {
        event.preventDefault();
        if (!name || !surname || !pesel) setError('Proszę wypełnić wszystkie dane osobowe.');
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
                body: JSON.stringify({ txtName: name, txtSurname: surname, txtPesel: pesel, txtSchools: schools })
            });

            if (response.ok) window.location.href = (await response.json()).redirect;
            else setError((await response.json()).message);
        }
    };

    const handleSuggestionSelected = (suggestion: string, index: number) => {
        const newSchools = [...schools];
        newSchools[index] = suggestion;
        setSchools(newSchools);
    };

    const handleAddSchoolInput = () => setSchools([...schools, '']);

    if (!isAuthenticated) return <div>Loading...</div>;

    return (
        <div>
            {step === 1 ? (
                <PersonalForm
                    name={name}
                    surname={surname}
                    pesel={pesel}
                    error={error}
                    onNameChange={setName}
                    onSurnameChange={setSurname}
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
