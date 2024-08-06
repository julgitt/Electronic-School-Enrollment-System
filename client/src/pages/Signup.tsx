import React, {useState} from 'react';
import { Link } from 'react-router-dom'

import '../assets/css/Form.css';

const Signup: React.FC = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [error, setError] = useState('');

    const handleSignup = async (event: React.FormEvent) => {
        event.preventDefault();
        setError('');

        try {
            const response = await fetch('/api/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    txtUser: username,
                    txtEmail: email,
                    txtPwd: password,
                    txtPwd_c: passwordConfirm,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Signup successful:', data);
                window.location.href = data.redirect;
            } else {
                const errorData = await response.json();
                console.log('Signup unsuccessful:', errorData);
                setError(errorData.message || 'An error occurred during signup.');
            }
        } catch (error) {
            console.error('Network error:', error);
            setError('A network error occurred. Please try again later.');
        }
    };

    return (
        <div>
            <section id="form">
                <form method="POST" onSubmit={handleSignup}>
                    <h1>Rejestracja</h1>
                    {error && <div className="form-message form-message-error" role="alert">{error}</div>}
                    <div className="form-input-group">
                        <input
                            type="text"
                            name="txtUser"
                            className="form-input"
                            autoFocus
                            placeholder="Nazwa użytkownika"
                            required pattern="[a-zA-Z0-9]+"
                            minLength={5}
                            title="Nazwa użytkownika może zawierać tylko litery oraz cyfry"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div className="form-input-group">
                        <input
                            type="email"
                            name="txtEmail"
                            className="form-input"
                            placeholder="Email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="form-input-group">
                        <input
                            type="text"
                            name="txtFirstName"
                            className="form-input"
                            placeholder="Imię"
                            required
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                        />
                    </div>
                    <div className="form-input-group">
                        <input
                            type="text"
                            name="txtLastName"
                            className="form-input"
                            placeholder="Nazwisko"
                            required
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                        />
                    </div>

                    <div className="form-input-group">
                        <input
                            type="password"
                            name="txtPwd"
                            className="form-input"
                            placeholder="Hasło"
                            required pattern="[a-zA-Z0-9!@#$%^&*_=+-]+"
                            minLength={8}
                            title="Hasło może zawierać jedynie litery, cyfry oraz znaki: !@#$%^&*_=+-"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <div className="form-input-group">
                        <input
                            type="password"
                            name="txtPwd_c"
                            className="form-input"
                            placeholder="Potwierdź hasło"
                            required
                            value={passwordConfirm}
                            onChange={(e) => setPasswordConfirm(e.target.value)}
                        />
                    </div>
                    <button className="normal" type="submit">Zarejestruj się</button>
                    <p className="form-text">
                        <Link to="/login" className="form-link" id="linkLogin">Już masz konto? Zaloguj się</Link>
                    </p>
                </form>
            </section>
        </div>
    );
}

export default Signup;
