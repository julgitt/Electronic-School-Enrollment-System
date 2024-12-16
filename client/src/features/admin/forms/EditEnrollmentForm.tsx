import React from "react";

import {MinusButton, PlusButton} from '../../../components/atomic/QuantityButton'
import {ErrorMessage} from "../../../components/atomic/ErrorMessage";


import styles from "../../../assets/css/forms.module.scss";
import {InputField} from "../../../components/atomic/InputField";
import {Button} from "../../../components/atomic/Button";
import {Enrollment} from "../../../shared/types/enrollment.ts";

interface EditEnrollmentFormProps {
    updatedEnrollments: Enrollment[];
    error: string | null;
    loading: boolean;
    onEnrollmentChange: (id: number, field: string, value: string) => void;
    onAddEnrollment: () => void;
    onDeleteEnrollment: (id: number) => void;
    onSave: () => void;
    onUndo: () => void;
}

const EditEnrollmentForm: React.FC<EditEnrollmentFormProps> = ({
                                                                   updatedEnrollments,
                                                                   error,
                                                                   loading,
                                                                   onEnrollmentChange,
                                                                   onAddEnrollment,
                                                                   onDeleteEnrollment,
                                                                   onSave,
                                                                   onUndo
                                                               }) => (
    <form method="POST" className={styles.form}>
        <h2>Edytuj terminy</h2>
        {error && <ErrorMessage message={error}/>}
        <table>
            <thead>
            <tr>
                <th>Tura</th>
                <th>Data rozpoczecia</th>
                <th>Data zakończenia</th>
                <th></th>
            </tr>
            </thead>
            <tbody>
            {updatedEnrollments && updatedEnrollments.map(enrollment => (
                <tr key={enrollment.id}>
                    <td>
                        <InputField
                            type="number"
                            placeholder="1"
                            value={enrollment.round}
                            required
                            onChange={(e) =>
                                onEnrollmentChange(enrollment.id, 'round', e.target.value)}
                        />
                    </td>
                    <td>
                        <InputField
                            placeholder="Data rozpoczęcia"
                            type="date"
                            value={new Date(enrollment.startDate).toISOString().split('T')[0]}
                            required
                            onChange={(e) =>
                                onEnrollmentChange(enrollment.id, 'startDate', e.target.value)}
                        />
                    </td>
                    <td>
                        <InputField
                            placeholder="Data zakończenia"
                            type="date"
                            value={new Date(enrollment.endDate).toISOString().split('T')[0]}
                            required
                            onChange={(e) =>
                                onEnrollmentChange(enrollment.id, 'endDate', e.target.value)}
                        />
                    </td>
                    <td>
                        <MinusButton
                            onClick={() => onDeleteEnrollment(enrollment.id)}
                            disabled={loading}
                        />
                    </td>
                </tr>
            ))}
            </tbody>
        </table>
        <div>
            <PlusButton
                onClick={onAddEnrollment}
                disabled={loading}
            />
        </div>

        <div>
            <Button onClick={onUndo} disabled={loading}> Cofnij </Button>
            <Button onClick={onSave}> Zapisz </Button>
        </div>
    </form>
)

export default EditEnrollmentForm;