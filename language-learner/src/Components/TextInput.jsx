import React, {useState} from 'react';
// import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import "../Styles/TextInput.scss";
import { useGameState } from "../Contexts/GameStateContext.js";

const TextInput = () => {
    const {handleTextSubmit} = useGameState();
    const [textInput, setTextInput] = useState('');



    const handleInputChange = (e) => {
        setTextInput(e.target.value); // Update state with new input value
    };

    const handleSubmit = (e) => {
        e.preventDefault(); // Prevent form submission (default behavior)
        handleTextSubmit(textInput)
        setTextInput('')
    };

    return (
        <div className="text-input">
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={textInput} 
                    onChange={handleInputChange} // Handle input changes
                    placeholder=""
                    className="input-field"
                />
            </form>
        </div>
    );
};

export default TextInput;
