import {Profile} from "../../../shared/types/profile.ts";

export const updateProfiles = async (profiles: Profile[]) => {
    const response = await fetch(`api/profiles`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(profiles),
    });
    if (!response.ok) throw new Error((await response.json()).message || 'Błąd zapisywania zmian');
};
