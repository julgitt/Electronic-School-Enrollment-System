import React from 'react';
import {RankedApplication} from "../../../shared/types/rankedApplication.ts";
import {MinusButton} from "../../../components/atomic/QuantityButton";

interface ApplicationsTableProps {
    applications: RankedApplication[];
    title: string
    loading?: boolean;
    canReject?: boolean
    onReject?: (id: number) => void;
}

const ApplicationsTable: React.FC<ApplicationsTableProps> = ({
                                                                 applications,
                                                                 title,
                                                                 onReject,
                                                                 loading = false,
                                                                 canReject = false
                                                             }) => {

    const handleReject = (applicationId: number) => {
        if (onReject && window.confirm("Czy na pewno chcesz odrzucić tę aplikację?")) {
            onReject(applicationId);
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
                    {(canReject) && (
                        <th>Odrzuć</th>
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
                        {(canReject) && (
                            <td>
                                <MinusButton
                                    onClick={() => handleReject(application.id)}
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
