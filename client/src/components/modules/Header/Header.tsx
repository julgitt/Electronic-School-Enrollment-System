import React from 'react';

import styles from './Header.module.scss';
import {useCandidate} from "../../../shared/providers/candidateProvider.tsx";
import {NavLink as Link} from "react-router-dom";
import CandidateDropdown from "../../composite/CandidateDropdown/CandidateDropdown.tsx";

const Header: React.FC = () => {
    const { candidate, candidates, switchCandidate, onLogout, logoutLoading} = useCandidate();

    return (
        <header className={styles.header}>
            <nav className={styles.nav}>
                <div className={styles.navMenu}>
                    <Link className={styles.navLink} to="/">System naboru do szkół</Link>
                    <Link className={styles.navLink} to="/dates">Terminy</Link>
                    {candidate && candidate.id && <Link className={styles.navLink} to="/submitApplication">Złóż kandydaturę</Link>}
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
