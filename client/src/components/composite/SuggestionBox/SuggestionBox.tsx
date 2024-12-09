import React, {useState} from 'react';

import {InputField} from "../../atomic/InputField";
import styles from './SuggestionBox.module.scss';

interface SuggestionBoxProps {
    placeholder: string;
    suggestions: string[];
    defaultValue?: string;
    onSuggestionSelected: (suggestion: string) => void;
}

const SuggestionBox: React.FC<SuggestionBoxProps> = React.memo(({
                                                                    placeholder,
                                                                    defaultValue,
                                                                    suggestions,
                                                                    onSuggestionSelected
                                                                }) => {
    const [query, setQuery] = useState<string>(defaultValue || '');
    const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

    const handleChange = (value: string) => {
        setQuery(value);

        if (value.length > 0) {
            const filtered = suggestions.filter((suggestion) =>
                suggestion.toLowerCase().includes(value.toLowerCase())
            );
            setFilteredSuggestions(filtered);
            setShowSuggestions(true);
        } else {
            setFilteredSuggestions([]);
            setShowSuggestions(false);
            onSuggestionSelected('');
        }
    };

    const handleSuggestionClick = (suggestion: string) => {
        setQuery(suggestion);
        setFilteredSuggestions([]);
        setShowSuggestions(false);
        onSuggestionSelected(suggestion);
    };

    return (
        <div className={styles.suggestionBoxContainer}>
            <InputField
                type="text"
                value={query}
                placeholder={placeholder}
                onChange={(event) => {
                    handleChange(event.target.value)
                }}
            />
            {showSuggestions && (
                <ul className={styles.suggestionsList}>
                    {filteredSuggestions.map((suggestion, index) => (
                        <li
                            key={index}
                            className={styles.suggestionItem}
                            onClick={() => handleSuggestionClick(suggestion)}
                        >
                            {suggestion}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
});

export default SuggestionBox;
