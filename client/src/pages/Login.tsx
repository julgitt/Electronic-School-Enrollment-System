import React, { useState } from 'react';
import { Link } from "react-router-dom";

import '../assets/css/Form.css';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (event: React.FormEvent) => {
        event.preventDefault();
        setError('');

        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ txtUser: username, txtPwd: password })
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
                <form method="POST" onSubmit={handleLogin}>
                    <h1>Logowanie</h1>
                    {error && <div className="form-message form-message-error" role="alert">{error}</div>}
                    <div className="form-input-group">
                        <input
                            type="text"
                            name="txtUser"
                            className="form-input"
                            autoFocus
                            placeholder="Email"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div className="form-input-group">
                        <input
                            type="password"
                            name="txtPwd"
                            className="form-input"
                            placeholder="Hasło"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button type="submit">Zaloguj</button>
                    <p className="form-text">
                        <a href="#" className="form-link">Przypomnij hasło</a>
                    </p>
                    <p className="form-text">
                        <Link to="/signup" id="linkCreateAccount">Załóż konto</Link>
                    </p>
                </form>
            </section>
        </div>
    );
}

export default Login;