import React, {useState} from 'react';

import {Button} from "../../../../components/atomic/Button";
import LoadingPage from "../../../../app/routes/LoadingPage.tsx";
import {useError} from "../../../../shared/providers/errorProvider.tsx";
import SuccessMessage from "../../../../components/atomic/SuccessMessage/SuccessMessage.tsx";

const Enroll: React.FC = () => {
    const {setError} = useError();
    const [loading, setLoading] = useState<boolean>(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleEnrollClick = async () => {
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
                throw new Error(data.message || "Wystąpił błąd.");

            setSuccessMessage("Nabór zakończony pomyślnie!");
            setTimeout(() => setSuccessMessage(null), 3000);

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
            {successMessage && (<SuccessMessage message={successMessage}/>)}
        </div>
    );
};

export default Enroll;
