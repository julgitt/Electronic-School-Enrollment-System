export const switchCandidate = async (candidateId: number) => {
    const response = await fetch(`/api/candidate/${candidateId}`, {
        method: 'GET',
    })
    if (!response.ok) throw new Error((await response.json()).message || 'Błąd podczas zmiany kandydata.');
};

export const deleteCandidate = async (candidateId: number) => {
    const response = await fetch(`/api/candidate/${candidateId}`, {
        method: 'DELETE',
    })
    if (!response.ok) throw new Error((await response.json()).message || 'Błąd podczas usuwania kandydata.');
    window.location.reload();
};