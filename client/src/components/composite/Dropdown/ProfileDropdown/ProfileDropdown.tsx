import React, {useState} from 'react';
import styles from './ProfileDropdown.module.scss';
import {Profile} from "../../../../shared/types/profile.ts";
import {NavLink as Link} from "react-router-dom";

interface ProfileDropdownProps {
    currentProfile: Profile;
    profiles: Profile[];
    onSelectProfile: (profileId: number) => void;
    onDeleteProfile: (profileId: number) => void;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({
                                                           currentProfile,
                                                           profiles,
                                                           onSelectProfile,
    onDeleteProfile
                                                       }) => {
    const [isDropdownOpen, setDropdownOpen] = useState(false);

    return (
        <div className={styles.dropdown}>
            <button
                onClick={() => setDropdownOpen(!isDropdownOpen)}
                className={styles.dropdownButton}
            >
                {("Profil:" && currentProfile.name) || "Profile"}
            </button>
            {isDropdownOpen && (
                <div className={styles.dropdownContent}>
                    {profiles.map((profile) => (
                        <button
                            key={profile.id}
                            onClick={() => {
                                setDropdownOpen(false);
                                onSelectProfile(profile.id);
                            }}
                            className={styles.dropdownItem}
                        >
                            {profile.name}
                        </button>
                    ))}
                    <Link
                        to="/addProfile"
                        className={styles.dropdownItem}
                        onClick={() => setDropdownOpen(false)}
                    >
                        Nowy Profil
                    </Link>
                    {currentProfile.name && (
                        <>
                            <button
                                onClick={() => {
                                    setDropdownOpen(false);
                                    onDeleteProfile(currentProfile.id);
                                }}
                                className={styles.dropdownItem}
                            >
                                Usuń Obecny Profil
                            </button>
                            <Link
                                to="/editProfile"
                                className={styles.dropdownItem}
                                onClick={() => setDropdownOpen(false)}
                            >
                                Edytuj Profil
                            </Link>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default ProfileDropdown;
