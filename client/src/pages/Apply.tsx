import React, { useEffect, useState } from "react";
import SuggestionBox from '../components/SuggestionBox';

const Apply: React.FC = () => {
    const suggestions = [
        'Apple',
        'Banana',
        'Cherry',
        'Date',
        'Elderberry',
        'Fig',
        'Grape',
        'Honeydew'
    ];

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
                const response = await fetch('/api/apply', {
                    method: 'GET',
                    credentials: 'include'
                });
                if (response.ok) {
                    setIsAuthenticated(true);
                } else {
                    if (response.status === 401) {
                        window.location.href = '/login';
                    } else {
                        setError('Access denied');
                    }
                }
            } catch (error) {
                console.error('Error:', error);
                window.location.href = '/login';
            }
        };

        checkAuth();
    }, []);

    const handleSuggestionSelected = (suggestion: string, index: number) => {
        const newSchools = [...schools];
        newSchools[index] = suggestion;
        setSchools(newSchools);
    };

    const handleNext = (event: React.FormEvent) => {
        event.preventDefault();
        if (!name || !surname || !pesel) {
            setError('Proszę wypełnić wszystkie dane osobowe.');
            return;
        }
        setStep(2);
    };

    const handlePrev = (event: React.FormEvent) => {
        event.preventDefault();
        setStep(1);
    };

    const handleAddSchoolInput = () => {
        if(schools.length < 5) {
            setSchools([...schools, '']);
        }
    };


    const handleApply = async (event: React.FormEvent) => {
        event.preventDefault();
        setError('');

        if (schools.every(school => !school)) {
            setError('Proszę wybrać przynajmniej jedną szkołę.');
            return;
        }

        const response = await fetch('/api/apply', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ txtName: name, txtSurname: surname, txtPesel: pesel, txtSchools: schools })
        });

        if (response.ok) {
            const data = await response.json();
            window.location.href = data.redirect;
        } else {
            const errorData = await response.json();
            setError(errorData.message);
        }
    };

    if (!isAuthenticated) {
        return <div> </div>;
    }

    return (
        <div>
            <section id="form">
                {step === 1 ? (
                    <form method="POST" onSubmit={handleNext}>
                        <h1>Formularz osobowy</h1>
                        {error && <div className="form-message form-message-error" role="alert">{error}</div>}
                        <div className="form-input-group">
                            <input
                                type="text"
                                name="txtName"
                                className="form-input"
                                autoFocus
                                placeholder="Imię"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div className="form-input-group">
                            <input
                                type="text"
                                name="txtSurname"
                                className="form-input"
                                placeholder="Nazwisko"
                                required
                                value={surname}
                                onChange={(e) => setSurname(e.target.value)}
                            />
                        </div>
                        <div className="form-input-group">
                            <input
                                type="text"
                                name="txtPesel"
                                className="form-input"
                                placeholder="Pesel"
                                required
                                value={pesel}
                                onChange={(e) => setPesel(e.target.value)}
                            />
                        </div>
                        <button type="submit">Dalej</button>
                    </form>
                ) : (
                    <form method="POST" onSubmit={handleApply}>
                        <h1>Wybór szkół</h1>
                        {error && <div className="form-message form-message-error" role="alert">{error}</div>}
                        {schools.map((_school, index) => (
                            <div key={index}>
                                <SuggestionBox
                                    placeholder="Szkoła"
                                    suggestions={suggestions}
                                    onSuggestionSelected={(suggestion) => handleSuggestionSelected(suggestion, index)}
                                />
                            </div>
                        ))}
                        <div>
                            <button type="button" disabled={schools.length >= 5} className="secondary-button" onClick={handleAddSchoolInput}>+</button>
                        </div>
                        <button type="button" onClick={handlePrev}>Cofnij</button>
                        <button type="submit">Aplikuj</button>
                    </form>
                )}
            </section>
        </div>
    );
}

export default Apply;
