export const switchCandidate = async (candidateId: number) => {
    const response = await fetch('/api/switchCandidate', {
        method: 'POST',
        body: JSON.stringify({candidateId}),
        headers: {'Content-Type': 'application/json'},
    })
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Błąd podczas zmiany kandydata.');
    }
};

export const deleteCandidate = async (candidateId: number) => {
    const response = await fetch('/api/candidate', {
        method: 'DELETE',
        body: JSON.stringify({candidateId}),
        headers: {'Content-Type': 'application/json'},
    })
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Błąd podczas usuwania kandydata.');
    }
    window.location.reload();
};