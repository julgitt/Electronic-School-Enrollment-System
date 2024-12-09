import React, { useState } from 'react';
import { NavLink as Link } from 'react-router-dom';
import styles from './CandidateDropdown.module.scss';
import { Candidate } from "../../../shared/types/candidate.ts";

interface CandidateDropdownProps {
    currentCandidate: Candidate;
    candidates: Candidate[];
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
                {currentCandidate.firstName} {currentCandidate.lastName}
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
                            {candidate.firstName} {candidate.lastName}
                        </button>
                    ))}
                    <Link
                        to="/registerCandidate"
                        className={styles.dropdownItem}
                        onClick={() => setDropdownOpen(false)}
                    >
                        Nowy Kandydat
                    </Link>
                </div>
            )}
        </div>
    );
};

export default CandidateDropdown;
