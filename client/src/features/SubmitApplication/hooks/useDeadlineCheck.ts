import { useEffect, useState } from 'react';

export const useDeadlineCheck = (deadline: string | undefined) => {
    const [isPastDeadline, setIsPastDeadline] = useState(false);

    useEffect(() => {
        if (deadline) {
            const deadlineDate = new Date(deadline);
            setIsPastDeadline(new Date() > deadlineDate);
        }
    }, [deadline]);

    return isPastDeadline;
};
