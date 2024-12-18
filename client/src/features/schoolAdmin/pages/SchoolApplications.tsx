import React from 'react';
import {useFetch} from "../../../shared/hooks/useFetch.ts";
import {Application} from "../../../shared/types/application.ts";
import LoadingPage from "../../../app/routes/LoadingPage.tsx";


const SchoolApplications: React.FC = () => {
    const {data, loading, authorized} = useFetch<{accepted: Application[], acceptedBefore: Application[], reserve: Application[]}>('/api/admin/applications');

    if (loading || !authorized) return <LoadingPage/>;

    return (
        <div>
            <h1>Kandydaci</h1>
            {(!data || (data && data.accepted.length === 0)) ? (
                <p>Nie znaleziono aplikacji.</p>
            ) : (
                <table>
                    <thead>
                    <tr>
                        <th>Status</th>
                        <th>Tura</th>
                        <th>Priorytet</th>
                        <th>Data złożenia aplikacji</th>
                    </tr>
                    </thead>
                    <tbody>
                    {data.accepted.map((application) => (
                        <tr key={application.id}>
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

export default SchoolApplications;
