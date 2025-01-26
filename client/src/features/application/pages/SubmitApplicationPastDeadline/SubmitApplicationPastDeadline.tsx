import React from 'react';
import {NavLink as Link} from "react-router-dom";
import {Button} from "../../../../components/atomic/Button";

const SubmitApplicationPastDeadline: React.FC = () => {

    return (
        <div>
            <h2>
                Termin składania aplikacji już minął. Możesz zobaczyć status złożonych aplikacji klikając w poniższy
                przycisk
            </h2>
            <Button>
                <Link to="/ApplicationStatus">Status Aplikacji</Link>
            </Button>
        </div>
    );
};

export default SubmitApplicationPastDeadline;
