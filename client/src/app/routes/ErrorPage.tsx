import React from "react";

interface ErrorProps {
    errorMessage: string;
}

const ErrorPage: React.FC<ErrorProps> = ({ errorMessage }) => {
    return <div>{errorMessage}</div>;
}

export default ErrorPage;
