import { useEffect, useState } from 'react';
import {useFetch} from "./useFetch.ts";

export const useDeadlineCheck = () => {
    const [isPastDeadline, setIsPastDeadline] = useState(false);
    const { data: deadlineData, loading, error } = useFetch<{ deadline: string | number }>('/api/deadline');

    const deadline = deadlineData?.deadline;
    useEffect(() => {
        if (deadline) {
            const deadlineDate = new Date(deadline);
            setIsPastDeadline(new Date() > deadlineDate);
        }
    }, [deadline]);

    return { isPastDeadline, loading, error };
};
