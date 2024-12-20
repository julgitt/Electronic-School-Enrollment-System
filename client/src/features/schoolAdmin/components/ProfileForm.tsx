import React from "react";

import {InputField} from "../../../components/atomic/InputField";
import {Button} from "../../../components/atomic/Button";
import {ErrorMessage} from "../../../components/atomic/ErrorMessage";

import styles from "../../../assets/css/forms.module.scss";
import {Profile, ProfileCriteriaType} from "../types/profileRequest.ts";
import {Subject} from "../../grades/types/subject.ts";
import {Checkbox} from "../../../components/atomic/Checkbox";

interface ProfileFormProps {
    subjects: Subject[]
    formData: Profile;
    onInputChange: (field: keyof Profile) =>
        (event: React.ChangeEvent<HTMLInputElement>) => void;
    onCriteriaChange: (subjectId: number, type: ProfileCriteriaType, checked: boolean) => void;
    error?: string | null;
    loading?: boolean;
    onSubmit: (event: React.FormEvent) => void;
}

const ProfileForm: React.FC<ProfileFormProps> = ({
                                                     subjects,
                                                     formData,
                                                     onInputChange,
                                                     onCriteriaChange,
                                                     error,
                                                     loading,
                                                     onSubmit,
                                                 }) => (
    <form method="POST" onSubmit={onSubmit} className={styles.form}>
        <h1>Edycja profilu</h1>
        {error && <ErrorMessage message={error}/>}
        <div className={styles.mainFormInputGroup}>
            <div className={styles.formInputGroup}>
                <InputField
                    type="text"
                    placeholder="Nazwa profilu"
                    value={formData.name}
                    onChange={onInputChange("name")}
                    pattern="[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ\- ]+"
                    title="Nazwa profilu."
                    required
                />
                <InputField
                    type="number"
                    placeholder="Liczba miejsc"
                    value={formData.capacity}
                    onChange={onInputChange("capacity")}
                    pattern="[1-9]+"
                    title="Liczba miejsc."
                    required
                />
            </div>
            <h2> Kryteria </h2>
            <div className={styles.selectionElement}>
                <h5 className={styles.labelItem}> {"Przedmiot"} </h5>

                <h5 className={styles.labelItem}> Obowiązkowy / Alternatywny</h5>
            </div>
            {subjects.map(subject => (
                <div key={subject.id} className={styles.selectionElement}>
                    <h6 className={styles.labelItem}>{subject.name}</h6>
                    <div className={styles.selectionElement}>
                        <Checkbox
                            checked={formData.criteria.some(c =>
                                c.subjectId === subject.id
                                && c.type === ProfileCriteriaType.Mandatory)}
                            onChange={(event) =>
                                onCriteriaChange(subject.id, ProfileCriteriaType.Mandatory, event.target.checked)}
                            itemName={"O"}
                        />
                        <Checkbox
                            checked={formData.criteria.some(c =>
                                c.subjectId === subject.id
                                && c.type === ProfileCriteriaType.Alternative)}
                            onChange={(event) =>
                                onCriteriaChange(subject.id, ProfileCriteriaType.Alternative, event.target.checked)}
                            itemName={"A"}
                        />
                    </div>
                </div>
            ))}
        </div>
        <Button type="submit" disabled={loading}>
            {loading ? "Zapisywanie..." : "Zapisz"}
        </Button>
    </form>
);

export default ProfileForm;
