import { Route, Routes } from 'react-router-dom';
import Home from '../components/pages/Home';
import Login from '../components/pages/Login';
import Signup from '../components/pages/Signup';
import Dates from '../components/pages/Dates';
import Apply from '../components/pages/Apply';
import ApplicationStatus from '../components/pages/ApplicationStatus';
import ApplicationSubmitted from "../components/pages/ApplicationSubmitted.tsx";

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
