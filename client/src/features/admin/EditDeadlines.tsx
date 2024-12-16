import React, {useState} from 'react';

import {Enrollment} from "../../shared/types/enrollment.ts";
import LoadingPage from "../../app/routes/LoadingPage.tsx";
import {useFetch} from "../../shared/hooks/useFetch.ts";
import {Button} from "../../components/atomic/Button";
import {InputField} from "../../components/atomic/InputField";

const EditDeadlines: React.FC = () => {
    const {data: enrollments, loading} = useFetch<Enrollment[]>('api/deadlines');
    const [editedEnrollments, setEditedEnrollments] = useState<Enrollment[] | null>(null);

    if (loading) return <LoadingPage/>;

    if (!editedEnrollments && enrollments) {
        setEditedEnrollments(enrollments);
    }

    const handleInputChange = (id: number, field: string, value: string) => {
        if (editedEnrollments) {
            const updatedEnrollments = editedEnrollments.map(enrollment =>
                enrollment.id === id ? {...enrollment, [field]: value} : enrollment
            );
            setEditedEnrollments(updatedEnrollments);
        }
    };

    const addEnrollment = () => {
        if (editedEnrollments) {
            const newEnrollment: Enrollment = {
                id: -1,
                round: 0,
                startDate: new Date(),
                endDate: new Date()
            };
            setEditedEnrollments([...editedEnrollments, newEnrollment]);
        }
    };

    const removeEnrollment = (id: number) => {
        if (editedEnrollments) {
            const updatedEnrollments = editedEnrollments.filter(enrollment => enrollment.id !== id);
            setEditedEnrollments(updatedEnrollments);
        }
    };

    const saveChanges = async () => {
        if (!editedEnrollments) return;

        const newEnrollments = editedEnrollments.filter(enrollment => enrollment.id === -1);
        const updatedEnrollments = editedEnrollments.filter(enrollment => enrollment.id !== 0);

        for (const enrollment of newEnrollments) {
            const response = await fetch('api/deadlines', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    round: enrollment.round,
                    startDate: enrollment.startDate,
                    endDate: enrollment.endDate,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to save new enrollment');
            }
        }

        for (const enrollment of updatedEnrollments) {
            const response = await fetch(`api/deadlines/${enrollment.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(enrollment),
            });

            if (!response.ok) {
                throw new Error('Failed to update enrollment');
            }
        }
    };

    return (
        <div>
            <h1>Edytuj terminy</h1>
            <Button onClick={addEnrollment}>Dodaj turę</Button>
            <table>
                <thead>
                <tr>
                    <th>Tura</th>
                    <th>Data rozpoczęcia</th>
                    <th>Data zakończenia</th>
                    <th>Akcja</th>
                </tr>
                </thead>
                <tbody>
                {editedEnrollments && editedEnrollments.map(enrollment => (
                    <tr key={enrollment.id}>
                        <td>
                            <InputField
                                type="number"
                                placeholder="1"
                                value={enrollment.round}
                                onChange={(e) => handleInputChange(enrollment.id, 'round', e.target.value)}
                            />
                        </td>
                        <td>
                            <InputField
                                type="date"
                                value={new Date(enrollment.startDate).toISOString().split('T')[0]}
                                onChange={(e) => handleInputChange(enrollment.id, 'startDate', e.target.value)}
                            />
                        </td>
                        <td>
                            <input
                                type="date"
                                value={new Date(enrollment.endDate).toISOString().split('T')[0]}
                                onChange={(e) => handleInputChange(enrollment.id, 'endDate', e.target.value)}
                            />
                        </td>
                        <td>
                            <Button onClick={() => removeEnrollment(enrollment.id)}>Usuń</Button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
            <Button onClick={saveChanges}>Zapisz zmiany</Button>
        </div>
    );
};

export default EditDeadlines;
