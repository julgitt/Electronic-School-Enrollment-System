import React, {useEffect, useState} from 'react';

import {Enrollment} from "../../../../shared/types/enrollment.ts";
import LoadingPage from "../../../../app/routes/LoadingPage.tsx";
import {useFetch} from "../../../../shared/hooks/useFetch.ts";
import {updateEnrollments} from "../../../../shared/services/deadlineService.ts";
import EditEnrollmentForm from "../../forms/EditEnrollmentForm.tsx";

const EditDeadlines: React.FC = () => {
    const {data: enrollments, loading: enrollmentLoading} = useFetch<Enrollment[]>('api/enrollments');
    const [updatedEnrollments, setUpdatedEnrollments] = useState<Enrollment[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        if (enrollments && enrollments.length > 0) {
            setUpdatedEnrollments(enrollments);
        }
    }, [enrollments]);

    if (enrollmentLoading) return <LoadingPage/>;


    const handleEnrollmentChange = (id: number, field: string, value: string) => {
        const updated = updatedEnrollments.map(enrollment =>
            enrollment.id === id ? {...enrollment, [field]: value} : enrollment
        );
        setUpdatedEnrollments(updated);
    };

    const handleAddEnrollment = () => {
        const newEnrollment: Enrollment = {
            id: Date.now(),
            round: 0,
            startDate: new Date(),
            endDate: new Date()
        };
        setUpdatedEnrollments([...updatedEnrollments, newEnrollment]);
    };

    const handleDeleteEnrollment = (id: number) => {
        const updated = updatedEnrollments.filter(enrollment => enrollment.id !== id);
        setUpdatedEnrollments(updated);
    };

    const handleSave = async () => {
        setError(null);
        setLoading(true);
        try {
            await updateEnrollments(updatedEnrollments);

            setSuccessMessage("Zapisano zmiany");
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUndo = async () => {
        if (enrollments && enrollments.length > 0) {
            setUpdatedEnrollments(enrollments);
        }
    }

    return (
        <EditEnrollmentForm
            updatedEnrollments={updatedEnrollments}
            error={error}
            loading={loading}
            onEnrollmentChange={handleEnrollmentChange}
            onAddEnrollment={handleAddEnrollment}
            onDeleteEnrollment={handleDeleteEnrollment}
            onSave={handleSave}
            onUndo={handleUndo}
            successMessage={successMessage}
        />
    );
};

export default EditDeadlines;
