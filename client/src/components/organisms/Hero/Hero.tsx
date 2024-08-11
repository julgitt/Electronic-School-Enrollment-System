import React from 'react';
import { Link } from 'react-router-dom';

import { Button } from '../../atoms/Button';
import './Hero.module.scss';

const Hero: React.FC = () => {
    return (
        <section className="hero">
            <h2>Witamy w systemie naboru do szkół ponadpodstawowych</h2>
            <p>Sprawdź naszą ofertę i złóż kandydaturę już dziś!</p>
            <Button>
                <Link to="/apply">Aplikuj</Link>
            </Button>
        </section>
    );
}

export default Hero;
