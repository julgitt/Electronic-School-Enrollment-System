import React, {useEffect, useState} from 'react';

import LoadingPage from "../../../app/routes/LoadingPage.tsx";
import {useFetch} from "../../../shared/hooks/useFetch.ts";
import ProfileForm from "../forms/ProfileForm.tsx";
import {Profile, ProfileCriteriaType} from "../types/profileRequest.ts";
import {useFormData} from "../../../shared/hooks/useFormData.ts";
import {Subject} from "../../grades/types/subject.ts";
import {updateProfile} from "../services/profileService.ts";

const EditProfile: React.FC = () => {
    const {data: profile, loading: profileLoading} = useFetch<Profile>("/api/admin/profile");
    const {data: subjects, loading: subjectsLoading} = useFetch<Subject[]>('/api/subjects');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const { formData, handleChange, updateListField, setFormData } = useFormData<Profile>({
        id: 0,
        name: "",
        capacity: 0,
        criteria: [],
    });

    useEffect(() => {
        if (profile) setFormData(profile);
    }, [profile])

    if (subjectsLoading || profileLoading) return <LoadingPage/>

    const handleCriteriaChange = (subjectId: number, type: ProfileCriteriaType, checked: boolean) => {
        updateListField('criteria', (currentCriteria) => {
            if (!Array.isArray(currentCriteria)) return currentCriteria;
            if (checked) {
                return [
                    ...currentCriteria.filter(criterion => criterion.subjectId !== subjectId),
                    { subjectId, type }
                ];
            } else {
                return currentCriteria.filter(
                    (criterion) => !(criterion.subjectId === subjectId && criterion.type === type)
                );
            }
        });
    };

    const handleSave = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await updateProfile(formData);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section id="form">
            <ProfileForm
                subjects={subjects || []}
                formData={formData}
                error={error}
                loading={loading}
                onInputChange={handleChange}
                onCriteriaChange={handleCriteriaChange}
                onSubmit={handleSave}
            />
        </section>
    );
};

export default EditProfile;
