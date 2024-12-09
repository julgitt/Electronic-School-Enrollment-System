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
    const {
        roles, candidate, candidates,
        switchCandidate, deleteCandidate, onLogout,
        logoutLoading, error: userError
    } = useCandidate();
    if (userError) return <ErrorPage errorMessage={userError}/>;

    const {isPastDeadline, loading, error} = useDeadlineCheck(!!candidate);
    const {areGradesSubmitted, loading: gradesLoading, error: gradesError} = useGradeSubmittedCheck(!!candidate);

    const candidateExist = candidate?.id != null;

    if (error) return <ErrorPage errorMessage={error}/>;
    if (gradesError) return <ErrorPage errorMessage={gradesError}/>;
    if (loading || gradesLoading) return <LoadingPage/>

    const renderNavLinks = () => (
        <div className={styles.navMenu}>
            <Link className={styles.navLink} to="/">System naboru do szkół</Link>
            <Link className={styles.navLink} to="/dates">Terminy</Link>
            {candidateExist && !isPastDeadline && (
                <Link className={styles.navLink} to="/submitApplication">Złóż kandydaturę</Link>
            )}
            {candidateExist && !areGradesSubmitted && (
                <Link className={styles.navLink} to="/submitGrades">Dodaj wyniki</Link>
            )}
        </div>
    );

    const renderUserMenu = () => (
        <div className={styles.navMenu}>
            {candidateExist && (
                <>
                    <CandidateDropdown
                        currentCandidate={candidate}
                        candidates={candidates}
                        onSelectCandidate={switchCandidate}
                        onDeleteCandidate={deleteCandidate}
                    />
                    <Link className={styles.navLink} to="/applicationStatus">Status Aplikacji</Link>
                </>
            )}
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
    );

    const renderAdminMenu = () => (
        <div className={styles.navMenu}>
            <Link className={styles.navLink} to="/enroll">Włącz nabór</Link>
            <Link className={styles.navLink} to="/editSchools">Szkoły</Link>
            <Link className={styles.navLink} to="/editDeadlines">Terminy</Link>
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
    );

    const renderGuestMenu = () => (
        <div className={styles.navMenu}>
            <Link className={styles.navLink} to="/login">Zaloguj się</Link>
            <Link className={styles.navLink} to="/signup">Zarejestruj się</Link>
        </div>
    );

    const hasRole = (roles: string[], requiredRole: string) =>
        roles.includes(requiredRole);

    return (
        <header className={styles.header}>
            <nav className={styles.nav}>
                {renderNavLinks()}
                {hasRole(roles, 'admin')
                    ? renderAdminMenu()
                    : hasRole(roles, 'user')
                        ? renderUserMenu()
                        : renderGuestMenu()}
            </nav>
        </header>
    );
};

export default Header;
