// CandidateDropdown.tsx
import React, { useState } from 'react';
import { NavLink as Link } from 'react-router-dom';
import styles from './CandidateDropdown.module.scss';
import { CandidateCookie } from "../../../shared/types/candidateCookie.ts";

interface CandidateDropdownProps {
    currentCandidate: CandidateCookie;
    candidates: CandidateCookie[];
    onSelectCandidate: (candidateId: number) => void;
}

const CandidateDropdown: React.FC<CandidateDropdownProps> = ({
    currentCandidate,
    candidates,
    onSelectCandidate
}) => {
    const [isDropdownOpen, setDropdownOpen] = useState(false);

    return (
        <div className={styles.dropdown}>
            <button
                onClick={() => setDropdownOpen(!isDropdownOpen)}
                className={styles.dropdownButton}
            >
                {currentCandidate.name}
            </button>
            {isDropdownOpen && (
                <div className={styles.dropdownContent}>
                    {candidates.map((candidate) => (
                        <button
                            key={candidate.id}
                            onClick={() => {
                                setDropdownOpen(false);
                                onSelectCandidate(candidate.id);
                            }}
                            className={styles.dropdownItem}
                        >
                            {candidate.name}
                        </button>
                    ))}
                    <Link
                        to="/createCandidate"
                        className={styles.dropdownItem}
                        onClick={() => setDropdownOpen(false)}
                    >
                        + Nowy Kandydat
                    </Link>
                    <Link
                        to={`/editCandidate/${currentCandidate.id}`}
                        className={styles.dropdownItem}
                        onClick={() => setDropdownOpen(false)}
                    >
                        Edytuj Obecnego
                    </Link>
                </div>
            )}
        </div>
    );
};

export default CandidateDropdown;
