import React from "react";
import {Profile} from "../../../shared/types/profile.ts";
import styles from "../../../assets/css/forms.module.scss";
import {InputField} from "../../../components/atomic/InputField";
import {Checkbox} from "../../../components/atomic/Checkbox";

const ProfileSelection: React.FC<{
    profiles: Profile[];
    selectedProfiles: { profileId: number; priority: number }[];
    onProfileChange: (profile: Profile) => void;
    onPriorityChange: (profileId: number, priority: number) => void;
}> = ({profiles, selectedProfiles, onProfileChange, onPriorityChange}) => (
    <div className={styles.selectionGroup}>
        {profiles.map((profile) => {
            const selectedProfile = selectedProfiles.find(
                (p) => p.profileId === profile.id
            );

            return (
                <div key={profile.id} className={styles.selectionElement}>
                    <Checkbox
                        checked={!!selectedProfile}
                        onChange={() => onProfileChange(profile)}
                        itemName={profile.name}

                    />
                    {selectedProfile && (
                        <InputField
                            type="number"
                            min={1}
                            value={selectedProfile.priority === 0? "" : selectedProfile.priority}
                            onChange={(e) =>
                                onPriorityChange(profile.id, Number(e.target.value))
                            }
                            placeholder="1"
                            width="75px"
                            height="20px"
                        />
                    )}
                </div>
            );
        })}
    </div>
);

export default ProfileSelection;