import React, {useState} from 'react';

export function useFormData<T>(initialData: T) {
    const [formData, setFormData] = useState<T>(initialData);

    const handleChange = (field: keyof T) => (event: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prevData) => ({
            ...prevData,
            [field]: event.target.value,
        }));
    };

    const updateListField = <K extends keyof T>(field: K, updateFn: (current: T[K]) => T[K]) => {
        setFormData((prevData) => ({
            ...prevData,
            [field]: updateFn(prevData[field]),
        }));
    };

    return {
        formData,
        handleChange,
        updateListField,
    };
}
