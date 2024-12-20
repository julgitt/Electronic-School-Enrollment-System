export const deleteApplication = async (id: number) => {
    const response = await fetch(`api/admin/application/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) throw new Error((await response.json()).message || 'Błąd podczas dodawania profilu');
    window.location.reload();

};
