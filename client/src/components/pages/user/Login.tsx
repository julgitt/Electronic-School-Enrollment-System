import React from 'react';
import { LoginForm } from '../../modules/Forms/LoginForm';
import { useLogin } from "../../../hooks/useLogin.ts";

const Login: React.FC = () => {
    const { handleLogin, isLoading, error } = useLogin();

    return (
        <section id="form">
            <LoginForm onLogin={handleLogin} error={error} loading={isLoading} />
        </section>
    );
};

export default Login;
