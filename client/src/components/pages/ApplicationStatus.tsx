import React from 'react';
import { useFetch } from "../../hooks/useFetch.ts";
import useAuthorize from "../../hooks/useAuthorize.ts";

interface Application {
    id: number;
    schoolName: string;
    status: string;
    submittedAt: string;
    stage: number;
}

const ApplicationStatus: React.FC = () => {
    const authorized = useAuthorize('/api/apply');
    const { data: applications, loading, error } = useFetch<Application[]>('/api/apply');

    if (loading || !authorized) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div>
            <h1>Status Aplikacji</h1>
            {(!applications || (applications && applications.length !== 0)) ? (
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
