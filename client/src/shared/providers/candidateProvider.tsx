import React, {createContext, useState, useContext, useEffect, ReactNode} from 'react';
import {CandidateCookie} from "../types/candidateCookie.ts";

interface CandidateContextType {
    candidate: CandidateCookie | null;
    candidates: CandidateCookie[];
    switchCandidate: (candidateId: number) => void;
    onLogout: (event: React.MouseEvent<HTMLAnchorElement>) => void;
    logoutLoading: boolean
}

const CandidateContext = createContext<CandidateContextType | null>(null);

export const useCandidate = () => {
    const context = useContext(CandidateContext);
    if (!context) {
        throw new Error("Context in useCandidate cannot be null");
    }
    return context;
};

interface CandidateProviderProps {
    children: ReactNode;
}

export const CandidateProvider: React.FC<CandidateProviderProps> = ({ children }) => {
    const [candidate, setCandidate] = useState<CandidateCookie | null>(null);
    const [candidates, setCandidates] = useState<CandidateCookie[]>([]);
    const [logoutLoading, setLogoutLoading] = useState(false);

    useEffect(() => {
        fetch('/api/candidate')
            .then(response => response.json())
            .then(data => {
                if (data.redirect)
                    window.location.href = data.redirect;
                setCandidate(data.candidate);
                setCandidates(data.candidates);
            });
    }, []);

    const switchCandidate = (candidateId: number) => {
        fetch('/api/switchCandidate', {
            method: 'POST',
            body: JSON.stringify({ candidateId }),
            headers: { 'Content-Type': 'application/json' }
        })
            .then(response => response.json())
            .then(data => {
                setCandidate(data.candidate);
            });
    };

    const onLogout = (event: React.MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        setLogoutLoading(true);
        fetch('/api/logout', { method: 'POST' })
            .then(() => {
                setCandidate(null);
                setCandidates([]);
                setLogoutLoading(false);
            });
    };

    return (
        <CandidateContext.Provider value={{ candidate, candidates, switchCandidate, onLogout, logoutLoading }}>
            {children}
        </CandidateContext.Provider>
    );
};
