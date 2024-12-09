import React, {createContext, ReactNode, useContext, useEffect, useState} from 'react';
import {Candidate} from "../types/candidate";
import {User} from "../types/user.ts";

interface CandidateContextType {
    roles: string[];
    candidate: Candidate | null;
    candidates: Candidate[];
    switchCandidate: (candidateId: number) => void;
    deleteCandidate: (candidateId: number) => void;
    onLogout: (event: React.MouseEvent<HTMLAnchorElement>) => void;
    logoutLoading: boolean;
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
    /*const [authorized, setAuthorized] = useState<boolean>(false);*/
    const [roles, setRoles] = useState<string[]>([]);
    const [candidate, setCandidate] = useState<Candidate | null>(null);
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [logoutLoading, setLogoutLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch('/api/user')
            .then(async response => {
                if (!response.ok) throw new Error((await response.json()).message)
                return response.json();
            })
            .then((userData: User) => {
                if (!userData.roles || userData.roles.length === 0 ) return;
                setRoles(userData.roles);
                if(userData.roles.includes('admin')) return;

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
                    .catch(err => setError(err.message)
                    );

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

    const onLogout = (event: React.MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        setLogoutLoading(true);
        fetch('/api/logout', {method: 'POST'})
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                return response.json();
            })
            .then(() => {
                setCandidate(null);
                setCandidates([]);
                setLogoutLoading(false);
                window.location.reload();
            })
            .catch(err => {
                setError(err.message);
                setLogoutLoading(false);
            });
    };

    return (
        <CandidateContext.Provider
            value={{
                roles,
                candidate,
                candidates,
                switchCandidate,
                deleteCandidate,
                onLogout,
                logoutLoading,
                error,
            }}
        >
            {error && <div className="error">Error: {error}</div>} {/* Wyświetlanie błędów */}
            {children}
        </CandidateContext.Provider>
    );
};
