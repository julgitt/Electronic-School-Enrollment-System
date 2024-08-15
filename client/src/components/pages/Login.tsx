import React from 'react';
import { LoginForm } from '../organisms/Forms/LoginForm';

const Login: React.FC = () => {
    const handleLogin = async (username: string, password: string) => {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ txtUser: username, txtPwd: password })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message);
        }

        const data = await response.json();
        window.location.href = data.redirect;
    };

    return (
        <section id="form">
            <LoginForm onLogin={handleLogin}/>
        </section>
    );
};

export default Login;
