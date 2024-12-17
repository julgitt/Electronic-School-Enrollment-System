import {Route, Routes, useLocation} from 'react-router-dom';

import Home from './routes/Home.tsx';
import Deadlines from './routes/Deadlines.tsx';

import ErrorPage from "./routes/ErrorPage.tsx";

import {SubmitApplication} from '../features/application/pages/SubmitApplication';
import {Login} from "../features/auth/pages/Login";
import {RegisterCandidate} from "../features/candidate/pages/RegisterCandidate";
import {Signup} from "../features/auth/pages/Signup";
import {ApplicationStatus} from '../features/application/pages/ApplicationStatus';
import {ApplicationSubmitted} from "../features/application/pages/ApplicationSubmitted";
import {SubmitApplicationPastDeadline} from "../features/application/pages/SubmitApplicationPastDeadline";
import SubmitGrades from "../features/grades/pages/SubmitGrades.tsx";
import Enroll from "../features/admin/Enroll.tsx";
import {useError} from "../shared/providers/errorProvider.tsx";
import {useEffect} from "react";
import EditSchools from "../features/admin/EditSchools.tsx";
import EditDeadlines from "../features/admin/EditDeadlines.tsx";
import EditProfiles from "../features/schoolAdmin/EditProfiles.tsx";
import SchoolApplications from "../features/schoolAdmin/SchoolApplications.tsx";

const AppRoutes = () => {
    const {setError, error} = useError();
    const location = useLocation();

    useEffect(() => {
        setError(null);
    }, [location, setError]);


    if (error) {
        return <ErrorPage errorMessage={error}/>;
    }

    return (
        <Routes>
            {/* guest */}
            <Route path="/" element={<Home/>}/>
            <Route path="/dates" element={<Deadlines/>}/>
            <Route path="/login" element={<Login/>}/>
            <Route path="/signup" element={<Signup/>}/>
            {/* user */}
            <Route path="/registerCandidate" element={<RegisterCandidate/>}/>
            <Route path="/submitApplication" element={<SubmitApplication/>}/>
            <Route path="/applicationStatus" element={<ApplicationStatus/>}/>
            <Route path="/applicationSubmitted" element={<ApplicationSubmitted/>}/>
            <Route path="/submitApplicationPastDeadline" element={<SubmitApplicationPastDeadline/>}/>
            <Route path="/submitGrades" element={<SubmitGrades/>}/>
            {/* admin */}
            <Route path="/enroll" element={<Enroll/>}/>
            <Route path="/editSchools" element={<EditSchools/>}/>
            <Route path="/editDeadlines" element={<EditDeadlines/>}/>
            {/* school admin */}
            <Route path="/editProfiles" element={<EditProfiles/>}/>
            <Route path="/schoolApplications" element={<SchoolApplications/>}/>

            <Route path="*" element={<ErrorPage errorMessage={"404: Page Not Found"}/>}/>
        </Routes>
    );
};

export default AppRoutes;
