import { useEffect, useState } from 'react';
import { useFetch } from "./useFetch.ts";

export const useGradeSubmittedCheck = (isAuthorized: boolean) => {
    const [areGradesSubmitted, setIsSubmitted] = useState(true);
    const { data, loading, error } = useFetch<{ gradesSubmitted: boolean }>('/api/gradesSubmitted', isAuthorized);

    const submitted = data?.gradesSubmitted || true;
    useEffect(() => {
        setIsSubmitted(submitted);
    }, [submitted]);

    return { areGradesSubmitted, loading, error };
};
