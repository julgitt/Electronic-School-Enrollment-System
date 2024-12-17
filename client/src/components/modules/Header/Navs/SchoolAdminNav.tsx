import React, {useState} from 'react';
import {NavLink as Link} from "react-router-dom";

import styles from '../Header.module.scss';
import {SchoolDropdown} from "../../../composite/SchoolDropdown";
import {useFetch} from "../../../../shared/hooks/useFetch.ts";
import {School} from "../../../../shared/types/school.ts";
import {useError} from "../../../../shared/providers/errorProvider.tsx";
import {switchSchool} from "./Services/schoolService.ts";
import {RedirectResponse} from "../../../../shared/types/redirectResponse.ts";

const SchoolAdminNav: React.FC<{ renderLogoutLink: () => JSX.Element; }> = ({renderLogoutLink}) => {
    const {setError} = useError();
    const {data, loading: schoolLoading} = useFetch<School | RedirectResponse>('api/school');
    const school = (!!data && 'id' in data) ? data : null;
    const redirect = (!!data && 'redirect' in data) ? data.redirect : null;

    const {data: schools, loading: schoolsLoading} = useFetch<School[]>('api/schools', !!school);
    const [fetchingLoading, setFetchingLoading] = useState(false)
    const loading = schoolLoading || schoolsLoading || fetchingLoading;

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

    if (redirect && !window.location.href.includes(redirect)) {
        window.location.href = redirect;
        return null;
    }

    if (loading) return <div></div>

    return (
        <nav className={styles.nav}>
            <div className={styles.navMenu}>
                <Link className={styles.navLink} to="/">System naboru do szkół</Link>
                <Link className={styles.navLink} to="/editProfiles">Profile</Link>
            </div>
            <div className={styles.navMenu}>
                {school && (
                    <>
                        <SchoolDropdown
                            currentSchool={school}
                            schools={schools || []}
                            onSelectSchool={handleSwitch}
                        />
                        <Link className={styles.navLink} to="/schoolApplicationStatus">Status Aplikacji</Link>
                    </>
                )}
                {renderLogoutLink()}
            </div>
        </nav>
    );
}

export default SchoolAdminNav;
