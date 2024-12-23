import React, {useState} from 'react';
// import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import "../Styles/TextInput.scss";
import { useGameState } from "../Contexts/GameStateContext.js";

const TextInput = () => {
    // const [inputValue, setInputValue] = useState(''); // State to store input value
    const { textInput, setTextInput } = useGameState(); // Correct usage without arguments


    const handleInputChange = (e) => {
        setTextInput(e.target.value); // Update state with new input value
    };

    const handleSubmit = (e) => {
        e.preventDefault(); // Prevent form submission (default behavior)
        setTextInput('')
        console.log('Input Submitted:', textInput); // Perform desired action with the input value
    };

    return (
        <div className="text-input">
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={textInput} // Controlled component
                    onChange={handleInputChange} // Handle input changes
                    placeholder="Type something..."
                    className="input-field"
                />
            </form>
        </div>
    );
};

export default TextInput;
