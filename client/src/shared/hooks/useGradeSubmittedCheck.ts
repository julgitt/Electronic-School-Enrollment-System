import {useFetch} from "./useFetch.ts";

export const useGradeSubmittedCheck = (isAuthorized: boolean) => {
    const {data, loading, error} = useFetch<{ gradesSubmitted: boolean }>('/api/gradesSubmitted', isAuthorized);
    const areGradesSubmitted = data?.gradesSubmitted!;

    return {areGradesSubmitted, loading, error};
};
