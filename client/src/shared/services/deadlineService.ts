import {Enrollment} from "../types/enrollment.ts";

export const updateEnrollments = async (enrollments: Enrollment[]) => {
    const response = await fetch(`api/enrollments`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(enrollments),
    });
    if (!response.ok) throw new Error((await response.json()).message || 'Błąd zapisywania zmian');
};
