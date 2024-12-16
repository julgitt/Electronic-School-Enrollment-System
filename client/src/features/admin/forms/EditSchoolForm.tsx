import React, {useState} from "react";

import {MinusButton} from '../../../components/atomic/QuantityButton'
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
    onUpdateSchool: (school: School) => void;
    onAddSchool: (name: string) => void;
    onDeleteSchool: (id: number) => void;
}

const EditSchoolForm: React.FC<EditSchoolFormProps> = ({
                                                           updatedSchools,
                                                           error,
                                                           loading,
                                                           onSchoolChange,
                                                           onUpdateSchool,
                                                           onAddSchool,
                                                           onDeleteSchool,
                                                       }) => {
    const [newSchoolName, setNewSchoolName] = useState<string>("");

    return (
        <form method="POST" className={styles.form}>
            <h2>Edytuj szkoły</h2>
            {error && <ErrorMessage message={error}/>}
            <table>
                <thead>
                <tr>
                    <th>Nazwa</th>
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
                                onBlur={(e) =>
                                    onUpdateSchool({
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
                <h3> Nowa szkoła </h3>
                <InputField
                    type="text"
                    placeholder="Nazwa szkoły"
                    value={newSchoolName}
                    onChange={(e) => setNewSchoolName(e.target.value)}
                />
                <Button
                    onClick={() => {
                        onAddSchool(newSchoolName)
                        setNewSchoolName("");
                    }}
                    disabled={loading}
                >Dodaj</Button>
            </div>
        </form>
    )
}

export default EditSchoolForm;
