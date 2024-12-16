import React, {createContext, ReactNode, useContext, useState} from "react";


interface ErrorContextType {
    error: string | null;
    setError: (err: string | null) => void;
}

interface ErrorProviderProps {
    children: ReactNode;
}


const ErrorContext = createContext<ErrorContextType | null>(null);

export const ErrorProvider: React.FC<ErrorProviderProps> = ({children}) => {
    const [error, setError] = useState<string | null>(null);

    return (
        <ErrorContext.Provider value={{error, setError}}>
            {children}
        </ErrorContext.Provider>
    );
};

export const useError = () => {
    const context = useContext(ErrorContext);
    if (!context) {
        throw new Error("Kontekst w useError nie może być null'em");
    }
    return context;
};
