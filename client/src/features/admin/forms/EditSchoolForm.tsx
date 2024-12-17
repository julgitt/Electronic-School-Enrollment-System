import React from "react";

import {MinusButton, PlusButton} from '../../../components/atomic/QuantityButton'
import {ErrorMessage} from "../../../components/atomic/ErrorMessage";


import styles from "../../../assets/css/forms.module.scss";
import {InputField} from "../../../components/atomic/InputField";
import {School} from "../types/schoolRequest.ts";
import {Button} from "../../../components/atomic/Button";

interface EditSchoolFormProps {
    updatedSchools: School[];
    error: string | null;
    loading: boolean;
    onSchoolChange: (school: School) => void;
    onAddSchool: () => void;
    onDeleteSchool: (id: number) => void;
    onSave: () => void;
    onUndo: () => void;
}

const EditSchoolForm: React.FC<EditSchoolFormProps> = ({
                                                           updatedSchools,
                                                           error,
                                                           loading,
                                                           onSchoolChange,
                                                           onAddSchool,
                                                           onDeleteSchool,
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
            {updatedSchools && updatedSchools.map(school => (
                <tr key={school.id}>
                    <td>
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
                    </td>
                    <td>
                        <MinusButton
                            onClick={() => onDeleteSchool(school.id)}
                            disabled={loading}
                        />
                    </td>
                </tr>
            ))}
            </tbody>
        </table>
        <div>
            <PlusButton
                onClick={onAddSchool}
                disabled={loading}
            />
        </div>

        <div>
            <Button onClick={onUndo} disabled={loading}> Cofnij </Button>
            <Button onClick={onSave}> Zapisz </Button>
        </div>
    </form>
)

export default EditSchoolForm;
