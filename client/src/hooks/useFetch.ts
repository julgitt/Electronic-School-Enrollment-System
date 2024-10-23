import { useState, useEffect } from 'react';

interface FetchResult<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
}

export const useFetch = <T>(endpoint: string): FetchResult<T> => {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(endpoint);

                if (!response.ok) {
                    setError(`Error: ${response.status} ${response.statusText}`);
                    return;
                }
                const result: T = await response.json();
                setData(result);
            } catch (err) {
                setError('Failed to fetch data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [endpoint]);

    return { data, loading, error };
};
