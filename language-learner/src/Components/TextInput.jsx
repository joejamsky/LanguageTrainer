import React, {useState} from 'react';
// import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import "../Styles/TextInput.scss";
import { useGameState } from "../Contexts/GameStateContext.js";

const TextInput = () => {
    const [inputValue, setInputValue] = useState(''); // State to store input value

    const handleInputChange = (e) => {
        setInputValue(e.target.value); // Update state with new input value
    };

    const handleSubmit = (e) => {
        e.preventDefault(); // Prevent form submission (default behavior)
        console.log('Input Submitted:', inputValue); // Perform desired action with the input value
        setInputValue('')
    };

    return (
        <div className="text-input">
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={inputValue} // Controlled component
                    onChange={handleInputChange} // Handle input changes
                    placeholder="Type something..."
                    className="input-field"
                />
            </form>
        </div>
    );
};

export default TextInput;
