import {useEffect, useState} from 'react';

import {status} from "../constants/responseStatuses.ts";
import {useError} from "../providers/errorProvider.tsx";

interface FetchResult<T> {
    authorized: boolean;
    data: T | null;
    loading: boolean;
}

export const useFetch = <T>(endpoint: string, shouldFetch: boolean = true): FetchResult<T> => {
    const {setError} = useError();
    const [data, setData] = useState<T | null>(null);
    const [authorized, setAuthorized] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);

    const fetchData = async (shouldFetch: boolean) => {
        try {
            if (!shouldFetch) return;
            console.log(endpoint)
            const response = await fetch(endpoint, {
                method: 'GET',
                credentials: 'include'
            });

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
        fetchData(shouldFetch);
    }, [endpoint, shouldFetch]);

    return {data, authorized, loading};
};
