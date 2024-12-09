import React from 'react';
import {NavLink as Link} from "react-router-dom";

const SubmitApplicationPastDeadline: React.FC = () => {

    return (
        <div>
            <h2>
                Termin składania aplikacji już minął. Możesz zobaczyć status złożonych aplikacji klikając w poniższy
                przycisk
            </h2>
            <Link
                to={`/ApplicationStatus`}
            >
                Status aplikacji
            </Link>
        </div>
    );
};

export default SubmitApplicationPastDeadline;
