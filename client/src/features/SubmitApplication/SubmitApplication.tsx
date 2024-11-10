import React from 'react';

import { useFetch } from "../../hooks/useFetch";
import {useApplicationForm} from "./hooks/useApplicationForm.ts";
import { School } from "../../types/school";
import { Application } from "../../types/application";

import SchoolSelectionForm from "./Forms/SchoolSelectionForm.tsx";
import PersonalForm from "./Forms/PersonalForm.tsx";
import ErrorPage from "../../app/routes/ErrorPage.tsx";
import LoadingPage from "../../app/routes/LoadingPage.tsx";
import SubmittedApplicationPreview from "./SubmittedApplicationPreview.tsx";
import {useDeadlineCheck} from "./hooks/useDeadlineCheck.ts";

const SubmitApplication: React.FC = () => {
    const {
        data: applications, loading: applicationLoading, authorized,
        error: applicationFetchError
    } = useFetch<Application[]>('/api/allApplications');
    const { data: suggestions, loading: schoolLoading, error: schoolFetchError } = useFetch<School[]>('/api/schools');
    const { data: deadlineData, loading: deadlineLoading, error: deadlineFetchError } = useFetch<{ deadline: string }>('/api/deadline');

    const isPastDeadline = useDeadlineCheck(deadlineData?.deadline);

    const {
        firstName, lastName, pesel, schools, error, step, loading,
        setFirstName, setLastName, setPesel,
        handleNext, handlePrev, handleSubmit, handleSuggestionSelected, handleAddSchoolInput
    } = useApplicationForm(applications || []);

    if (applicationLoading || schoolLoading || deadlineLoading || !authorized) return <LoadingPage/>;
    if (isPastDeadline) return <SubmittedApplicationPreview/>;
    if (applicationFetchError) return <ErrorPage errorMessage={applicationFetchError} />;
    if (schoolFetchError) return <ErrorPage errorMessage={schoolFetchError} />;
    if (deadlineFetchError) return <ErrorPage errorMessage={deadlineFetchError} />;

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
                <SchoolSelectionForm
                    schools={schools}
                    error={error}
                    loading={loading}
                    suggestions={suggestions || []}
                    onSchoolChange={handleSuggestionSelected}
                    onAddSchool={handleAddSchoolInput}
                    onPrev={handlePrev}
                    onSubmit={handleSubmit}
                />
            )}
        </div>
    );
};

export default SubmitApplication;
