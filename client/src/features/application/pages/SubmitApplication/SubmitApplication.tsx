import React from 'react';

import {useFetch} from "../../../../shared/hooks/useFetch.ts";
import {useApplicationForm} from "../../hooks/useApplicationForm.ts";
import {School} from "../../../../shared/types/school.ts";

import SelectionForm from "../../components/SelectionForm.tsx";
import LoadingPage from "../../../../app/routes/LoadingPage.tsx";
import SubmitApplicationPastDeadline from "../SubmitApplicationPastDeadline/SubmitApplicationPastDeadline.tsx";
import {useDeadlineCheck} from "../../../../shared/hooks/useDeadlineCheck.ts";
import {ProfilesSelection} from "../../types/profilesSelection.ts";

const SubmitApplication: React.FC = () => {
    const {
        data: submission, loading: applicationLoading, authorized,
    } = useFetch<ProfilesSelection[]>('/api/submissions');
    const {data: suggestions, loading: schoolLoading} = useFetch<School[]>('/api/schools');
    const {isPastDeadline, loading: deadlineLoading} = useDeadlineCheck();
    const {
        selections, error, loading,
        handleSubmit,
        handleSchoolChange, handleAddSchoolSelection,
        handleProfileChange, handlePriorityChange,
        successMessage
    } = useApplicationForm(submission || []);

    if (isPastDeadline) return <SubmitApplicationPastDeadline/>;
    if (applicationLoading || schoolLoading || deadlineLoading || !authorized) return <LoadingPage/>

    return (
        <SelectionForm
            selections={selections}
            suggestions={suggestions || []}
            error={error}
            loading={loading}
            onSchoolChange={handleSchoolChange}
            onAddSchool={handleAddSchoolSelection}
            onProfileChange={handleProfileChange}
            onPriorityChange={handlePriorityChange}
            onSubmit={handleSubmit}
            successMessage={successMessage}
        />
    );
};

export default SubmitApplication;
