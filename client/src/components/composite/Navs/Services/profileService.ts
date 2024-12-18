export const switchProfile = async (profileId: number) => {
    const response = await fetch(`/api/admin/profile/${profileId}`, {
        method: 'GET',
    })
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Błąd podczas zmiany profilu.');
    }
};

export const deleteProfile = async (profileId: number) => {
    const response = await fetch(`/api/admin/profile/${profileId}`, {
        method: 'DELETE',
    })
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Błąd podczas zmiany profilu.');
    }
};