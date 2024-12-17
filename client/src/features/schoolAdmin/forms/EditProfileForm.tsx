import React from "react";

import {MinusButton, PlusButton} from '../../../components/atomic/QuantityButton'
import {ErrorMessage} from "../../../components/atomic/ErrorMessage";


import styles from "../../../assets/css/forms.module.scss";
import {InputField} from "../../../components/atomic/InputField";
import {Button} from "../../../components/atomic/Button";
import {Profile} from "../types/profileRequest.ts";

interface EditProfileFormProps {
    updatedProfiles: Profile[];
    error: string | null;
    loading: boolean;
    onProfileChange: (id: number, field: string, value: string) => void;
    onAddProfile: () => void;
    onDeleteProfile: (id: number) => void;
    onSave: () => void;
    onUndo: () => void;
}

const EditProfileForm: React.FC<EditProfileFormProps> = ({
                                                             updatedProfiles,
                                                             error,
                                                             loading,
                                                             onProfileChange,
                                                             onAddProfile,
                                                             onDeleteProfile,
                                                             onSave,
                                                             onUndo
                                                         }) => (
    <form method="POST" className={styles.form}>
        <h2>Edytuj szkoły</h2>
        {error && <ErrorMessage message={error}/>}
        <table>
            <thead>
            <tr>
                <th></th>
                <th></th>
            </tr>
            </thead>
            <tbody>
            {updatedProfiles && updatedProfiles.map(profile => (
                <tr key={profile.id}>
                    <td>
                        <InputField
                            type="text"
                            placeholder="Nazwa profilu"
                            value={profile.name}
                            required
                            onChange={(e) =>
                                onProfileChange(profile.id, 'name', e.target.value)}
                        />
                    </td>
                    <td>
                        <MinusButton
                            onClick={() => onDeleteProfile(profile.id)}
                            disabled={loading}
                        />
                    </td>
                </tr>
            ))}
            </tbody>
        </table>
        <div>
            <PlusButton
                onClick={onAddProfile}
                disabled={loading}
            />
        </div>

        <div>
            <Button onClick={onUndo} disabled={loading}> Cofnij </Button>
            <Button onClick={onSave}> Zapisz </Button>
        </div>
    </form>
)

export default EditProfileForm;
