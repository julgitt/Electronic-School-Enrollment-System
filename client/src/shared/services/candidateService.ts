import {Candidate} from "../types/candidate.ts";

export const register = async (formData: Candidate) => {
    const response = await fetch('/api/candidate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
    });
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Błąd podczas rejestracji kandydata.');
    }

    return data;
}