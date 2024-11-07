import React, {useState} from 'react';

import SignupForm from "./SignupForm.tsx";
import { signup } from "../authService.ts";

const Signup: React.FC = () => {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');

    const handleSignup = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const data = await signup(
                username,
                email,
                firstName,
                lastName,
                password,
                passwordConfirm
            );
            window.location.href = data.redirect;
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section id="form">
            <SignupForm
                username={username}
                email={email}
                firstName={firstName}
                lastName={lastName}
                password={password}
                passwordConfirm={passwordConfirm}
                onUsernameChange={setUsername}
                onEmailChange={setEmail}
                onFirstNameChange={setFirstName}
                onLastNameChange={setLastName}
                onPasswordChange={setPassword}
                onPasswordConfirmChange={setPasswordConfirm}
                error={error}
                loading={loading}
                onSubmit={handleSignup}
            />
        </section>
    );
};

export default Signup;
