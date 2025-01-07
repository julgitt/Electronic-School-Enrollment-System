export function ToCSV<T>(data: T[], headers: {key: keyof T, label: string}[]): string {
    const dataRows = data.map((row) =>
        headers.map(h => {
            const value = row[h.key];
            return (typeof value === "string"? `\"${value.replace(/"/g, '\"\"')}\"` : value)
        }).join(',')
    );
    return [headers.map(h => h.label).join(','), ...dataRows].join('\n');
}