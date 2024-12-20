import React from 'react';

interface SuccessMessageProps {
    message: string;
}

const SuccessMessage: React.FC<SuccessMessageProps> = ({message}) => {
    return (
        <div style={{
            marginTop: '10px',
            padding: '10px',
            backgroundColor: 'lightgreen',
            color: 'darkgreen',
            border: '1px solid green',
            borderRadius: '5px',
        }}>
            {message}
        </div>
    );
};

export default SuccessMessage;
