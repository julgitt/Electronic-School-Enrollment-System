export const switchSchool = async (schoolId: number) => {
    const response = await fetch('/api/switchSchool', {
        method: 'POST',
        body: JSON.stringify({schoolId}),
        headers: {'Content-Type': 'application/json'},
    })
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Błąd podczas zmiany szkoły.');
    }
};