import { Route, Routes } from 'react-router-dom';
import Home from './routes/Home.tsx';
import Dates from './routes/Dates.tsx';
import SubmitApplication from '../features/SubmitApplication/SubmitApplication.tsx';
import ApplicationStatus from './routes/ApplicationStatus.tsx';
import ApplicationSubmitted from "./routes/ApplicationSubmitted.tsx";
import { Login } from "../features/auth/Login";
import { Signup } from "../features/auth/Signup";
import ErrorPage from "./routes/ErrorPage.tsx";

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dates" element={<Dates />} />
            <Route path="/submitApplication" element={<SubmitApplication />} />
            <Route path="/applicationStatus" element={<ApplicationStatus />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/applicationSubmitted" element={<ApplicationSubmitted />} />
            <Route path="*" element={<ErrorPage errorMessage={"404: Page Not Found"}/>} />
        </Routes>
    );
};

export default AppRoutes;
