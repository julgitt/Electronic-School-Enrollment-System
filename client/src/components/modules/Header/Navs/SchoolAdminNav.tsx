import React, {useEffect, useState} from 'react';
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
    const [school, setSchool] = useState<School | null>(null);
    const [redirect, setRedirect] = useState<string | null>(null);

    useEffect(() => {
        if (data != null) {
            console.log(data);
            if ('id' in data) setSchool(data);
            if ('redirect' in data) setRedirect(data.redirect);
        }
    }, [data]);

    const {data: schools, loading: schoolsLoading} = useFetch<School[]>('api/schoolsByAdmin', !!school);
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

    if (loading) return <div></div>

    if (redirect && !window.location.href.includes(redirect)) {
        window.location.href = redirect;
        return null;
    }

    return (
        <nav className={styles.nav}>
            <div className={styles.navMenu}>
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
