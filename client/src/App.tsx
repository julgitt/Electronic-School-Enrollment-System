import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import './assets/css/styles.css'

import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dates from './pages/Dates'
import Apply from './pages/Apply'
import ApplicationStatus from './pages/ApplicationStatus'
import Footer from "./components/Footer"
import Header from "./components/Header"

function App(){
    return (
        <Router>
            <Header/>
            <section className="main-content">
                <Routes>
                    <Route path="/" element={<Home/>}/>
                    <Route path="/dates" element={<Dates/>}/>
                    <Route path="/apply" element={<Apply/>}/>
                    <Route path="/applicationStatus" element={<ApplicationStatus/>}/>
                    <Route path="/login" element={<Login/>}/>
                    <Route path="/signup" element={<Signup/>}/>
                </Routes>
            </section>
            <Footer/>
        </Router>
    );
}

export default App
