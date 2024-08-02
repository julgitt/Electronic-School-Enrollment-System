import React, {useEffect, useState} from 'react'
import { NavLink as Link } from 'react-router-dom';
import '../assets/css/Header.css';

interface User {
    username: string;
}

const Header: React.FC = () => {
    const [user, setUser] = useState<User | null>(null)

    useEffect(() => {
        fetch('/api/user', {
            credentials: 'include'
        })
        .then((response) => {
            if (response.ok) {
                return response.json();
            } else {
                return null;
            }
        })
        .then((user: User | null) => setUser(user))
        .catch((error) => console.error('Error fetching user:', error));
    }, []);

    const handleLogout = async (event: React.MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();

        const response = await fetch('/api/logout', {
            method: 'GET',
            credentials: 'include'
        });

        if (response.ok) {
            window.location.href = '/';
        } else {
            console.error('Logout failed');
        }
    };

    return (
        <header className="header">
            <nav className="nav">
                <div className="nav-menu">
                    <Link className="nav-link" to="/">System naboru do szkół</Link>
                    <Link className="nav-link" to="/dates">Terminy</Link>
                    {user && (
                        <Link className="nav-link" to="/apply">Złóż kandydaturę</Link>
                    )}
                </div>
                {user ? (
                    <div className="nav-menu">
                        <Link className="nav-link" to="/">{user.username}</Link>
                        <Link className="nav-link" to="/aplicationStatus">Status Aplikacji</Link>
                        <Link className="nav-link" to="/logout" onClick={handleLogout}>Wyloguj</Link>
                    </div>
                ) : (
                    <div className="nav-menu">
                        <Link className="nav-link" to="/login">Zaloguj się</Link>
                        <Link className="nav-link" to="/signup">Zarejestruj się</Link>
                    </div>
                )}
            </nav>
        </header>
    );
}

export default Header;
