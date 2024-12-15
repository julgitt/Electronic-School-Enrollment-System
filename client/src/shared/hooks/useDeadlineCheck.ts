import {useFetch} from "./useFetch.ts";

export const useDeadlineCheck = (shouldFetch?: boolean) => {
    const {data, loading} = useFetch<{ isPastDeadline: boolean }>('/api/isPastDeadline', shouldFetch);
    const isPastDeadline = data?.isPastDeadline!;

    return {isPastDeadline, loading};
};
