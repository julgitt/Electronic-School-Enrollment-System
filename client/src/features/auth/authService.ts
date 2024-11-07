
export const login = async (
    username: string,
    password: string
) => {
    const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ txtUser: username, txtPwd: password }),
    });
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Błąd logowania');
    }

    return data;
};

export const signup = async (
    username: string,
    email: string,
    firstName: string,
    lastName: string,
    password: string,
    passwordConfirm: string,
) => {
    const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            txtUser: username,
            txtEmail: email,
            txtFirstName: firstName,
            txtLastName: lastName,
            txtPwd: password,
            txtPwd_c: passwordConfirm,
        }),
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

