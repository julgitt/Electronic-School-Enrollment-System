import React from 'react'
import { FaBars } from 'react-icons/fa';
import { NavLink as Link } from 'react-router-dom';
import './Navbar.css';

const Navbar: React.FC = () => {
    return (
        <nav className="nav">
            <div className="bars">
                <FaBars />
            </div>
            <div className="nav-menu">
                <Link className="nav-link" to="/">Home</Link>
                <Link className="nav-link" to="/login">Login</Link>
            </div>
        </nav>
    );
}

export default Navbar;
