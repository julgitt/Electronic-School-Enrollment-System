import React, {createContext, ReactNode, useCallback, useContext, useEffect, useState} from 'react';
import {Candidate} from "../types/candidate";
import {User} from "../types/user.ts";
import {useError} from "./errorProvider.tsx";

interface CandidateContextType {
    loading: boolean;
    roles: string[];
    candidate: Candidate | null;
    candidates: Candidate[];
    switchCandidate: (candidateId: number) => void;
    deleteCandidate: (candidateId: number) => void;
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
    const {setError} = useError();
    const [loading, setLoading] = useState(true);
    const [roles, setRoles] = useState<string[]>([]);
    const [candidate, setCandidate] = useState<Candidate | null>(null);
    const [candidates, setCandidates] = useState<Candidate[]>([]);

    const fetchApi = useCallback(async (url: string, options?: RequestInit) => {
        const response = await fetch(url, options);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Unknown error");
        }
        return response.json();
    }, []);

    const fetchUserData = useCallback(async () => {
        setLoading(true);
        try {
            const userData: User = await fetchApi('/api/user');
            if (userData.roles?.length) {
                setRoles(userData.roles);
                if (userData.roles.includes('user')) {
                    await fetchCandidates();
                }
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [fetchApi, setError]);

    const fetchCandidates = useCallback(async () => {
        try {
            const data = await fetchApi('/api/candidate');
            if (data.redirect && !window.location.href.includes(data.redirect)) {
                window.location.href = data.redirect;
                return;
            } else if (data.candidate) {
                setCandidate(data.candidate);
                const candidatesData = await fetchApi('/api/candidates');
                setCandidates(candidatesData);
            }
        } catch (err: any) {
            setError(err.message);
        }
    }, [fetchApi, setError]);

    useEffect(() => {
        fetchUserData();
    }, [fetchUserData]);

    const switchCandidate = (candidateId: number) => {
        setLoading(true);
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
            .catch(err => setError(err.message))
            .finally(() => {
                setLoading(false);
            })

    };

    const deleteCandidate = (candidateId: number) => {
        setLoading(true);
        fetch('/api/candidate', {
            method: 'DELETE',
            body: JSON.stringify({candidateId}),
            headers: {'Content-Type': 'application/json'},
        })
            .then(async response => {
                if (!response.ok) throw new Error((await response.json()).message);
                window.location.reload();

            })
            .catch(err => setError(err.message))
            .finally(() => {
                setLoading(false);
            });
    };

    return (
        <CandidateContext.Provider
            value={{
                loading,
                roles,
                candidate,
                candidates,
                switchCandidate,
                deleteCandidate,
            }}
        >
            {children}
        </CandidateContext.Provider>
    );
};
