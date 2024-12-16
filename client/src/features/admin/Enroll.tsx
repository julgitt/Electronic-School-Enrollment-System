import React, {useState} from 'react';

import {Button} from "../../components/atomic/Button";
import LoadingPage from "../../app/routes/LoadingPage.tsx";
import {useError} from "../../shared/providers/errorProvider.tsx";

const Enroll: React.FC = () => {
    const {setError} = useError();
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
                setError;

            console.log("Nabór zakończony pomyślnie", data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

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
