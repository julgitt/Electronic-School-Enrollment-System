import {UserSelectedProfile} from "../../features/application/types/userSelectedProfile.ts";

export const submitApplication = async (
    selections: UserSelectedProfile[],
) => {
    if (selections.length === 0) throw new Error('Proszę wybrać przynajmniej jeden profil.');

    const response = await fetch('/api/application', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(selections),
    });

    const data = await response.json();

    if (!response.ok) throw new Error(data.message || 'Błąd podczas składania aplikacji.');

    return data;
}

export const updateApplication = async (
    selections: UserSelectedProfile[]
) => {
    if (selections.length === 0) throw new Error('Proszę wybrać przynajmniej jeden profil.');

    const response = await fetch('/api/application', {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(selections),
    });

    const data = await response.json();

    if (!response.ok) throw new Error(data.message || 'Błąd podczas składania aplikacji.');

    return data;
}

export const rejectApplication = async (id: number) => {
    const response = await fetch(`api/admin/application/${id}`, {
        method: 'PUT',
    });
    if (!response.ok) throw new Error((await response.json()).message || 'Błąd podczas odrzucania aplikacji');
    window.location.reload();
};
