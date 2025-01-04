import React, {useEffect, useState} from 'react';

import LoadingPage from "../../../../app/routes/LoadingPage.tsx";
import {useFetch} from "../../../../shared/hooks/useFetch.ts";
import {School} from "../../types/schoolRequest.ts";
import EditSchoolForm from "../../forms/EditSchoolForm.tsx";
import {updateSchools} from "../../../../shared/services/schoolService.ts";

const EditSchools: React.FC = () => {
    const {data: schools, loading: schoolsLoading} = useFetch<School[]>('api/schools');
    const [updatedSchools, setUpdatedSchools] = useState<School[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (schools && schools.length > 0) {
            setUpdatedSchools(schools);
        }
    }, [schools]);

    if (schoolsLoading) return <LoadingPage/>;

    const handleAddSchool = () => {
        const newSchool = {id: Date.now(), name: ""};
        setUpdatedSchools([...updatedSchools, newSchool]);
    }

    const handleSchoolChange = (updatedSchool: School) => {
        const updated = updatedSchools.map(school =>
            school.id === updatedSchool.id ? updatedSchool : school
        );
        setUpdatedSchools(updated);
    };

    const handleDeleteSchool = (id: number) => {
        const updated = updatedSchools.filter(school => school.id !== id);
        setUpdatedSchools(updated);
    }

    const handleSave = async () => {
        setLoading(true);
        try {
            await updateSchools(updatedSchools);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    const handleUndo = async () => {
        if (schools && schools.length > 0) {
            setUpdatedSchools(schools);
        }
    }

    return (
        <EditSchoolForm
            updatedSchools={updatedSchools}
            error={error}
            loading={loading}
            onSchoolChange={handleSchoolChange}
            onAddSchool={handleAddSchool}
            onDeleteSchool={handleDeleteSchool}
            onSave={handleSave}
            onUndo={handleUndo}
        />
    );
};

export default EditSchools;
