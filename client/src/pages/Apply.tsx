import React, { useState } from "react";
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
    const [schoolName, setSchoolName] = useState('');
    const [error, setError] = useState('');

    const handleSuggestionSelected = (suggestion: string) => {
        setSchoolName(suggestion);
    };

    const handleApply = async (event: React.FormEvent) => {
        event.preventDefault();
        setError('');

        if (!suggestions.includes(schoolName)) {
            setError('Proszę wybrać szkołę z listy sugestii.');
            return;
        }

        const response = await fetch('/api/apply', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ txtName: name, txtSurname: surname, txtPesel: pesel, txtSchool: schoolName })
        });

        if (response.ok) {
            const data = await response.json();
            window.location.href = data.redirect;
        } else {
            const errorData = await response.json();
            setError(errorData.message);
        }
    };

    return (
        <div>
            <section id="form">
                <form method="POST" onSubmit={handleApply}>
                    <h1>Aplikuj</h1>
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
                    <div>
                        <SuggestionBox placeholder="Nazwa Wybieranej Szkoły" suggestions={suggestions} onSuggestionSelected={handleSuggestionSelected}/>
                    </div>
                    <button type="submit">Aplikuj</button>
                </form>
            </section>
        </div>
    );
}

export default Apply;
