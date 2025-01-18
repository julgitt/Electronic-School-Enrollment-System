import React from 'react';
import {Link} from 'react-router-dom';

import {Button} from '../../atomic/Button';
import './Hero.module.scss';

const Hero: React.FC = () => {
    return (
        <section className="hero">
            <h2>Witamy w systemie naboru do szkół ponadpodstawowych</h2>
            <p>Sprawdź naszą ofertę i złóż wniosek już dziś!</p>
            <Button>
                <Link to="/submitApplication">Aplikuj</Link>
            </Button>
        </section>
    );
}

export default Hero;
