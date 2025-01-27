import React, {useState} from 'react';
import {NavLink as Link} from "react-router-dom";

import styles from '../../modules/Header/Header.module.scss';
import {SchoolDropdown} from "../Dropdown/SchoolDropdown";
import {useFetch} from "../../../shared/hooks/useFetch.ts";
import {useError} from "../../../shared/providers/errorProvider.tsx";
import {switchSchool} from "./Services/schoolService.ts";
import {Profile} from "../../../shared/types/profile.ts";
import {ProfileDropdown} from "../Dropdown/ProfileDropdown";
import {deleteProfile, switchProfile} from "./Services/profileService.ts";
import {School} from "../../../features/admin/types/schoolRequest.ts";

const SchoolAdminNav: React.FC<{ renderLogoutLink: () => JSX.Element; }> = ({renderLogoutLink}) => {
    const {setError} = useError();
    const {data: school, loading: schoolLoading} = useFetch<School>('api/admin/school');
    const {data: schools, loading: schoolsLoading} = useFetch<School[]>('api/admin/schools', !!school);
    const {data: profile, loading: profileLoading} = useFetch<Profile>('api/admin/profile', !!school);
    const {data: profiles, loading: profilesLoading} = useFetch<Profile[]>('api/admin/profiles', !!school);
    const [fetchingLoading, setFetchingLoading] = useState(false)
    const loading = profileLoading || schoolLoading || schoolsLoading || fetchingLoading || profilesLoading;


    const handleSwitch = async (id: number) => {
        setFetchingLoading(true);
        setError(null);

        try {
            await switchSchool(id);
            window.location.reload();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setFetchingLoading(false);
        }
    };

    const handleSwitchProfile = async (id: number) => {
        setFetchingLoading(true);
        setError(null);

        try {
            await switchProfile(id);
            window.location.reload();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setFetchingLoading(false);
        }
    };

    const handleDeleteProfile = async (id: number) => {
        setFetchingLoading(true);
        setError(null);

        try {
            await deleteProfile(id);
            window.location.reload();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setFetchingLoading(false);
        }
    };

    if (loading) return <div></div>

    return (
        <nav className={styles.nav}>
            <div className={styles.navMenu}>
                {school && (
                    <>
                        <SchoolDropdown
                            currentSchool={school}
                            schools={schools || []}
                            onSelectSchool={handleSwitch}
                        />
                         <ProfileDropdown
                                    currentProfile={profile || {} as Profile}
                                    profiles={profiles || []}
                                    onSelectProfile={handleSwitchProfile}
                                    onDeleteProfile={handleDeleteProfile}
                        />
                        {profile && profile.id && (
                            <>
                                <Link className={styles.navLink} to="/profileCandidates">Kandydaci</Link>
                            </>
                        )}
                    </>
                )}
            </div>
            <div className={styles.navMenu}>
                {renderLogoutLink()}
            </div>
        </nav>
    );
}

export default SchoolAdminNav;
