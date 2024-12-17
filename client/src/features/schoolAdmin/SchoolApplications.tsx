import React from 'react';
import {useFetch} from "../../shared/hooks/useFetch.ts";
import {Application} from "../../shared/types/application.ts";
import LoadingPage from "../../app/routes/LoadingPage.tsx";



const ApplicationStatus: React.FC = () => {
    const {data: applications, loading, authorized} = useFetch<Application[]>('/api/applications');

    if (loading || !authorized) return <LoadingPage/>;

    return (
        <div>
            <h1>Aplikacje</h1>
            {(!applications || (applications && applications.length === 0)) ? (
                <p>Nie znaleziono aplikacji.</p>
            ) : (
                <table>
                    <thead>
                    <tr>
                        <th>Szkoła</th>
                        <th>Profil</th>
                        <th>Status</th>
                        <th>Tura</th>
                        <th>Priorytet</th>
                        <th>Data złożenia aplikacji</th>
                    </tr>
                    </thead>
                    <tbody>
                    {applications.map((application) => (
                        <tr key={application.id}>
                            <td>{application.school.name}</td>
                            <td>{application.profile.name}</td>
                            <td>{application.status}</td>
                            <td>{application.round}</td>
                            <td>{application.priority}</td>
                            <td>{new Date(application.createdAt).toLocaleDateString()}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default ApplicationStatus;
