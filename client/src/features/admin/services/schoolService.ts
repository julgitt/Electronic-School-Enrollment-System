import {School} from "../types/schoolRequest.ts";

export const deleteSchool = async (id: number) => {
    const response = await fetch(`api/school/${id}`, {method: 'DELETE'});
    if (!response.ok) throw new Error((await response.json()).message || 'Błąd usuwania szkoły');
};

export const addSchool = async (school: School) => {
    const response = await fetch('api/school', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(school),
    });
    if (!response.ok) throw new Error((await response.json()).message || 'Błąd dodawania szkoły');
};

export const updateSchool = async (school: School) => {
    const response = await fetch(`api/school/${school.id}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(school),
    });
    if (!response.ok) throw new Error((await response.json()).message || 'Błąd zapisywania zmian');
};
