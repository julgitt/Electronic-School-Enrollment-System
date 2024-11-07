import React from 'react';

import { useFetch } from "../../hooks/useFetch";
import {useApplicationForm} from "./hooks/useApplicationForm.ts";
import { School } from "../../types/school";
import { Application } from "../../types/application";

import SchoolSelectionForm from "./Forms/SchoolSelectionForm.tsx";
import PersonalForm from "./Forms/PersonalForm.tsx";
import ErrorPage from "../../app/routes/ErrorPage.tsx";
import LoadingPage from "../../app/routes/LoadingPage.tsx";

const SubmitApplication: React.FC = () => {
    const { loading: applicationLoading, authorized, error: applicationFetchError } = useFetch<Application[]>('/api/application');
    const { data: suggestions, loading: schoolLoading, error: schoolFetchError } = useFetch<School[]>('/api/schools');

    const {
        firstName,
        lastName,
        pesel,
        schools,
        error,
        step,
        loading,
        setFirstName,
        setLastName,
        setPesel,
        handleNext,
        handlePrev,
        handleSubmit,
        handleSuggestionSelected,
        handleAddSchoolInput
    } = useApplicationForm();


    if (applicationLoading || schoolLoading || !authorized) {
        return <LoadingPage/>;
    }
    if (applicationFetchError) {
        return <ErrorPage errorMessage={applicationFetchError} />;
    } else if (schoolFetchError) {
        return <ErrorPage errorMessage={schoolFetchError} />;
    }

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
