import React from 'react';
import {useFetch} from "../../shared/hooks/useFetch.ts";
import {Enrollment} from "../../shared/types/enrollment.ts";
import LoadingPage from "./LoadingPage.tsx";

const Dates: React.FC = () => {
    const {data: enrollments, loading} = useFetch<Enrollment[]>('api/deadlines')

    if (loading) return <LoadingPage/>;

    return (
        <div>
            <h1>Terminy</h1>
            {(!enrollments || (enrollments && enrollments.length === 0)) ? (
                <p> Terminy nie zostały jeszcze ogłoszone</p>
            ) : (
                <table>
                    <thead>
                    <tr>
                        <th>Tura</th>
                        <th>Data rozpoczęcia</th>
                        <th>Data zakończenia</th>
                    </tr>
                    </thead>
                    <tbody>
                    {enrollments.map((enrollment) => (
                        <tr key={enrollment.id}>
                            <td>{enrollment.round}</td>
                            <td>{new Date(enrollment.startDate).toLocaleDateString()}</td>
                            <td>{new Date(enrollment.endDate).toLocaleDateString()}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )
            }

        </div>
    );
}

export default Dates;
