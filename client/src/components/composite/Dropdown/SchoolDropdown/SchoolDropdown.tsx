import React, {useState} from 'react';
import styles from './SchoolDropdown.module.scss';
import {School} from "../../../../features/admin/types/schoolRequest.ts";

interface SchoolDropdownProps {
    currentSchool: School;
    schools: School[];
    onSelectSchool: (schoolId: number) => void;
}

const SchoolDropdown: React.FC<SchoolDropdownProps> = ({
                                                           currentSchool,
                                                           schools,
                                                           onSelectSchool,
                                                       }) => {
    const [isDropdownOpen, setDropdownOpen] = useState(false);

    return (
        <div className={styles.dropdown}>
            <button
                onClick={() => setDropdownOpen(!isDropdownOpen)}
                className={styles.dropdownButton}
            >
                {currentSchool.name}
            </button>
            {isDropdownOpen && (
                <div className={styles.dropdownContent}>
                    {schools.map((school) => (
                        <button
                            key={school.id}
                            onClick={() => {
                                setDropdownOpen(false);
                                onSelectSchool(school.id);
                            }}
                            className={styles.dropdownItem}
                        >
                            {school.name}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SchoolDropdown;
