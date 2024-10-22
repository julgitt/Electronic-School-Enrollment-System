import React, {useEffect, useState} from 'react';
import { errorMessages } from '../../constants/errorMessages.ts'

interface Application {
    id: number;
    schoolName: string;
    status: string;
    submittedAt: string;
    stage: number;
}

const ApplicationStatus: React.FC = () => {
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [authorized, setAuthorized] = useState<boolean>(false);

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                const response = await fetch('/api/apply');
                if (response.ok) {
                    const data = await response.json();
                    if (Array.isArray(data)) {
                        setApplications(data);
                    } else { // array was expected
                        console.error('Expected array, but received:', data);
                        setError(errorMessages.INTERNAL_SERVER_ERROR);
                    }
                } else {
                    console.error('Fetch returned the response with code:', response.status);
                    setError('errorMessages.INTERNAL_SERVER_ERROR');
                }
                setLoading(false);
            } catch (err) {
                console.error('Failed to fetch schools:', error);
                setError('errorMessages.INTERNAL_SERVER_ERROR');
                setLoading(false);
            }
        };

        const checkAuth = async () => {
            try {
                const response = await fetch('/api/apply', { method: 'GET', credentials: 'include' });
                if (!response.ok) window.location.href = '/login';
                setAuthorized(true);
            } catch {
                window.location.href = '/login';
            }
        };

        checkAuth();
        fetchApplications();
    }, []);

    if (loading || !authorized) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div>
            <h1>Status Aplikacji</h1>
            {applications.length === 0 ? (
                <p>Nie znaleziono aplikacji.</p>
            ) : (
                <table>
                    <thead>
                    <tr>
                        <th>Nazwa szkoły</th>
                        <th>Status</th>
                        <th>Tura</th>
                        <th>Data złożenia aplikacji</th>
                    </tr>
                    </thead>
                    <tbody>
                    {applications.map((application) => (
                        <tr key={application.id}>
                            <td>{application.schoolName}</td>
                            <td>{application.status}</td>
                            <td>{application.stage}</td>
                            <td>{new Date(application.submittedAt).toLocaleDateString()}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default ApplicationStatus;
