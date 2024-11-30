import React from 'react';

import { useFetch } from "../../../shared/hooks/useFetch.ts";

import ErrorPage from "../../../app/routes/ErrorPage.tsx";
import LoadingPage from "../../../app/routes/LoadingPage.tsx";
import SubmitApplicationPastDeadline from "../../application/pages/SubmitApplicationPastDeadline/SubmitApplicationPastDeadline.tsx";
import { useDeadlineCheck } from "../../../shared/hooks/useDeadlineCheck.ts";
import {Subject} from "../types/subject.ts";
import GradeForm from "../components/GradeForm.tsx";
import {useGradeForm} from "../hooks/useGradeForm.ts";

const SubmitGrades: React.FC = (

) => {
    const { loading: submitGradesLoading, authorized, error: submitGradesFetchError} = useFetch('/api/submitGrades');
    const { data: subjects, loading: subjectsLoading, error: subjectsFetchError } = useFetch<Subject[]>('/api/subjects');

    const {isPastDeadline, loading : deadlineLoading, error: deadlineFetchError} = useDeadlineCheck();

    const {
        error, loading, handleSubmit,
        grades, handleGradesChange,
    } = useGradeForm(subjects || []);

    if (isPastDeadline) return <SubmitApplicationPastDeadline/>;
    if (deadlineFetchError) return <ErrorPage errorMessage={deadlineFetchError} />;
    if (subjectsFetchError) return <ErrorPage errorMessage={subjectsFetchError} />;
    if (submitGradesFetchError) return <ErrorPage errorMessage={submitGradesFetchError} />;
    if (loading || deadlineLoading || subjectsLoading|| submitGradesLoading|| !authorized) return <LoadingPage/>

    return (
        <div>
            <GradeForm
                subjects = { subjects! }
                grades = { grades }
                error = { error }
                loading = { loading }
                onGradesChange  = { handleGradesChange }
                onSubmit = { handleSubmit }
            />
        </div>
    );
};

export default SubmitGrades;
