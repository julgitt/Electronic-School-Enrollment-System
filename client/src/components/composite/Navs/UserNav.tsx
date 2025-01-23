import React, {useEffect, useState} from 'react';
import {NavLink as Link} from "react-router-dom";

import styles from '../../modules/Header/Header.module.scss';
import {useDeadlineCheck} from "../../../shared/hooks/useDeadlineCheck.ts";
import {useGradeSubmittedCheck} from "../../../shared/hooks/useGradeSubmittedCheck.ts";
import {CandidateDropdown} from "../Dropdown/CandidateDropdown";
import {useFetch} from "../../../shared/hooks/useFetch.ts";
import {Candidate} from "../../../shared/types/candidate.ts";
import {useError} from "../../../shared/providers/errorProvider.tsx";
import {deleteCandidate, switchCandidate} from "./Services/candidateService.ts";
import {RedirectResponse} from "../../../shared/types/redirectResponse.ts";

const UserNav: React.FC<{ renderLogoutLink: () => JSX.Element; }> = ({renderLogoutLink}) => {
    const {setError} = useError();
    const {data, loading: candidateLoading} = useFetch<Candidate | RedirectResponse>('api/candidate');
    const [candidate, setCandidate] = useState<Candidate | null>(null);

    const {data: candidates, loading: candidatesLoading} = useFetch<Candidate[]>('api/candidates', !!candidate);
    const {isPastDeadline, loading: deadlineLoading} = useDeadlineCheck(!!candidate);
    const {areGradesSubmitted, loading: gradesLoading} = useGradeSubmittedCheck(!!candidate);
    const [fetchingLoading, setFetchingLoading] = useState(false)
    const loading = candidateLoading || candidatesLoading || deadlineLoading || gradesLoading || fetchingLoading;
    const [redirect, setRedirect] = useState<string | null>(null);

    useEffect(() => {
        if (data != null) {
            if ('id' in data) setCandidate(data);
            if ('redirect' in data) setRedirect(data.redirect);
        }
    }, [data]);

    const handleSwitch = async (id: number) => {
        setFetchingLoading(true);
        setError(null);

        try {
            await switchCandidate(id);
            window.location.reload();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setFetchingLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        setFetchingLoading(true);
        setError(null);

        try {
            await deleteCandidate(id);
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
    }

    return (
        <nav className={styles.nav}>
            <div className={styles.navMenu}>
                <Link className={styles.navLink} to="/">System naboru do szkół</Link>
                <Link className={styles.navLink} to="/dates">Terminy</Link>
                <Link className={styles.navLink} to="/educationalOffer">Oferta</Link>
                {candidate && !isPastDeadline && (
                    <Link className={styles.navLink} to="/submitApplication">Złóż wniosek</Link>
                )}
                {candidate && !areGradesSubmitted && (
                    <Link className={styles.navLink} to="/submitGrades">Dodaj wyniki</Link>
                )}
                {candidate && areGradesSubmitted && (
                    <Link className={styles.navLink} to="/calculatePoints">Oblicz punkty</Link>
                )}
            </div>
            <div className={styles.navMenu}>
                {candidate && (
                    <>
                        <CandidateDropdown
                            currentCandidate={candidate}
                            candidates={candidates || []}
                            onSelectCandidate={handleSwitch}
                            onDeleteCandidate={handleDelete}
                        />
                        <Link className={styles.navLink} to="/applicationStatus">Status Aplikacji</Link>
                    </>
                )}
                {renderLogoutLink()}
            </div>
        </nav>
    );
}

export default UserNav;
