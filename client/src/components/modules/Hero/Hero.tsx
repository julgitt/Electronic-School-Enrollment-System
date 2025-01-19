import React from 'react';
import {Link} from 'react-router-dom';

import {Button} from '../../atomic/Button';
import './Hero.module.scss';

const Hero: React.FC = () => {
    return (
        <section className="hero">
            <h1>Witamy w systemie naboru do szkół ponadpodstawowych</h1>
            <p>Sprawdź naszą ofertę i złóż wniosek już dziś!</p>
            <Button>
                <Link to="/submitApplication">Aplikuj</Link>
            </Button>
        </section>
    );
}

export default Hero;
