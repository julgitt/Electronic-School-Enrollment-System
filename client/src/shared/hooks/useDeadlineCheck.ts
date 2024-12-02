import { useEffect, useState } from 'react';
import {useFetch} from "./useFetch.ts";

export const useDeadlineCheck = (shouldFetch?: boolean) => {
    const [isPastDeadline, setIsPastDeadline] = useState(false);
    const { data: deadlineData, loading, error } = useFetch<{ deadline: string | number }>('/api/deadline', shouldFetch);

    const deadline = deadlineData?.deadline;
    useEffect(() => {
        if (deadline) {
            const deadlineDate = new Date(deadline);
            setIsPastDeadline(new Date() > deadlineDate);
        }
    }, [deadline]);

    return { isPastDeadline, loading, error };
};
