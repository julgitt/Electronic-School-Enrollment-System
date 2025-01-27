import React, {useState} from 'react';
import {useFetch} from "../../shared/hooks/useFetch.ts";
import LoadingPage from "../../app/routes/LoadingPage.tsx";
import {SuggestionBox} from "../../components/composite/SuggestionBox";
import {ProfileWithInfo} from "./types/profileWithInfo.ts";
import {Checkbox} from "../../components/atomic/Checkbox";
import styles from "../../assets/css/forms.module.scss";

interface Filters {
    criteriaSubjects: string[];
    name: string[];
    schoolName: string[];
}

const EducationalOffer: React.FC = () => {
    let {data: profiles, loading: profilesLoading} = useFetch<ProfileWithInfo[]>('api/profiles/info')
    const [filters, setFilters] = useState<Filters>({criteriaSubjects: [], name: [], schoolName: []});
    const [descSort, setDescSort] = useState<boolean>(false);
    const [ascSort, setAscSort] = useState<boolean>(false);

    if (profilesLoading) return <LoadingPage/>;
    if (!profiles) profiles = []

    const deleteFilter = (field: keyof Filters, value: string) => {
        setFilters(prevState => ({
            ...prevState,
            [field]: prevState[field].filter(item => item !== value),
        }));
    }

    const addFilter = (field: keyof Filters, value: string) => {
        if (filters[field].includes(value)) return;
        setFilters(prevState => ({
            ...prevState,
            [field]: [...prevState[field], value],
        }));
    }

    const handleSortChange = (asc: boolean, checked: boolean) => {
        if (checked) {
            setAscSort(asc)
            setDescSort(!asc)
        } else {
            setAscSort(ascSort && !asc)
            setDescSort(descSort && asc)
        }
    };

    return (
        <div>
            <h3>Filtry:</h3>
            {(Object.keys(filters) as Array<keyof typeof filters>).map(key => {
                const profilesFields = new Set(profiles?.flatMap(p => p[key]) || []);
                const filter = filters[key];
                return (
                    <>
                        <div className={styles.horizontalListing}>
                            {
                                filter.map(elem => (
                                    <div key={filter.indexOf(elem)}>
                                        <button onClick={() => deleteFilter(key, elem)}>{elem + " X"}</button>
                                    </div>
                                ))}
                        </div>

                        <SuggestionBox
                            placeholder={"dodaj filtrowanie " + (() => {
                                switch (key as string) {
                                    case 'criteriaSubjects':
                                        return "przedmiotu rekrutacyjnego";
                                    case 'schoolName':
                                        return "nazwy szkoły";
                                    case 'name':
                                        return "nazwy profilu";
                                }
                            })()}
                            suggestions={Array.from(profilesFields)}
                            onSelect={selectedName => {
                                if (profilesFields.has(selectedName))
                                    addFilter(key, selectedName)
                            }}
                        />
                    </>
                )
            })}
            <h3>Sortowanie:</h3>
            <div className={styles.selectionElement}>
                <Checkbox
                    checked={ascSort}
                    onChange={(event) => handleSortChange(true, event.target.checked)}
                    itemName={"Sortuj rosnąco po popularności"}
                />
                <Checkbox
                    checked={descSort}
                    onChange={(event) => handleSortChange(false, event.target.checked)}
                    itemName={"Sortuj malejąco po popularności"}
                />
            </div>

            <h3>Wyniki:</h3>
            <table>
                <thead>
                <tr>
                    <th>Nazwa profilu</th>
                    <th>Nazwa Szkoły</th>
                    <th>Liczba kandydatów</th>
                </tr>
                </thead>
                <tbody>
                {profiles.filter(p => {
                    let result = true;
                    if (filters.name.length > 0)
                        result = result && filters.name.some(n => n === p.name);
                    if (filters.criteriaSubjects.length > 0)
                        result = result && filters.criteriaSubjects.every(c => p.criteriaSubjects.includes(c));
                    if (filters.schoolName.length > 0)
                        result = result && filters.schoolName.some(s => p.schoolName === s);
                    return result;
                }).sort((a, b) => {
                    if (ascSort)
                        return b.applicationNumber - a.applicationNumber
                    else if (descSort)
                        return a.applicationNumber - b.applicationNumber
                    else
                        return a.applicationNumber
                }).map(p => (
                        <tr key={p.id}>
                            <td>{p.name}</td>
                            <td>{p.schoolName}</td>
                            <td>{p.applicationNumber}</td>
                        </tr>
                    )
                )}
                </tbody>
            </table>
        </div>
    );
}

export default EducationalOffer;
