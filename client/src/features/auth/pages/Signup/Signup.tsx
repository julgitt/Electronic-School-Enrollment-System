import React, {useState} from 'react';

import SignupForm from "../../forms/SignupForm.tsx";
import {signup} from "../../services/authService.ts";

import {SignupFormData} from "../../types/signUpFormData.ts";
import {useFormData} from "../../../../shared/hooks/useFormData.ts";

const Signup: React.FC = () => {
    const {formData, handleChange} = useFormData<SignupFormData>({
        username: '',
        email: '',
        password: '',
        passwordConfirm: ''
    });
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSignup = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const data = await signup(formData);
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
                formData={formData}
                onInputChange={handleChange}
                error={error}
                loading={loading}
                onSubmit={handleSignup}
            />
        </section>
    );
};

export default Signup;
