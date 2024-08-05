import React from 'react';
import { Link } from 'react-router-dom';

import '../assets/css/Hero.css';

const Hero: React.FC = () => {
    return (
        <section className="hero">
            <h2>Witamy w systemie naboru do szkół ponadpodstawowych</h2>
            <p>Sprawdź naszą ofertę i złóż kandydaturę już dziś!</p>
            <button>
                <Link to="/apply">Aplikuj</Link>
            </button>
        </section>
    );
}

export default Hero;
