import React from 'react';

import styles from './Header.module.scss';
import {useCandidate} from "../../../shared/providers/candidateProvider.tsx";
import {NavLink as Link} from "react-router-dom";
import CandidateDropdown from "../../composite/CandidateDropdown/CandidateDropdown.tsx";
import {useDeadlineCheck} from "../../../shared/hooks/useDeadlineCheck.ts";
import ErrorPage from "../../../app/routes/ErrorPage.tsx";
import LoadingPage from "../../../app/routes/LoadingPage.tsx";
import {useGradeSubmittedCheck} from "../../../shared/hooks/useGradeSubmittedCheck.ts";

const Header: React.FC = () => {
    const { candidate, candidates, switchCandidate, onLogout, logoutLoading} = useCandidate();
    const {isPastDeadline, loading, error} = useDeadlineCheck();
    const {areGradesSubmitted, loading: gradesLoading, error: gradesError} = useGradeSubmittedCheck(candidate != null);

    if (error) return <ErrorPage errorMessage={error} />;
    if (gradesError) return <ErrorPage errorMessage={gradesError} />;
    if (loading || gradesLoading) return <LoadingPage/>

    return (
        <header className={styles.header}>
            <nav className={styles.nav}>
                <div className={styles.navMenu}>
                    <Link className={styles.navLink} to="/">System naboru do szkół</Link>
                    <Link className={styles.navLink} to="/dates">Terminy</Link>
                    {candidate && candidate.id && !isPastDeadline && <Link className={styles.navLink} to="/submitApplication">Złóż kandydaturę</Link>}
                    {candidate && candidate.id
                        && !isPastDeadline
                        && !areGradesSubmitted
                        && <Link className={styles.navLink} to="/submitGrades">Dodaj wyniki</Link>
                    }
                </div>
                    {candidate && candidate.id ? (
                        <div className={styles.navMenu}>
                            <CandidateDropdown
                                currentCandidate={candidate}
                                candidates={candidates}
                                onSelectCandidate={switchCandidate}
                            />
                            <Link className={styles.navLink} to="/applicationStatus">Status Aplikacji</Link>
                            <Link
                                className={styles.navLink}
                                to="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (!logoutLoading) onLogout(e);
                                }}
                            >
                                {logoutLoading ? 'Wylogowywanie...' : 'Wyloguj'}
                            </Link>
                        </div>
                    ) : (
                        <div className={styles.navMenu}>
                            <Link className={styles.navLink} to="/login">Zaloguj się</Link>
                            <Link className={styles.navLink} to="/signup">Zarejestruj się</Link>
                        </div>
                    )}
            </nav>
        </header>
    );
};

export default Header;
