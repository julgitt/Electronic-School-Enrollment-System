import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './assets/css/style.css'
import Navbar from './components/Navbar.tsx'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'

function App() {
    return (
        <Router>
            <div id="root-container">
                <Navbar/>
                <main>
                <Routes>
                    <Route path="/" element={<Home/>}/>
                    <Route path="/login" element={<Login/>}/>
                    <Route path="/signup" element={<Signup/>}/>
                </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App
