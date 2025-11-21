import React, { useEffect, useRef, useState } from 'react';
import "../Styles/TextInput.scss";
import { useGameState } from "../Contexts/GameStateContext.js";

const TextInput = ({ targetTileId = null, completionDelayMs = 0 }) => {
    const {handleTextSubmit, setOptions, currentLevel, inputFocusKey} = useGameState();
    const [textInput, setTextInput] = useState('');
    const [shakeTimer, setShakeTimer] = useState(false);
    const [placeholderVisible, setPlaceholderVisible] = useState(true);
    const inputRef = useRef(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, [currentLevel?.key, inputFocusKey]);

    const handleInputChange = (e) => {
        if (placeholderVisible && e.target.value.length > 0) {
            setPlaceholderVisible(false);
        }
        setTextInput(e.target.value); // Update state with new input value
    };

    const handleSubmit = (e) => {
        e.preventDefault(); // Prevent form submission (default behavior)
        const submissionResult = handleTextSubmit(textInput, targetTileId, {
            delayCompletionMs: completionDelayMs
        });
        if(submissionResult === -1){
            setShakeTimer(true)

            setTimeout(() => {
                setShakeTimer(false)
            }, 500); 
        }
        setTextInput('')
        setPlaceholderVisible(false);
    };

    const handleKeyPress = (event) => {
        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    
        if (event.shiftKey && (isMac ? event.metaKey : event.ctrlKey)) {
            event.preventDefault();
            // console.log('Shift + Command (Mac) or Shift + Ctrl (Windows) pressed!');
            // Add your custom logic here

            setOptions((prevOptions) => ({
                ...prevOptions, // Spread the existing options
                hints: true
              }));
        }
    };

    const handleKeyUp = (event) => {
        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    
        if (event.shiftKey === false || (isMac ? event.metaKey === false : event.ctrlKey === false)) {
          setOptions((prevOptions) => ({
            ...prevOptions,
            hints: false
          }));
        }
      };
    

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                value={textInput} 
                onKeyDown={handleKeyPress} // Add listener to the input
                onKeyUp={handleKeyUp}
                onChange={handleInputChange} // Handle input changes
                placeholder={placeholderVisible ? "Enter romaji" : ""}
                className={shakeTimer ? "shake input-field" : "input-field"}
                ref={inputRef}
            />
        </form>
    );
};

export default TextInput;
