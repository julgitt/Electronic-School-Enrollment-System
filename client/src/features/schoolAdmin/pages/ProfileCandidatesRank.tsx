import React from 'react';
import {useFetch} from "../../../shared/hooks/useFetch.ts";
import LoadingPage from "../../../app/routes/LoadingPage.tsx";
import {RankedApplication} from "../../../shared/types/rankedApplication.ts";
import ApplicationTable from "../components/ApplicationTable.tsx";


const ProfileCandidatesRank: React.FC = () => {
    const {data, loading, authorized} = useFetch<{
        accepted: RankedApplication[],
        prevAccepted: RankedApplication[],
        reserve: RankedApplication[]
    }>('/api/admin/applications');

    if (loading || !authorized) return <LoadingPage/>;

    return (
        <div>
            <h1>Kandydaci</h1>
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
                        />
                    )}
                </>
            )}
        </div>
    );
}

export default ProfileCandidatesRank;
