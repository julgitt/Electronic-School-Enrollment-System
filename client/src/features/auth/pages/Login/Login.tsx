import React, { useState } from "react";

import LoginForm from "../../forms/LoginForm.tsx";
import { login } from "../../services/authService.ts";
import { LoginFormData } from "../../types/loginFormData.ts";
import { useFormData } from "../../../../shared/hooks/useFormData.ts";

const Login: React.FC = () => {
    const { formData, handleChange } = useFormData<LoginFormData>({
        username: '',
        password: '',
    });

    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleLogin = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const data = await login(formData);
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
                formData={formData}
                error={error}
                loading={loading}
                onInputChange={handleChange}
                onSubmit={handleLogin}
            />
        </section>
    );
};

export default Login;
