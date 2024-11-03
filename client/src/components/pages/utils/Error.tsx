import React from "react";

interface ErrorProps {
    errorMessage: string;
}

const Error: React.FC<ErrorProps> = ({ errorMessage }) => {
    return <div>{errorMessage}</div>;
}

export default Error;
