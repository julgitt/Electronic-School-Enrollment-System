import React from 'react';
import { useFetch } from "../../../hooks/useFetch.ts";
import { Application } from "../../../models/application.ts";
import Loading from "../utils/Loading.tsx";
import Error from "../utils/Error.tsx";


const ApplicationStatus: React.FC = () => {
    const { data: applications, loading, authorized, error} = useFetch<Application[]>('/api/apply');

    if (loading || !authorized) {
        return <Loading />;
    }

    if (error) {
        return <Error errorMessage={error} />;
    }

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
