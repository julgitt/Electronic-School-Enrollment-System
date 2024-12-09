import React, {useState} from 'react';

import {Button} from "../../components/atomic/Button";
import LoadingPage from "./LoadingPage.tsx";
import ErrorPage from "./ErrorPage.tsx";

const Enroll: React.FC = () => {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const handleEnrollClick = async () => {
        setError(null);
        setLoading(true);

        try {
            const response = await fetch('/api/enroll', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (!response.ok)
                throw new Error(data.message || 'Błąd podczas wykonywania naboru.');

            console.log("Nabór zakończony pomyślnie", data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (error) return <ErrorPage errorMessage={error}/>;
    if (loading) return <LoadingPage/>

    return (
        <div>
            <Button
                onClick={handleEnrollClick}
            >
                Zacznij nabór
            </Button>
        </div>
    );
};

export default Enroll;
