import React from 'react';
import '../assets/css/Hero.css';

const Hero: React.FC = () => {
    return (
        <section className="hero">
            <h2>Witamy w systemie naboru do szkół ponadpodstawowych</h2>
            <p>Sprawdź naszą ofertę i złóż kandydaturę już dziś!</p>
            <button className="cta-button">Złóż kandydaturę</button>
        </section>
    );
}

export default Hero;
