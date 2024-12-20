export const switchProfile = async (profileId: number) => {
    const response = await fetch(`/api/admin/profile/${profileId}`, {
        method: 'GET',
    })
    if (!response.ok) throw new Error((await response.json()).message || 'Błąd podczas zmiany profilu.');
};

export const deleteProfile = async (profileId: number) => {
    const response = await fetch(`/api/admin/profile/${profileId}`, {
        method: 'DELETE',
    });
    if (!response.ok) throw new Error((await response.json()).message || 'Błąd podczas zmiany profilu.');
};