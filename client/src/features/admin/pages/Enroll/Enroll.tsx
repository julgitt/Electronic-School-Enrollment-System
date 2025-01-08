import React, {useState} from 'react';

import {Button} from "../../../../components/atomic/Button";
import LoadingPage from "../../../../app/routes/LoadingPage.tsx";
import {useError} from "../../../../shared/providers/errorProvider.tsx";
import {SuccessMessage} from "../../../../components/atomic/SuccessMessage";
import {ApplicationWithInfo} from "../../types/applicationWithInfo.ts";
import {ToCSV} from "../../../../shared/utils/toCSV.ts";

const Enroll: React.FC = () => {
    const {setError} = useError();
    const [loading, setLoading] = useState<boolean>(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [enrollmentInfo, setEnrollmentInfo] = useState<ApplicationWithInfo[]>([]);

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

            setEnrollmentInfo(data);
            setSuccessMessage("Nabór zakończony pomyślnie!");
            setTimeout(() => setSuccessMessage(null), 3000);

            console.log("Nabór zakończony pomyślnie", data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleExportClick = async () => {
        const csv = ToCSV(
            enrollmentInfo.map(a => {
                return {
                    ...a,
                    candidateId: a.candidate.id,
                    candidateFirstName: a.candidate.firstName,
                    candidateLastName: a.candidate.lastName,
                    profileId: a.profile.id,
                    profileName: a.profile.name,
                    schoolId: a.profile.schoolId,
                    schoolName: a.profile.schoolName,
                }
            }), [
                {key: "id", label: "ID aplikacji"},
                {key: "candidateId", label: "ID kandydata"},
                {key: "candidateFirstName", label: "Imię kandydata"},
                {key: "candidateLastName", label: "Nazwisko kandydata"},
                {key: "profileId", label: "ID profilu"},
                {key: "profileName", label: "Nazwa profilu"},
                {key: "schoolId", label: "ID szkoły"},
                {key: "schoolName", label: "Nazwa szkoły"},
                {key: "points", label: "Punkty rekrutacyjne"},
                {key: "priority", label: "Priorytet aplikacji"},
                {key: "status", label: "Status aplikacji"},
            ]
        )

        const link = document.createElement('a')
        link.href = 'data:text/csv,' + encodeURIComponent(csv)
        link.download = 'enrollment.csv'
        link.click()
    };

    if (loading) return <LoadingPage/>

    return (
        <form>
            <div className="horizontal">
                <Button
                    onClick={handleEnrollClick}
                >
                    Zacznij nabór
                </Button>
                {enrollmentInfo && enrollmentInfo.length > 0 && (
                <Button
                    onClick={handleExportClick}
                >
                    Eksportuj
                </Button>
                )}
            </div>
            {successMessage && (<SuccessMessage message={successMessage}/>)}

            {enrollmentInfo && enrollmentInfo.length > 0 && (
                <>
                <table>
                    <thead>
                    <tr>
                        <th>id<br/>aplikacji</th>
                        <th>id<br/>kandydata</th>
                        <th>imię</th>
                        <th>nazwisko</th>
                        <th>nazwa<br/>profilu</th>
                        <th>nazwa szkoły</th>
                        <th>punkty</th>
                        <th>priorytet</th>
                        <th>status</th>
                    </tr>
                    </thead>
                    <tbody>
                    {enrollmentInfo.map((application) => (
                        <tr key={application.id}>
                            <td>{application.id}</td>
                            <td>{application.candidate.id}</td>
                            <td>{application.candidate.firstName}</td>
                            <td>{application.candidate.lastName}</td>
                            <td>{application.profile.name}</td>
                            <td>{application.profile.schoolName}</td>
                            <td>{application.points}</td>
                            <td>{application.priority}</td>
                            <td>{application.status}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                </>
            )}
        </form>
    );
};

export default Enroll;
