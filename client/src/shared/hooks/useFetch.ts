import { useState, useEffect } from 'react';

import { status } from "../constants/responseStatuses.ts";

interface FetchResult<T> {
    authorized: boolean;
    data: T | null;
    loading: boolean;
    error: string | null;
}

export const useFetch = <T>(endpoint: string): FetchResult<T> => {
    const [data, setData] = useState<T | null>(null);
    const [authorized, setAuthorized] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            const response = await fetch(endpoint, { method: 'GET', credentials: 'include' });

            if (response.ok) {
                const result: T = await response.json();
                if (result) setData(result);
                setAuthorized(true);
            } else if (response.status === status.UNAUTHORIZED) {
                window.location.href = '/login';
            } else {
                const error: any = await response.json();
                setError(error.message)
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [endpoint]);

    return { data, authorized, loading, error };
};
