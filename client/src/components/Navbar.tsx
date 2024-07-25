import React, {useEffect, useState} from 'react'
import { NavLink as Link } from 'react-router-dom';
import '../assets/css/Navbar.css';

interface User {
    username: string;
}

const Navbar: React.FC = () => {
    const [user, setUser] = useState<User | null>(null)

    useEffect(() => {
        fetch('/api/data')
            .then((response) => response.json())
            .then((user: User) => setUser(user));
    }, []);

    const handleLogout = () => {
        setUser(null);
    };

    return (
        <nav className="nav">
            <div className="nav-menu">
                <Link className="nav-link" to="/">System naboru do szkół</Link>
                <Link className="nav-link" to="/login">Terminy</Link>
                {user && (
                    <Link className="nav-link" to="/login">Złóż kandydaturę</Link>
                )}
            </div>
            {user ? (
                <div className="nav-menu">
                    <Link className="nav-link" to="/login">{user.username}</Link>
                    <Link className="nav-link" to="/signup">Status Aplikacji</Link>
                    <button className="nav-link" onClick={handleLogout}>Wyloguj</button>
                </div>
            ) : (
                <div className="nav-menu">
                <Link className="nav-link" to="/login">Zaloguj się</Link>
                    <Link className="nav-link" to="/signup">Zarejestruj się</Link>
                </div>
            )}
        </nav>
    );
}

export default Navbar;
