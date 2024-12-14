import React, {createContext, ReactNode, useContext, useEffect, useState} from 'react';
import {Candidate} from "../types/candidate";
import {User} from "../types/user.ts";

interface CandidateContextType {
    roles: string[];
    candidate: Candidate | null;
    candidates: Candidate[];
    switchCandidate: (candidateId: number) => void;
    deleteCandidate: (candidateId: number) => void;
    error: string | null;
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

export const CandidateProvider: React.FC<CandidateProviderProps> = ({children}) => {
    const [roles, setRoles] = useState<string[]>([]);
    const [candidate, setCandidate] = useState<Candidate | null>(null);
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch('/api/user')
            .then(async response => {
                if (!response.ok) throw new Error((await response.json()).message)
                return response.json();
            })
            .then((userData: User) => {
                if (!userData.roles || userData.roles.length === 0) return;
                setRoles(userData.roles);
                if (userData.roles.includes('admin')) return;

                fetch('/api/candidate')
                    .then(async response => {
                        if (!response.ok) throw new Error((await response.json()).message);
                        return response.json();
                    })
                    .then(data => {
                        if (data.redirect && !window.location.href.includes(data.redirect)) {
                            window.location.href = data.redirect;
                            return;
                        }
                        setCandidate(data.candidate);
                    })
                    .catch(err => setError(err.message));

                fetch('/api/candidates')
                    .then(async response => {
                        if (!response.ok) throw new Error((await response.json()).message);
                        return response.json();
                    })
                    .then(data => setCandidates(data.candidates)
                    );
            })
            .catch(err => setError(err.message)
            );
    }, []);

    const switchCandidate = (candidateId: number) => {
        fetch('/api/switchCandidate', {
            method: 'POST',
            body: JSON.stringify({candidateId}),
            headers: {'Content-Type': 'application/json'},
        })
            .then(async response => {
                if (!response.ok) throw new Error((await response.json()).message);
                return response.json();
            })
            .then(data => {
                setCandidate(data.candidate);
                window.location.reload();
            })
            .catch(err => setError(err.message));
    };

    const deleteCandidate = (candidateId: number) => {
        fetch('/api/deleteCandidate', {
            method: 'DELETE',
            body: JSON.stringify({candidateId}),
            headers: {'Content-Type': 'application/json'},
        })
            .then(async response => {
                if (!response.ok) throw new Error((await response.json()).message);
                window.location.reload();

            })
            .catch(err => setError(err.message));
    };

    return (
        <CandidateContext.Provider
            value={{
                roles,
                candidate,
                candidates,
                switchCandidate,
                deleteCandidate,
                error,
            }}
        >
            {error && <div className="error">Error: {error}</div>}
            {children}
        </CandidateContext.Provider>
    );
};
