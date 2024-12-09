import {Route, Routes} from 'react-router-dom';

import Home from './routes/Home.tsx';
import Dates from './routes/Dates.tsx';

import ErrorPage from "./routes/ErrorPage.tsx";

import {SubmitApplication} from '../features/application/pages/SubmitApplication';
import {Login} from "../features/auth/pages/Login";
import {RegisterCandidate} from "../features/candidate/pages/RegisterCandidate";
import {Signup} from "../features/auth/pages/Signup";
import {ApplicationStatus} from '../features/application/pages/ApplicationStatus';
import {ApplicationSubmitted} from "../features/application/pages/ApplicationSubmitted";
import {SubmitApplicationPastDeadline} from "../features/application/pages/SubmitApplicationPastDeadline";
import SubmitGrades from "../features/grades/pages/SubmitGrades.tsx";

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Home/>}/>
            <Route path="/dates" element={<Dates/>}/>
            <Route path="/submitApplication" element={<SubmitApplication/>}/>
            <Route path="/applicationStatus" element={<ApplicationStatus/>}/>
            <Route path="/login" element={<Login/>}/>
            <Route path="/signup" element={<Signup/>}/>
            <Route path="/registerCandidate" element={<RegisterCandidate/>}/>
            <Route path="/applicationSubmitted" element={<ApplicationSubmitted/>}/>
            <Route path="/submitApplicationPastDeadline" element={<SubmitApplicationPastDeadline/>}/>
            <Route path="/submitGrades" element={<SubmitGrades/>}/>
            <Route path="*" element={<ErrorPage errorMessage={"404: Page Not Found"}/>}/>
        </Routes>
    );
};

export default AppRoutes;
