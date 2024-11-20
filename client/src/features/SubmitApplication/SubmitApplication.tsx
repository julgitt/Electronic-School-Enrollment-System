import React from 'react';

import { useFetch } from "../../shared/hooks/useFetch";
import {useApplicationForm} from "./hooks/useApplicationForm.ts";
import { School } from "../../shared/types/school";

import SelectionForm from "./forms/SelectionForm.tsx";
import PersonalForm from "./forms/PersonalForm.tsx";
import ErrorPage from "../../app/routes/ErrorPage.tsx";
import LoadingPage from "../../app/routes/LoadingPage.tsx";
import ApplicationSubmittionPastDeadline from "./ApplicationSubmittionPastDeadline.tsx";
import { useDeadlineCheck } from "./hooks/useDeadlineCheck.ts";
import {SchoolSelection} from "./types/schoolSelection.ts";

const SubmitApplication: React.FC = () => {
    const {
        data: submission, loading: applicationLoading, authorized,
        error: submissionFetchError
    } = useFetch<SchoolSelection[]>('/api/allSubmissions');
    const { data: suggestions, loading: schoolLoading, error: schoolFetchError } = useFetch<School[]>('/api/schools');
    const { data: deadlineData, loading: deadlineLoading, error: deadlineFetchError } = useFetch<{ deadline: string }>('/api/deadline');

    const isPastDeadline = useDeadlineCheck(deadlineData?.deadline);

    const {
        firstName, lastName, pesel, selections, error, step, loading,
        setFirstName, setLastName, setPesel,
        handleNext, handlePrev, handleSubmit,
        handleSchoolChange, handleAddSchoolSelection,
        handleProfileChange, handlePriorityChange
    } = useApplicationForm(submission || []);

    if (isPastDeadline) return <ApplicationSubmittionPastDeadline/>;
    if (submissionFetchError) return <ErrorPage errorMessage={submissionFetchError} />;
    if (schoolFetchError) return <ErrorPage errorMessage={schoolFetchError} />;
    if (deadlineFetchError) return <ErrorPage errorMessage={deadlineFetchError} />;
    if (applicationLoading || schoolLoading || deadlineLoading || !authorized) return <LoadingPage/>

    return (
        <div>
            {step === 1 ? (
                <PersonalForm
                    firstName={firstName}
                    lastName={lastName}
                    pesel={pesel}
                    error={error}
                    loading={loading}
                    onFirstNameChange={setFirstName}
                    onLastNameChange={setLastName}
                    onPeselChange={setPesel}
                    onSubmit={handleNext}
                />
            ) : (
                <SelectionForm
                    selections={selections}
                    suggestions={suggestions || []}
                    error={error}
                    loading={loading}
                    onSchoolChange={handleSchoolChange}
                    onAddSchool={handleAddSchoolSelection}
                    onProfileChange={handleProfileChange}
                    onPriorityChange={handlePriorityChange}
                    onPrev={handlePrev}
                    onSubmit={handleSubmit}
                />
            )}
        </div>
    );
};

export default SubmitApplication;
