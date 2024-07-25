import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './assets/css/styles.css'
import './assets/css/Hero.css'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dates from './pages/Dates'
import Apply from './pages/Apply'
import ApplicationStatus from './pages/ApplicationStatus'
import Footer from "./components/Footer.tsx"
import Header from "./components/Header.tsx"

function App(){
    return (
        <Router>
            <Header/>
            <section className="hero">
                <Routes>
                    <Route path="/" element={<Home/>}/>
                    <Route path="/login" element={<Login/>}/>
                    <Route path="/signup" element={<Signup/>}/>
                    <Route path="/dates" element={<Dates/>}/>
                    <Route path="/apply" element={<Apply/>}/>
                    <Route path="/applicationStatus" element={<ApplicationStatus/>}/>
                </Routes>
            </section>
            <Footer/>
        </Router>
    );
}

export default App
