export const submitApplication = async (
    schoolIds: number[],
    pesel: string,
    firstName: string,
    lastName: string,
) => {
    if (schoolIds.length === 0) {
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
            txtSchools: schoolIds
        }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Błąd podczas składania aplikacji.');
    }

    return data;
}

export const updateApplication = async (
    schoolIds: number[],
    pesel: string,
    firstName: string,
    lastName: string,
) => {
    if (schoolIds.length === 0) {
        throw new Error('Proszę wybrać przynajmniej jedną szkołę.');
    }

    const response = await fetch('/api/updateApplication', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            txtFirstName: firstName,
            txtLastName: lastName,
            txtPesel: pesel,
            txtSchools: schoolIds
        }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Błąd podczas składania aplikacji.');
    }

    return data;
}