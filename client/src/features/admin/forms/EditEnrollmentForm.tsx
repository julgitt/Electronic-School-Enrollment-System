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
        <div className={styles.horizontal}>
            <h5>Tura</h5>
            <h5>Data rozpoczecia</h5>
            <h5>Data zakończenia</h5>
        </div>
        {updatedEnrollments && updatedEnrollments.map(enrollment => (
            <div className={styles.horizontal}>
                <InputField
                    type="number"
                    placeholder="1"
                    value={enrollment.round}
                    required
                    onChange={(e) =>
                        onEnrollmentChange(enrollment.id, 'round', e.target.value)}
                />
                <InputField
                    placeholder="Data rozpoczęcia"
                    type="date"
                    value={new Date(enrollment.startDate).toISOString().split('T')[0]}
                    required
                    onChange={(e) =>
                        onEnrollmentChange(enrollment.id, 'startDate', e.target.value)}
                />
                <InputField
                    placeholder="Data zakończenia"
                    type="date"
                    value={new Date(enrollment.endDate).toISOString().split('T')[0]}
                    required
                    onChange={(e) =>
                        onEnrollmentChange(enrollment.id, 'endDate', e.target.value)}
                />
                <MinusButton
                    onClick={() => onDeleteEnrollment(enrollment.id)}
                    disabled={loading}
                />
            </div>
        ))}
        <div>
            <PlusButton
                onClick={onAddEnrollment}
                disabled={loading}
            />
            <Button onClick={onUndo} disabled={loading}> Cofnij </Button>
            <Button onClick={onSave}> Zapisz </Button>
        </div>
    </form>
)

export default EditEnrollmentForm;