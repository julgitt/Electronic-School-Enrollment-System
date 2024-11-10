import React from 'react';

import { useFetch } from "../../hooks/useFetch.ts";
import { Application } from "../../types/application.ts";

import LoadingPage from "./LoadingPage.tsx";
import ErrorPage from "./ErrorPage.tsx";

const ApplicationStatus: React.FC = () => {
    const { data: applications, loading, authorized, error} = useFetch<Application[]>('/api/allApplications');

    if (error) return <ErrorPage errorMessage={error} />;
    if (loading || !authorized) return <LoadingPage />;

    return (
        <div>
            <h1>Status Aplikacji</h1>
            {(!applications || (applications && applications.length === 0)) ? (
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
                        <tr key={application.schoolId}>
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
