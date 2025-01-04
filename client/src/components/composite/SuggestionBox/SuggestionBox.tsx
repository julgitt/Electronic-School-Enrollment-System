import React, {useState} from 'react';

import {InputField} from "../../atomic/InputField";
import styles from './SuggestionBox.module.scss';

interface SuggestionBoxProps {
    placeholder: string;
    suggestions: string[];
    defaultValue?: string;
    onChange: (suggestion: string) => void;
}

const SuggestionBox: React.FC<SuggestionBoxProps> = React.memo(({
                                                                    placeholder,
                                                                    defaultValue,
                                                                    suggestions,
                                                                    onChange,
                                                                }) => {
    const [value, setValue] = useState<string>(defaultValue || '');
    const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>(suggestions);
    const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

    const handleChange = (value: string) => {
        const filtered = (value.length > 0)
            ? suggestions.filter((suggestion) =>
                suggestion.toLowerCase().includes(value.toLowerCase())
            )
            : suggestions

        if (filtered.length > 0) {
            setFilteredSuggestions(filtered);
            setValue(value);
            onChange(value);
        }
    };

    const handleSelect = (value: string) => {
        setValue(value);
        setShowSuggestions(false)
        onChange(value);
    }

    return (
        <div className={styles.suggestionBoxContainer}>
            <InputField
                type="text"
                value={value}
                placeholder={placeholder}
                onChange={event => handleChange(event.target.value)}
                onFocus={_event => {
                    handleChange(value);
                    setShowSuggestions(true);
                }}
                onBlur={_event => setTimeout(() => setShowSuggestions(false), 500)}
            />
            {showSuggestions && (
                <ul className={styles.suggestionsList}>
                    {filteredSuggestions.map((suggestion, index) => (
                        <li
                            key={index}
                            className={styles.suggestionItem}
                            onClick={() => handleSelect(suggestion)}
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
