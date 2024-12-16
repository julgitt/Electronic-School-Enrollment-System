import {School} from "../types/schoolRequest.ts";

export const updateSchools = async (schools: School[]) => {
    const response = await fetch(`api/schools`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(schools),
    });
    if (!response.ok) throw new Error((await response.json()).message || 'Błąd zapisywania zmian');
};
