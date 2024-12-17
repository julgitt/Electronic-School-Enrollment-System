import React, {useEffect, useState} from 'react';

import LoadingPage from "../../app/routes/LoadingPage.tsx";
import {useFetch} from "../../shared/hooks/useFetch.ts";
import EditProfileForm from "./forms/EditProfileForm.tsx";
import {updateProfiles} from "./services/profileService.ts";
import {Profile} from "./types/profileRequest.ts";

const EditProfiles: React.FC = () => {
    const {data: profiles, loading: profilesLoading} = useFetch<Profile[]>('api/profiles');
    const [updatedProfiles, setUpdatedProfiles] = useState<Profile[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (profiles && profiles.length > 0) {
            setUpdatedProfiles(profiles);
        }
    }, [profiles]);

    if (profilesLoading) return <LoadingPage/>;

    const handleAddProfile = () => {
        const newProfile = {id: Date.now(), name: "", criteria: []};
        setUpdatedProfiles([...updatedProfiles, newProfile]);
    }

    const handleProfileChange = (id: number, field: string, value: string) => {
        const updated = updatedProfiles.map(profile =>
            profile.id === id ? {...profile, [field]: value} : profile
        );
        setUpdatedProfiles(updated);
    };

    const handleDeleteProfile = (id: number) => {
        const updated = updatedProfiles.filter(profile => profile.id !== id);
        setUpdatedProfiles(updated);
    }

    const handleSave = async () => {
        setLoading(true);
        try {
            await updateProfiles(updatedProfiles);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    const handleUndo = async () => {
        if (profiles && profiles.length > 0) {
            setUpdatedProfiles(profiles);
        }
    }

    return (
        <EditProfileForm
            updatedProfiles={updatedProfiles}
            error={error}
            loading={loading}
            onProfileChange={handleProfileChange}
            onAddProfile={handleAddProfile}
            onDeleteProfile={handleDeleteProfile}
            onSave={handleSave}
            onUndo={handleUndo}
        />
    );
};

export default EditProfiles;
