import React, {useState} from 'react';

import {useFetch} from "../../../../shared/hooks/useFetch.ts";

import LoadingPage from "../../../../app/routes/LoadingPage.tsx";
import {SubmitApplicationPastDeadline} from "../../../application/pages/SubmitApplicationPastDeadline";
import {useDeadlineCheck} from "../../../../shared/hooks/useDeadlineCheck.ts";
import {SuggestionBox} from "../../../../components/composite/SuggestionBox";
import {SchoolWithProfiles} from "../../../../shared/types/schoolWithProfiles.ts";
import {ProfileSelection} from "../../../application/types/profilesSelection.ts";
import {Button} from "../../../../components/atomic/Button"

import styles from "../../../../assets/css/forms.module.scss";
import {getPoints} from "../../../../shared/services/profileService.ts";
import {ErrorMessage} from "../../../../components/atomic/ErrorMessage";
import {ProfileCriteriaType} from "../../../schoolAdmin/types/profileRequest.ts";
import {PointsInfo} from "../../types/pointsInfo.ts";

const CalculatePoints: React.FC = () => {
    let {data: suggestions, loading: schoolLoading} = useFetch<SchoolWithProfiles[]>('/api/schools');
    const {isPastDeadline, loading: deadlineLoading} = useDeadlineCheck();
    const [selection, setSelection] = useState<ProfileSelection>({school: null, profile: null});
    const [pointsInfo, setPointsInfo] = useState<PointsInfo | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    if (isPastDeadline) return <SubmitApplicationPastDeadline/>;
    if (deadlineLoading || schoolLoading) return <LoadingPage/>
    if (!suggestions) suggestions = []

    const onSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError(null);
        setLoading(true);
        const profileId = selection.profile?.id || null;
        if (!profileId) {
            setError("Prosze wybrać szkołę oraz profil.");
            return;
        }

        try {
            const data: PointsInfo = await getPoints(profileId);
            setPointsInfo(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form method="GET" onSubmit={onSubmit} className={styles.form}>
            {error && <ErrorMessage message={error}/>}

            <div className={styles.formInputGroup}>
                <h3> Przelicznik punktów rekrutacyjnych </h3>
                <SuggestionBox
                    placeholder="Szkoła"
                    suggestions={suggestions.map(s => s.name)}
                    defaultValue={selection.school?.name || ''}
                    onChange={selectedName => {
                        const selectedSchool = suggestions.find((s) => s.name === selectedName) || null;
                        if (selection.school?.name !== selectedName) {
                            setSelection({
                                school: selectedSchool,
                                profile: null
                            });
                            setPointsInfo(null)
                        }
                    }}
                />
                {selection.school &&
                    <SuggestionBox
                        placeholder="Profil"
                        suggestions={selection.school.profiles.map(p => p.name)}
                        defaultValue={selection.profile?.name || ''}
                        onChange={selectedName => {
                            const selectedProfile = selection.school?.profiles.find((p) => p.name === selectedName) || null;
                            if (selection.profile?.name !== selectedName) setSelection({
                                school: selection.school,
                                profile: selectedProfile
                            });
                        }}
                    />
                }
            </div>
            {pointsInfo && <h4> Oceny ze świadectwa: </h4>}
            {pointsInfo && pointsInfo.gradesInfo.map((gradeInfo) => (
                <div key={gradeInfo.subject} className={styles.horizontal2}>
                    <h6>{gradeInfo.subject}</h6>
                    <h6>{gradeInfo.grade}</h6>
                    <h6>{gradeInfo.type === ProfileCriteriaType.Alternative ? "Opcjonalne" : "Wymagane"}</h6>
                </div>
            ))}
            {pointsInfo && <h4>Punkty: {pointsInfo.points}</h4>}
            <Button type={"submit"} disabled={loading}>
                Oblicz punkty
            </Button>
        </form>
    );
};

export default CalculatePoints;
