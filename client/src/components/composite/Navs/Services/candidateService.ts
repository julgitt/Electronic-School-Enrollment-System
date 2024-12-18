export const switchCandidate = async (candidateId: number) => {
    const response = await fetch(`/api/candidate/${candidateId}`, {
        method: 'GET',
    })
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Błąd podczas zmiany kandydata.');
    }
};

export const deleteCandidate = async (candidateId: number) => {
    const response = await fetch(`/api/candidate/${candidateId}`, {
        method: 'DELETE',
    })
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Błąd podczas usuwania kandydata.');
    }
    window.location.reload();
};