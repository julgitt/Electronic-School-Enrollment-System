import { Route, Routes } from 'react-router-dom';
import Home from '../components/pages/main/Home.tsx';
import Login from '../components/pages/user/Login.tsx';
import Signup from '../components/pages/user/Signup.tsx';
import Dates from '../components/pages/main/Dates.tsx';
import Apply from '../components/pages/application/Apply.tsx';
import ApplicationStatus from '../components/pages/application/ApplicationStatus.tsx';
import ApplicationSubmitted from "../components/pages/application/ApplicationSubmitted.tsx";

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dates" element={<Dates />} />
            <Route path="/apply" element={<Apply />} />
            <Route path="/applicationStatus" element={<ApplicationStatus />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/applySubmitted" element={<ApplicationSubmitted />} />
        </Routes>
    );
};

export default AppRoutes;
