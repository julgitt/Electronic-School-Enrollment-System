import React, {useState} from 'react';

import styles from './Header.module.scss';
import {useCandidate} from "../../../shared/providers/candidateProvider.tsx";
import {NavLink as Link} from "react-router-dom";
import CandidateDropdown from "../../composite/CandidateDropdown/CandidateDropdown.tsx";
import {useDeadlineCheck} from "../../../shared/hooks/useDeadlineCheck.ts";
import LoadingPage from "../../../app/routes/LoadingPage.tsx";
import {useGradeSubmittedCheck} from "../../../shared/hooks/useGradeSubmittedCheck.ts";
import {logout} from "../../../features/auth/services/authService.ts";
import {useError} from "../../../shared/providers/errorProvider.tsx";

const Header: React.FC = () => {
    const {setError} = useError();
    const {
        roles, candidate, candidates, loading: userLoading,
        switchCandidate, deleteCandidate,
    } = useCandidate();

    const {isPastDeadline, loading} = useDeadlineCheck(!!candidate);
    const {areGradesSubmitted, loading: gradesLoading} = useGradeSubmittedCheck(!!candidate);
    const [logoutLoading, setLogoutLoading] = useState(false);

    if (loading || gradesLoading || userLoading) return <LoadingPage/>

    const candidateExist = candidate?.id != null;

    const handleLogout = async (event: React.MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        setLogoutLoading(true);
        try {
            await logout();
            window.location.href = '/';
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLogoutLoading(false);
        }
    };

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
                    if (!logoutLoading) handleLogout(e);
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
                    if (!logoutLoading) handleLogout(e);
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
