import {Profile} from "../types/profileRequest.ts";

export const updateProfile = async (profile: Profile) => {
    const response = await fetch(`api/admin/profile/${profile.id}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(profile),
    });
    if (!response.ok) throw new Error((await response.json()).message || 'Błąd zapisywania zmian');
    window.location.reload();
};

export const addProfile = async (profile: Profile) => {
    const response = await fetch(`api/admin/profile`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(profile),
    });
    if (!response.ok) throw new Error((await response.json()).message || 'Błąd podczas dodawania profilu');
    window.location.reload();

};
