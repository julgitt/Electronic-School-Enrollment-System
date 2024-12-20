import React from 'react';
import {RankedApplication} from "../../../shared/types/rankedApplication.ts";
import {MinusButton} from "../../../components/atomic/QuantityButton";

interface ApplicationsTableProps {
    applications: RankedApplication[];
    title: string
    loading?: boolean;
    canDelete?: boolean
    onDelete?: (id: number) => void;
}

const ApplicationsTable: React.FC<ApplicationsTableProps> = ({
                                                                 applications,
                                                                 title,
                                                                 onDelete,
                                                                 loading = false,
                                                                 canDelete = false
                                                             }) => {

    const handleDelete = (applicationId: number) => {
        if (onDelete && window.confirm("Czy na pewno chcesz usunąć tę aplikację?")) {
            onDelete(applicationId);
        }
    };

    return (
        <form>
            <h3> {title} </h3>
            <table>
                <thead>
                <tr>
                    <th>Imię</th>
                    <th>Nazwisko</th>
                    <th>Punkty</th>
                    <th>Status</th>
                    {(canDelete) && (
                        <th>Usuń</th>
                    )}
                </tr>
                </thead>
                <tbody>
                {applications.map((application) => (
                    <tr key={application.id}>
                        <td>{application.candidate.firstName}</td>
                        <td>{application.candidate.lastName}</td>
                        <td>{application.points}</td>
                        <td>{application.status}</td>
                        {(canDelete) && (
                            <td>
                                <MinusButton
                                    onClick={() => handleDelete(application.id)}
                                    disabled={loading}
                                />
                            </td>
                        )}
                    </tr>
                ))}
                </tbody>
            </table>
        </form>
    );
}

export default ApplicationsTable;
