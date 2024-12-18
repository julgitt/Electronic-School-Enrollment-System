export const switchSchool = async (schoolId: number) => {
    const response = await fetch(`/api/admin/school/${schoolId}`, {
        method: 'GET',
    })
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Błąd podczas zmiany szkoły.');
    }
};