import React, {createContext, useState, useContext, useEffect, ReactNode} from 'react';
import { Candidate } from "../types/candidate.ts";

interface CandidateContextType {
    authorized: boolean;
    candidate: Candidate | null;
    candidates: Candidate[];
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
    const [authorized, setAuthorized] = useState<boolean>(false);
    const [candidate, setCandidate] = useState<Candidate | null>(null);
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [logoutLoading, setLogoutLoading] = useState(false);
    const [redirected, setRedirected] = useState(false);

    // TODO Add errors
    //TODO update depth exceeded
    useEffect(() => {
        fetch('/api/user')
            .then(response => response.json())
            .then(data => {
                if (data.user == null) return;
                setAuthorized(true);
                fetch('/api/candidate')
                    .then(response => response.json())
                    .then(data => {
                        if (data.redirect && !redirected && window.location.href != data.redirect) {
                            setRedirected(true)
                            window.location.href = data.redirect;
                            return;
                        }
                        if (candidate != data.candidate)
                            setCandidate(data.candidate);
                    });
                fetch('/api/candidates')
                    .then(response => response.json())
                    .then(data => {
                        if (data.candidates != candidates)
                            setCandidates(data.candidates);
                    });
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
                window.location.reload();
            });
    };

    return (
        <CandidateContext.Provider value={{ authorized, candidate, candidates, switchCandidate, onLogout, logoutLoading }}>
            {children}
        </CandidateContext.Provider>
    );
};
