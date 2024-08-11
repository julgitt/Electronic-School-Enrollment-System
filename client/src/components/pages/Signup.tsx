import React from 'react';

import '../../assets/css/Form.css';
import { SignupForm } from '../organisms/SignupForm'

const Signup: React.FC = () => {
    return (
        <div className="signup-container">
            <section id="form">
                <SignupForm />
            </section>
        </div>
    );
};

export default Signup;
