import React, { useState, ChangeEvent } from 'react';
import '../assets/css/SuggestionBox.css';

interface SuggestionBoxProps {
    placeholder: string;
    suggestions: string[];
    onSuggestionSelected: (suggestion: string) => void;
}

const SuggestionBox: React.FC<SuggestionBoxProps> = ({ placeholder, suggestions, onSuggestionSelected }) => {
    const [query, setQuery] = useState<string>('');
    const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const userInput = e.target.value;
        setQuery(userInput);

        if (userInput.length > 0) {
            const filtered = suggestions.filter((suggestion) =>
                suggestion.toLowerCase().includes(userInput.toLowerCase())
            );
            setFilteredSuggestions(filtered);
            setShowSuggestions(true);
        } else {
            setFilteredSuggestions([]);
            setShowSuggestions(false);
        }
    };

    const handleSuggestionClick = (suggestion: string) => {
        setQuery(suggestion);
        setFilteredSuggestions([]);
        setShowSuggestions(false);
        onSuggestionSelected(suggestion);
    };

    return (
        <div className="suggestion-box-container">
            <input
                type="text"
                className="input"
                value={query}
                placeholder={placeholder}
                onChange={handleChange}
            />
            {showSuggestions && (
                <ul className="suggestions-list">
                    {filteredSuggestions.map((suggestion, index) => (
                        <li
                            key={index}
                            className="suggestion-item"
                            onClick={() => handleSuggestionClick(suggestion)}
                        >
                            {suggestion}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default SuggestionBox;
