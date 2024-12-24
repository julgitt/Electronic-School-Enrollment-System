import React, {useState} from "react";
import LoadingPage from "../../../app/routes/LoadingPage.tsx";
import {useFetch} from "../../../shared/hooks/useFetch.ts";
import {useFormData} from "../../../shared/hooks/useFormData.ts";
import {ProfileCriteriaType} from "../types/profileRequest.ts";

const withProfileForm = (WrappedComponent: React.FC<any>, saveCallback: (data: any) => Promise<void>, fetchUrl?: string) => {
    return () => {
        const { data: profile, loading: profileLoading } = useFetch(fetchUrl, fetchUrl!!);
        const { data: subjects, loading: subjectsLoading } = useFetch<Subject[]>('/api/subjects');
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
        }, [profile]);

        if (subjectsLoading || profileLoading) return <LoadingPage />;

        const handleCriteriaChange = (subjectId: number, type: ProfileCriteriaType, checked: boolean) => {
            updateListField('criteria', (currentCriteria) => {
                if (!Array.isArray(currentCriteria)) return currentCriteria;
                const mandatoryCount = currentCriteria.filter(criterion => criterion.type === ProfileCriteriaType.Mandatory).length;
                const alternativeCount = currentCriteria.filter(criterion => criterion.type === ProfileCriteriaType.Alternative).length;
                if (checked) {
                    if (type == ProfileCriteriaType.Mandatory && mandatoryCount >= 4) {
                        setError("Można dodać maksymalnie 4 przedmioty obowiązkowe.");
                        return currentCriteria;
                    } else if (type == ProfileCriteriaType.Mandatory && mandatoryCount >= 3 && alternativeCount > 0) {
                        setError("Jeżeli jakiś przedmiot jest oznaczony jako alternatywny, obowiązują 3 przedmioty obowiązkowe.");
                    } else if (type == ProfileCriteriaType.Alternative && mandatoryCount >= 4) {
                        setError("Jeżeli są 4 przedmioty obowiązkowe, nie można wybrać przedmiotu alternatywnego." );
                        return currentCriteria;
                    }
                    return [
                        ...currentCriteria.filter(criterion => criterion.subjectId !== subjectId),
                        {subjectId, type}
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
                await saveCallback(formData);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        return (
            <ProfileForm
                subjects={subjects || []}
                formData={formData}
                error={error}
                loading={loading}
                onInputChange={handleChange}
                onCriteriaChange={handleCriteriaChange}
                onSubmit={handleSave}
            />
        );
    };
};

export default withProfileForm
