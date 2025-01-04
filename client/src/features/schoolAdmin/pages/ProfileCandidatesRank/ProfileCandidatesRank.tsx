import React, {useState} from 'react';
import {useFetch} from "../../../../shared/hooks/useFetch.ts";
import LoadingPage from "../../../../app/routes/LoadingPage.tsx";
import {RankedApplication} from "../../../../shared/types/rankedApplication.ts";
import ApplicationTable from "../../components/ApplicationTable.tsx";
import {ErrorMessage} from "../../../../components/atomic/ErrorMessage";
import {deleteApplication} from "../../../../shared/services/applicationService.ts";
import {Profile} from "../../../../shared/types/profile.ts";


const ProfileCandidatesRank: React.FC = () => {
    const {data: profile, loading: profileLoading} = useFetch<Profile>('api/admin/profile');
    const {data, loading: loadingFetch, authorized} = useFetch<{
        accepted: RankedApplication[],
        prevAccepted: RankedApplication[],
        reserve: RankedApplication[]
    }>('/api/admin/applications', !!profile);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleDeleteApplication = async (id: number) => {
        setLoading(true);
        try {
            await deleteApplication(id);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    if (loadingFetch || !authorized || profileLoading) return <LoadingPage/>;


    return (
        <div>
            <h1>Kandydaci</h1>
            {error && <ErrorMessage message={error}/>}
            {(!data || (data.accepted.length === 0 && data.reserve.length === 0)) ? (
                <p>Nie znaleziono aplikacji.</p>
            ) : (
                <>
                    {data.accepted.length !== 0 && (
                        <ApplicationTable
                            title={"Aplikacje kwalifikujące się:"}
                            applications={data.accepted}
                        />
                    )}
                    {data.reserve.length !== 0 && (
                        <ApplicationTable
                            title={"Aplikacje na liście rezerwowej:"}
                            applications={data.reserve}
                        />
                    )}
                    {data.prevAccepted.length !== 0 && (
                        <ApplicationTable
                            title={"Aplikacje zaakceptowane w poprzednich turach:"}
                            applications={data.prevAccepted}
                            canDelete={true}
                            onDelete={handleDeleteApplication}
                            loading={loading}
                        />
                    )}
                </>
            )}
        </div>
    );
}

export default ProfileCandidatesRank;
