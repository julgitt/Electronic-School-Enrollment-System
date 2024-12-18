import React, {useState} from "react";
import {useFormData} from "../../../shared/hooks/useFormData.ts";
import {addProfile} from "../services/profileService.ts";
import {Profile, ProfileCriteriaType} from "../types/profileRequest.ts";
import ProfileForm from "../forms/ProfileForm.tsx";
import LoadingPage from "../../../app/routes/LoadingPage.tsx";
import {useFetch} from "../../../shared/hooks/useFetch.ts";
import {Subject} from "../../grades/types/subject.ts";

const AddProfile: React.FC = () => {
    const {data: subjects, loading: subjectsLoading} = useFetch<Subject[]>('/api/subjects');
    const {formData, handleChange, updateListField} = useFormData<Profile>({
        id: 0,
        name: '',
        capacity: 0,
        criteria: []
    });
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

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

    const handleAdd = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await addProfile(formData);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (subjectsLoading) return <LoadingPage/>

    return (
        <section id="form">
            <ProfileForm
                subjects={subjects || []}
                formData={formData}
                error={error}
                loading={loading}
                onInputChange={handleChange}
                onCriteriaChange={handleCriteriaChange}
                onSubmit={handleAdd}
            />
        </section>
    );
};

export default AddProfile;
