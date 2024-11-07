import React, { useState } from "react";
import LoginForm from "./LoginForm.tsx";
import { login } from "../authService.ts";

const Login: React.FC = () => {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const data = await login(username, password);
            window.location.href = data.redirect;
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section id="form">
            <LoginForm
                username={username}
                password={password}
                error={error}
                loading={loading}
                onUsernameChange={setUsername}
                onPasswordChange={setPassword}
                onSubmit={handleLogin}
            />
        </section>
    );
};

export default Login;
