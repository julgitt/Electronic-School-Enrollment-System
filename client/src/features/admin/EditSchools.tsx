import React, {useEffect, useState} from 'react';

import LoadingPage from "../../app/routes/LoadingPage.tsx";
import {useFetch} from "../../shared/hooks/useFetch.ts";
import {School} from "./types/schoolRequest.ts";
import {addSchool, deleteSchool, updateSchool} from "./services/schoolService.ts";
import EditSchoolForm from "./forms/EditSchoolForm.tsx";

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

    const handleAddSchool = async (name: string) => {
        setLoading(true);
        try {
            const newSchool = {id: Date.now(), name: name};
            await addSchool(newSchool)
            setUpdatedSchools([...updatedSchools, newSchool]);
        } catch (error: any) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }
    const handleUpdateSchool = async (updatedSchool: School) => {
        setLoading(true);
        try {
            if (updatedSchool.name === "") throw new Error("Nazwa szkoły nie mże być pusta");

            await updateSchool(updatedSchool);
        } catch (error: any) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSchoolChange = async (updatedSchool: School) => {
        const updated = updatedSchools.map(school =>
            school.id === updatedSchool.id ? updatedSchool : school
        );
        setUpdatedSchools(updated);
    };


    const handleDeleteSchool = async (id: number) => {
        setLoading(true);
        try {
            await deleteSchool(id);
            setUpdatedSchools(updatedSchools && updatedSchools.filter(school => school.id !== id));
        } catch (error: any) {
            setError(error.message);
        } finally {
            setLoading(false);
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
            onUpdateSchool={handleUpdateSchool}
        />
    );
};

export default EditSchools;
