export const submitApplication = async (
    schools: number[],
    pesel: string,
    firstName: string,
    lastName: string,
) => {
    if (schools.every(school => school === -1)) {
        throw new Error('Proszę wybrać przynajmniej jedną szkołę.');
    }

    const response = await fetch('/api/submitApplication', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            txtFirstName: firstName,
            txtLastName: lastName,
            txtPesel: pesel,
            txtSchools: schools
        }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Błąd podczas składania aplikacji.');
    }

    return data;
}