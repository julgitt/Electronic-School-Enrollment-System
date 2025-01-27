import React from "react";

import {MinusButton, PlusButton} from '../../../components/atomic/QuantityButton'
import {ErrorMessage} from "../../../components/atomic/ErrorMessage";


import styles from "../../../assets/css/forms.module.scss";
import {InputField} from "../../../components/atomic/InputField";
import {School} from "../types/schoolRequest.ts";
import {Button} from "../../../components/atomic/Button";
import SuccessMessage from "../../../components/atomic/SuccessMessage/SuccessMessage.tsx";

interface EditSchoolFormProps {
    updatedSchools: School[];
    error: string | null;
    loading: boolean;
    onSchoolChange: (school: School) => void;
    onAddSchool: () => void;
    onDeleteSchool: (id: number) => void;
    onSave: () => void;
    onUndo: () => void;
    successMessage: string | null;
}

const EditSchoolForm: React.FC<EditSchoolFormProps> = ({
                                                           updatedSchools,
                                                           error,
                                                           loading,
                                                           onSchoolChange,
                                                           onAddSchool,
                                                           onDeleteSchool,
                                                           onSave,
                                                           onUndo,
                                                           successMessage
                                                       }) => (
    <form method="POST" className={styles.form}>
        <h2>Edytuj szkoły</h2>
        {error && <ErrorMessage message={error}/>}
        <div className={styles.formInputGroupHorizontal}>
            <h5>Nazwa szkoły</h5>
            <h5>Usuń</h5>
        </div>
        {updatedSchools && updatedSchools.map(school => (
            <div className={styles.formInputGroupHorizontal} key={school.id}>
                <InputField
                    type="text"
                    placeholder="Nazwa szkoły"
                    value={school.name}
                    required
                    onChange={(e) =>
                        onSchoolChange({
                            id: school.id,
                            name: e.target.value
                        })}
                />
                <MinusButton
                    onClick={() => onDeleteSchool(school.id)}
                    disabled={loading}
                />
            </div>
        ))}

        <div>
            <PlusButton
                onClick={onAddSchool}
                disabled={loading}
            />
            <Button onClick={onUndo} disabled={loading}> Cofnij </Button>
            <Button onClick={onSave}> Zapisz </Button>
        </div>
        {successMessage && (<SuccessMessage message={successMessage}/>)}
    </form>
)

export default EditSchoolForm;
