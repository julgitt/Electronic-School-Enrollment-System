import React, {createContext, ReactNode, useContext, useEffect, useState} from 'react';
import {User} from "../types/user.ts";
import {useFetch} from "../hooks/useFetch.ts";

interface UserContextType {
    loading: boolean;
    roles: string[];
}

const UserContext = createContext<UserContextType | null>(null);

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("Context in useUser cannot be null");
    }
    return context;
};

interface UserProviderProps {
    children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({children}) => {
    const {data, loading} = useFetch<User>('api/user')
    const [roles, setRoles] = useState<string[]>([]);

    useEffect(() => {
        if (data && data.roles)
            setRoles(data.roles);
    }, [data]);

    return (
        <UserContext.Provider
            value={{
                loading,
                roles,
            }}
        >
            {children}
        </UserContext.Provider>
    );
};
