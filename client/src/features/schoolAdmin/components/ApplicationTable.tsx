import React from 'react';
import { RankedApplication } from "../../../shared/types/rankedApplication.ts";

interface ApplicationsTableProps {
    applications: RankedApplication[];
    title: string
}

const ApplicationsTable: React.FC<ApplicationsTableProps> = ({ applications, title }) => {
    return (
        <div>
            <h2> {title} </h2>
            <table>
                <thead>
                    <tr>
                        <th>Imię</th>
                        <th>Nazwisko</th>
                        <th>Punkty</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {applications.map((application) => (
                        <tr key={application.id}>
                            <td>{application.candidate.firstName}</td>
                            <td>{application.candidate.lastName}</td>
                            <td>{application.points}</td>
                            <td>{application.status}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default ApplicationsTable;
