import React, {useState} from 'react';
import "../Styles/TextInput.scss";
import { useGameState } from "../Contexts/GameStateContext.js";

const TextInput = () => {
    const {handleTextSubmit, setOptions} = useGameState();
    const [textInput, setTextInput] = useState('');
    const [shakeTimer, setShakeTimer] = useState(false);

    const handleInputChange = (e) => {
        setTextInput(e.target.value); // Update state with new input value
    };

    const handleSubmit = (e) => {
        e.preventDefault(); // Prevent form submission (default behavior)
        if(handleTextSubmit(textInput) === -1){
            setShakeTimer(true)

            setTimeout(() => {
                setShakeTimer(false)
            }, 500); 
        }
        setTextInput('')
    };

    const handleKeyPress = (event) => {
        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    
        if (event.shiftKey && (isMac ? event.metaKey : event.ctrlKey)) {
            event.preventDefault();
            console.log('Shift + Command (Mac) or Shift + Ctrl (Windows) pressed!');
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
        <div className={shakeTimer ? "text-input shake" : "text-input"}>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={textInput} 
                    onKeyDown={handleKeyPress} // Add listener to the input
                    onKeyUp={handleKeyUp}
                    onChange={handleInputChange} // Handle input changes
                    placeholder=""
                    className="input-field"
                />
            </form>
        </div>
    );
};

export default TextInput;
