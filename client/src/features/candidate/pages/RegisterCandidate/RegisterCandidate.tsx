import React, { useState } from "react";

import { Candidate } from "../../../../shared/types/candidate.ts";
import { register } from "../../services/candidateService.ts";
import { useFormData } from "../../../../shared/hooks/useFormData.ts";
import RegisterCandidateForm from "../../forms/RegisterForm.tsx";

const RegisterCandidate: React.FC = () => {
    const { formData, handleChange } = useFormData<Candidate>({
        id: 0,
        user_id: 0,
        firstName: '',
        lastName: '',
        pesel: '',
    });

    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleRegister = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const data = await register(formData);
            window.location.href = data.redirect;
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section id="form">
            <RegisterCandidateForm
                formData={formData}
                error={error}
                loading={loading}
                onInputChange={handleChange}
                onSubmit={handleRegister}
            />
        </section>
    );
};

export default RegisterCandidate;
