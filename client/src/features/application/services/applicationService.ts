import {UserSelectedProfile} from "../types/userSelectedProfile.ts";

export const submitApplication = async (
    selections: UserSelectedProfile[],
) => {
    if (selections.length === 0) {
        throw new Error('Proszę wybrać przynajmniej jeden profil.');
    }

    const response = await fetch('/api/submitApplication', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(selections),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Błąd podczas składania aplikacji.');
    }

    return data;
}

export const updateApplication = async (
    selections: UserSelectedProfile[]
) => {
    if (selections.length === 0) {
        throw new Error('Proszę wybrać przynajmniej jeden profil.');
    }

    const response = await fetch('/api/updateApplication', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(selections),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Błąd podczas składania aplikacji.');
    }

    return data;
}