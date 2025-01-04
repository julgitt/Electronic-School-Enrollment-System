import {SignupFormData} from "../../features/auth/types/signUpFormData.ts";
import {LoginFormData} from "../../features/auth/types/loginFormData.ts";

export const login = async (formData: LoginFormData) => {
    const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
    });
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Błąd logowania');
    }

    return data;
};

export const signup = async (formData: SignupFormData) => {
    const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
    });
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Błąd podczas rejestracji.');
    }

    return data;
}

export const logout = async () => {
    const response = await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include'
    });

    const data = await response.json();

    if (!response.ok) {
        throw Error(data.message || 'Nie udało się wylogować.');
    }

    return data;
}

